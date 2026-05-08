"""
AI 评估路由
"""
from fastapi import APIRouter, HTTPException
from typing import Optional
import os

from app.models.schemas import EvaluateRequest, EvaluateResult
from app.routers.cards import load_cards_from_json

router = APIRouter()

# 简单的评估逻辑（不使用 OpenAI API 时）
def simple_evaluate(question: str, answer: str, user_answer: str) -> EvaluateResult:
    """简单评估（基于关键词匹配）"""
    # 提取关键词
    answer_keywords = set(answer.lower().split())
    user_keywords = set(user_answer.lower().split())

    # 计算匹配度
    if answer_keywords:
        match_ratio = len(answer_keywords & user_keywords) / len(answer_keywords)
    else:
        match_ratio = 0

    # 评分
    if match_ratio >= 0.7:
        score = 80 + int((match_ratio - 0.7) * 66)
        feedback = "回答很好！涵盖了主要知识点。"
    elif match_ratio >= 0.4:
        score = 60 + int((match_ratio - 0.4) * 66)
        feedback = "回答基本正确，但缺少一些细节。"
    else:
        score = int(match_ratio * 150)
        feedback = "回答不够完整，建议复习相关知识点。"

    score = min(100, max(0, score))

    # 找出遗漏点（简单实现）
    missing = list(answer_keywords - user_keywords)[:5]

    return EvaluateResult(
        score=score,
        feedback=feedback,
        missing_points=[f"缺少关键词: {m}" for m in missing if len(m) > 2],
        suggestions=["建议查看标准答案", "多复习相关概念"],
    )


@router.post("/evaluate", response_model=EvaluateResult)
async def evaluate_answer(request: EvaluateRequest):
    """评估用户答案"""
    # 获取卡片信息
    cards = load_cards_from_json()
    card = next((c for c in cards if c.id == request.card_id), None)

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    # 检查是否有 OpenAI API Key
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        # 使用简单评估
        return simple_evaluate(card.question, card.answer, request.user_answer)

    # TODO: 实现 OpenAI API 评估
    # 这里可以调用 OpenAI API 进行智能评估
    return simple_evaluate(card.question, card.answer, request.user_answer)
