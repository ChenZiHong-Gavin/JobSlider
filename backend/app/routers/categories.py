"""
分类相关路由
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.database import get_db
from app.models.models import CardModel, StudyProgressModel
from app.models.schemas import CategoryInfo
from app.routers.cards import load_cards_from_json

router = APIRouter()

# 分类颜色映射
CATEGORY_COLORS = {
    "基础知识": "bg-blue-100 text-blue-700 border-blue-200",
    "Transformer": "bg-purple-100 text-purple-700 border-purple-200",
    "训练": "bg-green-100 text-green-700 border-green-200",
    "MoE": "bg-orange-100 text-orange-700 border-orange-200",
    "多模态": "bg-pink-100 text-pink-700 border-pink-200",
    "应用": "bg-cyan-100 text-cyan-700 border-cyan-200",
    "Prompt工程": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "代码实现": "bg-indigo-100 text-indigo-700 border-indigo-200",
}


@router.get("/categories", response_model=List[CategoryInfo])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """获取分类列表"""
    cards = load_cards_from_json()

    # 统计每个分类的卡片数
    category_counts = {}
    for card in cards:
        category_counts[card.category] = category_counts.get(card.category, 0) + 1

    # 统计每个分类的掌握数
    result = await db.execute(
        select(StudyProgressModel.card_id, StudyProgressModel.status)
        .where(StudyProgressModel.status == "mastered")
    )
    mastered_cards = {row[0] for row in result.all()}

    category_mastered = {}
    for card in cards:
        if card.id in mastered_cards:
            category_mastered[card.category] = category_mastered.get(card.category, 0) + 1

    # 构建响应
    categories = []
    for name, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        categories.append(CategoryInfo(
            name=name,
            count=count,
            mastered=category_mastered.get(name, 0),
            color=CATEGORY_COLORS.get(name, "bg-gray-100 text-gray-700 border-gray-200"),
        ))

    return categories
