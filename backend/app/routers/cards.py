"""
卡片相关路由
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
import json
import os
import re

from app.database import get_db
from app.models.models import CardModel, StudyProgressModel
from app.models.schemas import Card, StudyProgress

router = APIRouter()

# 卡片数据缓存
_cards_cache: List[Card] = None
_cards_cache_mtime: float = 0

# 后端 assets 基础 URL
ASSETS_BASE_URL = "/assets"


def _fix_image_paths(answer: str) -> str:
    """
    将答案中的相对图片路径转换为后端 /assets/ 绝对路径。
    处理两种格式：
    - HTML: <img src="../.gitbook/assets/xxx.png">
    - Markdown: ![alt](../.gitbook/assets/xxx.png)
    """
    # HTML img src — 提取 .gitbook/assets/ 后面的文件名
    def replace_html_src(m):
        path = m.group(1)
        # 从路径中提取 .gitbook/assets/ 之后的文件名
        match = re.search(r'\.gitbook/assets/(.+)', path)
        if match:
            filename = match.group(1)
            return f'src="{ASSETS_BASE_URL}/{filename}"'
        return m.group(0)

    answer = re.sub(r'src="([^"]*\.gitbook/assets/[^"]*)"', replace_html_src, answer)

    # Markdown image ![alt](path)
    def replace_md_img(m):
        alt = m.group(1)
        path = m.group(2)
        match = re.search(r'\.gitbook/assets/(.+)', path)
        if match:
            filename = match.group(1)
            return f'![{alt}]({ASSETS_BASE_URL}/{filename})'
        return m.group(0)

    answer = re.sub(r'!\[([^\]]*)\]\(([^)]*\.gitbook/assets/[^)]*)\)', replace_md_img, answer)

    return answer


def load_cards_from_json() -> List[Card]:
    """从 JSON 文件加载卡片（带文件修改时间缓存）"""
    global _cards_cache, _cards_cache_mtime

    cards_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
        "card-data", "cards.json"
    )

    if not os.path.exists(cards_path):
        return []

    mtime = os.path.getmtime(cards_path)
    if _cards_cache is not None and mtime == _cards_cache_mtime:
        return _cards_cache

    try:
        with open(cards_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            cards = []
            for card_data in data:
                card_data['answer'] = _fix_image_paths(card_data['answer'])
                cards.append(Card(**card_data))
            _cards_cache = cards
            _cards_cache_mtime = mtime
            return _cards_cache
    except Exception as e:
        print(f"Error loading cards: {e}")
        return []


@router.get("/cards", response_model=List[Card])
async def get_cards(
    category: str = None,
    db: AsyncSession = Depends(get_db)
):
    """获取卡片列表"""
    cards = load_cards_from_json()

    if category:
        cards = [c for c in cards if c.category == category]

    return cards


@router.get("/cards/{card_id}", response_model=Card)
async def get_card(card_id: str):
    """获取单个卡片"""
    cards = load_cards_from_json()
    card = next((c for c in cards if c.id == card_id), None)

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    return card
