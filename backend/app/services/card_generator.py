"""
Markdown 卡片生成器
从 LLM-Everything 知识库生成学习卡片
"""
import os
import re
import json
import hashlib
from pathlib import Path
from typing import List, Dict


class CardGenerator:
    """卡片生成器"""

    # 知识库路径
    KNOWLEDGE_REPO = r"D:\Project\LLM-Everything"

    # 分类映射
    CATEGORIES = {
        "basics": "基础知识",
        "transformer": "Transformer",
        "train": "训练",
        "moe": "MoE",
        "multi-modal-llm": "多模态",
        "llm-application": "应用",
        "prompt-engineering": "Prompt工程",
        "code-from-scratch": "代码实现",
    }

    def __init__(self):
        self.cards: List[Dict] = []

    def generate_id(self, content: str) -> str:
        """生成唯一 ID"""
        return hashlib.md5(content.encode()).hexdigest()[:12]

    def parse_markdown(self, file_path: str) -> List[Dict]:
        """解析 Markdown 文件生成卡片"""
        cards = []

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return cards

        # 获取分类
        category = self.get_category_from_path(file_path)

        # 提取标题
        title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
        title = title_match.group(1) if title_match else "Untitled"

        # 按二级标题分割内容
        sections = re.split(r'\n## ', content)

        for i, section in enumerate(sections[1:], 1):  # 跳过第一个（通常是标题）
            lines = section.strip().split('\n')
            if not lines:
                continue

            section_title = lines[0].strip()
            section_content = '\n'.join(lines[1:]).strip()

            if not section_content:
                continue

            # 生成卡片
            card = self.create_card(
                title=f"{title} - {section_title}",
                category=category,
                content=section_content,
                source_file=file_path,
            )
            cards.append(card)

        return cards

    def create_card(
        self,
        title: str,
        category: str,
        content: str,
        source_file: str,
    ) -> Dict:
        """创建卡片"""
        # 提取问题和答案
        question, answer = self.extract_qa(content, title)

        # 判断题型
        question_type = self.detect_question_type(content)

        # 判断难度
        difficulty = self.detect_difficulty(content)

        card = {
            "id": self.generate_id(title + content),
            "title": title,
            "category": category,
            "question": question,
            "answer": answer,
            "question_type": question_type,
            "difficulty": difficulty,
            "source_file": source_file,
            "tags": self.extract_tags(content),
        }

        return card

    def extract_qa(self, content: str, title: str) -> tuple:
        """提取问题和答案"""
        # 尝试找到列表项作为答案
        list_items = re.findall(r'^[\*\-] (.+)$', content, re.MULTILINE)

        if list_items:
            # 使用标题作为问题，列表项作为答案
            question = f"请解释：{title}"
            answer = '\n'.join(f"• {item}" for item in list_items[:5])  # 最多5个要点
        else:
            # 使用第一段作为问题，其余作为答案
            paragraphs = content.split('\n\n')
            if len(paragraphs) >= 2:
                question = f"关于{title}，以下哪项是正确的？"
                answer = content[:500]  # 限制长度
            else:
                question = f"什么是{title}？"
                answer = content[:500]

        return question, answer

    def detect_question_type(self, content: str) -> str:
        """检测题型"""
        content_lower = content.lower()

        # 检查是否有对比关键词
        if any(word in content_lower for word in ['vs', 'versus', '区别', '对比', '比较', 'different']):
            return "comparison"

        # 检查是否有代码
        if '```' in content or 'def ' in content or 'class ' in content:
            return "code"

        # 检查是否有场景描述
        if any(word in content_lower for word in ['example', '场景', '应用', 'use case']):
            return "scenario"

        return "concept"

    def detect_difficulty(self, content: str) -> str:
        """检测难度"""
        # 根据内容长度和复杂度判断
        length = len(content)
        code_blocks = content.count('```')

        if code_blocks >= 2 or length > 1000:
            return "hard"
        elif length > 500:
            return "medium"
        else:
            return "easy"

    def extract_tags(self, content: str) -> List[str]:
        """提取标签"""
        tags = []

        # 提取代码语言标签
        code_langs = re.findall(r'```(\w+)', content)
        tags.extend(code_langs)

        # 提取关键词
        keywords = ['attention', 'transformer', 'bert', 'gpt', 'training', 'fine-tuning']
        for keyword in keywords:
            if keyword.lower() in content.lower():
                tags.append(keyword)

        return list(set(tags))

    def get_category_from_path(self, file_path: str) -> str:
        """从路径获取分类"""
        relative_path = os.path.relpath(file_path, self.KNOWLEDGE_REPO)
        parts = relative_path.split(os.sep)

        if parts:
            category_key = parts[0]
            return self.CATEGORIES.get(category_key, category_key)

        return "其他"

    def scan_repository(self) -> List[Dict]:
        """扫描知识库生成所有卡片"""
        self.cards = []

        knowledge_path = Path(self.KNOWLEDGE_REPO)

        if not knowledge_path.exists():
            print(f"Knowledge repo not found: {self.KNOWLEDGE_REPO}")
            return self.cards

        # 扫描所有 Markdown 文件
        for md_file in knowledge_path.rglob("*.md"):
            # 跳过 README 和 SUMMARY
            if md_file.name in ['README.md', 'SUMMARY.md']:
                continue

            # 跳过 .gitbook 目录
            if '.gitbook' in str(md_file):
                continue

            cards = self.parse_markdown(str(md_file))
            self.cards.extend(cards)

        print(f"Generated {len(self.cards)} cards from {self.KNOWLEDGE_REPO}")
        return self.cards

    def save_to_json(self, output_path: str):
        """保存卡片到 JSON"""
        # 确保目录存在
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.cards, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(self.cards)} cards to {output_path}")


def generate_cards():
    """生成卡片的入口函数"""
    generator = CardGenerator()
    cards = generator.scan_repository()

    # 保存到 card-data 目录
    output_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "..", "card-data", "cards.json"
    )
    generator.save_to_json(output_path)

    return cards


if __name__ == "__main__":
    generate_cards()
