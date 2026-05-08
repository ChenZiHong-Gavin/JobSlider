"""
通用知识提取器
扫描任意文件夹的 .md/.txt 文件，调用 LLM 生成高质量 Q&A 卡片（含干扰选项）
"""
import os
import re
import json
import hashlib
import asyncio
from pathlib import Path
from typing import List, Dict, Optional
from dataclasses import dataclass, field

import httpx


SYSTEM_PROMPT = """你是一名资深技术面试官和教育专家。你的任务是根据提供的技术文档内容，生成高质量的间隔重复学习卡片。

## 生成规则

### 问题要求
- 问题必须**具体**，直接考察文档中的核心知识点
- 禁止使用"什么是X？"、"请解释X"这类笼统问题
- 好的问题示例："Transformer 中 Multi-Head Attention 相比 Single-Head Attention 的主要优势是什么？"
- 坏的问题示例："什么是 Attention？"
- 问题应该能区分真正理解概念的人和只知道名词的人

### 答案要求
- 答案必须包含**具体的技术细节**（公式、数值、对比、步骤）
- 使用 Markdown 格式，善用列表和加粗突出关键点
- 答案长度适中：50-300 字

### 干扰选项要求（distractors）
- 每题生成 3 个干扰选项，作为选择题的错误答案
- 每个干扰项是一句话的摘要（30-80字）
- 干扰项必须与问题**高度相关**但**明确错误**
- 干扰项的错误方式：张冠李戴、因果倒置、夸大/缩小、混淆相似概念
- 正确答案的摘要会自动从 answer 中提取，你不需要提供
- 禁止使用"以上都不对"这类选项

### 难度判断
- easy: 基础定义、直接记忆
- medium: 需要理解原理、对比分析
- hard: 需要综合多个概念、涉及实现细节

## 输出格式

严格输出 JSON 数组，不要任何其他文字：
```json
[
  {
    "question": "具体的问题",
    "answer": "详细的答案（Markdown）",
    "difficulty": "easy|medium|hard",
    "question_type": "concept|comparison|code|scenario",
    "tags": ["标签1", "标签2"],
    "distractors": [
      "干扰项1：看起来合理但错误的描述",
      "干扰项2：混淆相似概念的描述",
      "干扰项3：因果倒置或夸大的描述"
    ]
  }
]
```

如果内容太短或无实质知识点，返回空数组 []。"""


@dataclass
class ExtractionProgress:
    total_files: int = 0
    processed_files: int = 0
    total_cards: int = 0
    current_file: str = ""
    status: str = "pending"
    error: Optional[str] = None


@dataclass
class ExtractionTask:
    task_id: str
    progress: ExtractionProgress = field(default_factory=ExtractionProgress)
    cards: List[Dict] = field(default_factory=list)


_tasks: Dict[str, ExtractionTask] = {}


def _generate_id(content: str) -> str:
    return hashlib.md5(content.encode()).hexdigest()[:12]


def _split_markdown(content: str, file_path: str) -> List[Dict[str, str]]:
    """按标题层级切分 Markdown，保留父标题作为上下文"""
    # 提取文档标题
    title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    doc_title = title_match.group(1).strip() if title_match else Path(file_path).stem

    sections = []
    current_h2 = ""
    current_body = []

    for line in content.split('\n'):
        h2_match = re.match(r'^## (.+)$', line)
        h3_match = re.match(r'^### (.+)$', line)

        if h2_match:
            # flush previous section
            if current_body:
                body_text = '\n'.join(current_body).strip()
                if len(body_text) > 50:
                    ctx = f"[文档: {doc_title}]"
                    if current_h2:
                        ctx += f" [章节: {current_h2}]"
                    sections.append({"context": ctx, "title": current_h2 or doc_title, "content": body_text})
                current_body = []
            current_h2 = h2_match.group(1).strip()
        elif h3_match:
            # flush accumulated body as a section under current h2
            if current_body:
                body_text = '\n'.join(current_body).strip()
                if len(body_text) > 50:
                    ctx = f"[文档: {doc_title}]"
                    if current_h2:
                        ctx += f" [章节: {current_h2}]"
                    sections.append({"context": ctx, "title": current_h2 or doc_title, "content": body_text})
                current_body = []
            # start new subsection with h3 as part of content
            current_body.append(line)
        else:
            if not re.match(r'^# ', line):
                current_body.append(line)

    # flush last section
    if current_body:
        body_text = '\n'.join(current_body).strip()
        if len(body_text) > 50:
            ctx = f"[文档: {doc_title}]"
            if current_h2:
                ctx += f" [章节: {current_h2}]"
            sections.append({"context": ctx, "title": current_h2 or doc_title, "content": body_text})

    # if no sections found (no ## headings), treat whole doc as one section
    if not sections:
        stripped = re.sub(r'^# .+\n', '', content).strip()
        if len(stripped) > 50:
            sections.append({"context": f"[文档: {doc_title}]", "title": doc_title, "content": stripped})

    return sections


def _split_txt(content: str, file_path: str) -> List[Dict[str, str]]:
    """按段落分组切分 TXT，每 3-5 段为一组"""
    doc_title = Path(file_path).stem
    paragraphs = [p.strip() for p in re.split(r'\n\s*\n', content) if len(p.strip()) > 20]

    sections = []
    group_size = 4
    for i in range(0, len(paragraphs), group_size):
        group = paragraphs[i:i + group_size]
        body = '\n\n'.join(group)
        if len(body) > 50:
            sections.append({
                "context": f"[文档: {doc_title}]",
                "title": f"{doc_title} - 第{i // group_size + 1}部分",
                "content": body,
            })
    return sections


def scan_folder(folder_path: str) -> List[Dict[str, str]]:
    """扫描文件夹，返回 [{path, content, ext}]"""
    files = []
    folder = Path(folder_path)
    if not folder.is_dir():
        raise ValueError(f"路径不存在或不是文件夹: {folder_path}")

    for ext in ("*.md", "*.txt"):
        for f in folder.rglob(ext):
            if f.name in ("README.md", "SUMMARY.md"):
                continue
            if ".git" in f.parts:
                continue
            try:
                content = f.read_text(encoding="utf-8")
                if len(content.strip()) > 50:
                    files.append({"path": str(f), "content": content, "ext": f.suffix})
            except Exception:
                continue
    return files


async def _call_llm(text: str) -> List[Dict]:
    """调用 OpenAI 兼容 API 生成卡片"""
    api_base = os.environ.get("OPENAI_BASE_URL", os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1"))
    api_key = os.environ.get("OPENAI_API_KEY", "")
    model = os.environ.get("DEFAULT_MODEL", os.environ.get("OPENAI_MODEL", "gpt-4o-mini"))

    if not api_key:
        raise ValueError("请设置环境变量 OPENAI_API_KEY")

    url = f"{api_base.rstrip('/')}/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        "temperature": 0.3,
    }

    async with httpx.AsyncClient(timeout=180) as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    text = data["choices"][0]["message"]["content"].strip()
    json_match = re.search(r'\[[\s\S]*\]', text)
    if not json_match:
        return []
    raw = json_match.group()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raw = re.sub(r'(?<!\\)\\(?!["\\/bfnrtu])', r'\\\\', raw)
        return json.loads(raw)


def _infer_category(file_path: str, folder_root: str, fallback: str) -> str:
    """根据文件相对路径推断分类：取第一级子目录名"""
    try:
        rel = os.path.relpath(file_path, folder_root)
        parts = Path(rel).parts
        if len(parts) > 1:
            return parts[0]
    except Exception:
        pass
    return fallback


async def extract_from_folder(
    folder_path: str,
    category: str,
    task_id: Optional[str] = None,
) -> List[Dict]:
    """从文件夹提取知识卡片"""
    files = scan_folder(folder_path)

    task = None
    if task_id and task_id in _tasks:
        task = _tasks[task_id]
        task.progress.total_files = len(files)
        task.progress.status = "running"

    all_cards = []

    for file_info in files:
        if task:
            task.progress.current_file = file_info["path"]

        file_category = _infer_category(file_info["path"], folder_path, category)

        if file_info["ext"] == ".md":
            sections = _split_markdown(file_info["content"], file_info["path"])
        else:
            sections = _split_txt(file_info["content"], file_info["path"])

        if not sections:
            if task:
                task.progress.processed_files += 1
            continue

        batch_text = ""
        for sec in sections:
            chunk = f"{sec['context']}\n### {sec['title']}\n{sec['content']}\n\n"
            if len(batch_text) + len(chunk) > 8000:
                try:
                    cards = await _call_llm(batch_text)
                    all_cards.extend(_finalize_cards(cards, file_category, file_info["path"]))
                except Exception as e:
                    print(f"LLM call failed for {file_info['path']} (mid-batch): {e}")
                batch_text = chunk
            else:
                batch_text += chunk

        if batch_text:
            for attempt in range(3):
                try:
                    cards = await _call_llm(batch_text)
                    all_cards.extend(_finalize_cards(cards, file_category, file_info["path"]))
                    break
                except Exception as e:
                    print(f"LLM call failed for {file_info['path']} (attempt {attempt + 1}/3): {e}")
                    if attempt < 2:
                        await asyncio.sleep(2)

        if task:
            task.progress.processed_files += 1
            task.progress.total_cards = len(all_cards)

        print(f"  [{len(all_cards)} cards] [{file_category}] {file_info['path']}")

    if task:
        task.progress.status = "completed"
        task.cards = all_cards

    return all_cards


def _finalize_cards(raw_cards: List[Dict], category: str, source_file: str) -> List[Dict]:
    """把 LLM 输出转为标准 Card 格式"""
    result = []
    for c in raw_cards:
        q = c.get("question", "").strip()
        a = c.get("answer", "").strip()
        if not q or not a:
            continue

        distractors = c.get("distractors", [])
        if isinstance(distractors, list):
            distractors = [d.strip() for d in distractors if isinstance(d, str) and len(d.strip()) > 5]
        else:
            distractors = []

        card = {
            "id": _generate_id(q + a),
            "title": q[:50],
            "category": category,
            "question": q,
            "answer": a,
            "question_type": c.get("question_type", "concept"),
            "difficulty": c.get("difficulty", "medium"),
            "source_file": source_file,
            "tags": c.get("tags", []),
            "distractors": distractors[:3],
        }
        result.append(card)
    return result


def save_cards(new_cards: List[Dict], cards_json_path: str):
    """追加卡片到 cards.json（去重）"""
    existing = []
    if os.path.exists(cards_json_path):
        with open(cards_json_path, "r", encoding="utf-8") as f:
            existing = json.load(f)

    existing_ids = {c["id"] for c in existing}
    added = [c for c in new_cards if c["id"] not in existing_ids]
    existing.extend(added)

    os.makedirs(os.path.dirname(cards_json_path), exist_ok=True)
    with open(cards_json_path, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

    return len(added)


def create_task(task_id: str) -> ExtractionTask:
    task = ExtractionTask(task_id=task_id)
    _tasks[task_id] = task
    return task


def get_task(task_id: str) -> Optional[ExtractionTask]:
    return _tasks.get(task_id)
