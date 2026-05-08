"""
选择题生成服务
优先使用卡片自带的 LLM 生成干扰项，回退到同类别卡片摘要
"""
import random
import re
from typing import List, Tuple


def _extract_answer_summary(answer: str, max_len: int = 80) -> str:
    """从答案中提取第一个核心要点作为正确选项摘要"""
    text = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', answer)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'```[\s\S]*?```', '', text)
    text = re.sub(r'`[^`]+`', '', text)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\*{1,3}([^*]+)\*{1,3}', r'\1', text)
    text = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', text)
    text = re.sub(r'[|\-]{3,}', '', text)

    lines = [l.strip() for l in text.split('\n') if l.strip()]
    # 取第一个有意义的行（跳过表头等）
    meaningful = [l for l in lines if len(l) >= 15]
    if not meaningful:
        meaningful = [l for l in lines if len(l) >= 8]
    if not meaningful:
        return answer[:max_len].strip()

    # 取第一句有意义的内容
    result = meaningful[0].lstrip('- •·*')
    if len(result) > max_len:
        for sep in ['。', '；', '，', '. ', ', ']:
            idx = result[:max_len].rfind(sep)
            if idx > max_len // 3:
                result = result[:idx + len(sep)]
                break
        else:
            result = result[:max_len] + '…'

    return result.strip()


def generate_quiz_options(
    card_answer: str,
    all_cards: list,
    current_card_id: str,
    current_category: str,
    num_options: int = 4,
) -> Tuple[List[str], int]:
    """生成选择题选项，优先使用卡片自带的 distractors"""
    correct_option = _extract_answer_summary(card_answer)

    # 找当前卡片对象，检查是否有 distractors
    current_card = next((c for c in all_cards if c.id == current_card_id), None)
    distractors: List[str] = []

    if current_card and hasattr(current_card, 'distractors') and current_card.distractors:
        distractors = [d for d in current_card.distractors if d and len(d.strip()) > 5]

    # 如果 distractors 不够 3 个，从同类别卡片补充
    if len(distractors) < num_options - 1:
        same_category = [
            c for c in all_cards
            if c.id != current_card_id and c.category == current_category
        ]
        random.shuffle(same_category)

        used = {correct_option.lower()} | {d.lower() for d in distractors}
        for candidate in same_category:
            if len(distractors) >= num_options - 1:
                break
            summary = _extract_answer_summary(candidate.answer)
            if len(summary) < 10:
                continue
            if summary.lower() in used:
                continue
            # 前30字符去重
            if any(summary.lower()[:30] == u[:30] for u in used if len(u) >= 30):
                continue
            distractors.append(summary)
            used.add(summary.lower())

    distractors = distractors[:num_options - 1]

    # 组装并打乱
    options = [correct_option] + distractors
    indices = list(range(len(options)))
    random.shuffle(indices)
    shuffled = [options[i] for i in indices]
    correct_index = indices.index(0)

    return shuffled, correct_index
