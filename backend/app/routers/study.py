"""
学习相关路由
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from app.database import get_db
from app.models.models import StudyProgressModel, StudySessionModel
from app.models.schemas import (
    Card, AnswerRequest, AnswerResponse, ProgressStats,
    QuizQuestion,
)
from app.services.srs import calculate_next_review, get_status_from_repetitions
from app.services.quiz_generator import generate_quiz_options
from app.routers.cards import load_cards_from_json

router = APIRouter()


# ──────────────────────── 原有接口 ────────────────────────

@router.get("/study/next", response_model=Optional[Card])
async def get_next_card(category: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """获取下一张学习卡片，可选按分类筛选"""
    cards = load_cards_from_json()
    if not cards:
        return None

    if category:
        cards = [c for c in cards if c.category == category]
        if not cards:
            return None

    card_ids = {c.id for c in cards}
    now = datetime.now(timezone.utc)
    today_end = now + timedelta(days=1)

    result = await db.execute(
        select(StudyProgressModel).where(
            and_(
                StudyProgressModel.due_date <= today_end,
                StudyProgressModel.status != "mastered"
            )
        ).order_by(StudyProgressModel.due_date)
    )
    due_progress = result.scalars().first()

    if due_progress:
        card = next((c for c in cards if c.id == due_progress.card_id), None)
        if card:
            return card

    result = await db.execute(
        select(StudyProgressModel.card_id).where(
            StudyProgressModel.status != "new"
        )
    )
    studied_ids = {r[0] for r in result.all()}

    new_cards = [c for c in cards if c.id not in studied_ids]
    if new_cards:
        return new_cards[0]

    return None


@router.get("/study/due", response_model=List[Card])
async def get_due_cards(db: AsyncSession = Depends(get_db)):
    """获取今日到期卡片"""
    cards = load_cards_from_json()
    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(StudyProgressModel.card_id).where(
            StudyProgressModel.due_date <= now
        )
    )
    due_ids = {r[0] for r in result.all()}

    return [c for c in cards if c.id in due_ids]


@router.post("/cards/{card_id}/answer", response_model=AnswerResponse)
async def submit_answer(
    card_id: str,
    request: AnswerRequest,
    db: AsyncSession = Depends(get_db)
):
    """提交答案（自评模式）"""
    result = await db.execute(
        select(StudyProgressModel).where(StudyProgressModel.card_id == card_id)
    )
    progress = result.scalar_one_or_none()

    if not progress:
        progress = StudyProgressModel(
            card_id=card_id,
            status="new",
            ease_factor=2.5,
            interval=0,
            repetitions=0,
        )
        db.add(progress)

    new_ef, new_interval, new_reps, next_due = calculate_next_review(
        request.rating,
        progress.ease_factor,
        progress.interval,
        progress.repetitions,
    )

    progress.ease_factor = new_ef
    progress.interval = new_interval
    progress.repetitions = new_reps
    progress.due_date = next_due
    progress.last_reviewed = datetime.now(timezone.utc)
    progress.status = get_status_from_repetitions(new_reps, request.rating)

    history = progress.history or []
    history.append({
        "date": datetime.now(timezone.utc).isoformat(),
        "rating": request.rating,
        "time_spent": request.time_spent,
    })
    progress.history = history[-20:]

    await db.commit()

    return AnswerResponse(
        success=True,
        next_due_date=next_due,
        message=f"下次复习: {next_due.strftime('%Y-%m-%d')}"
    )


@router.get("/progress", response_model=ProgressStats)
async def get_progress(db: AsyncSession = Depends(get_db)):
    """获取学习进度"""
    cards = load_cards_from_json()
    total = len(cards)

    result = await db.execute(
        select(StudyProgressModel.status, func.count(StudyProgressModel.id))
        .group_by(StudyProgressModel.status)
    )
    status_counts = {row[0]: row[1] for row in result.all()}

    mastered = status_counts.get("mastered", 0)
    learning = status_counts.get("learning", 0) + status_counts.get("review", 0)

    now = datetime.now(timezone.utc)
    today_end = now + timedelta(days=1)
    result = await db.execute(
        select(func.count(StudyProgressModel.id)).where(
            StudyProgressModel.due_date <= today_end
        )
    )
    due_today = result.scalar()

    return ProgressStats(
        total=total,
        mastered=mastered,
        learning=learning,
        due_today=due_today,
        study_time=0,
        streak=1,
    )


# ──────────────────────── 选择题接口 ────────────────────────

@router.get("/study/quiz/{card_id}", response_model=QuizQuestion)
async def get_quiz_for_card(card_id: str):
    """
    为指定卡片生成四选一选择题。
    从卡片答案中提取正确选项摘要，从其他卡片中抽取干扰项。
    """
    cards = load_cards_from_json()
    card = next((c for c in cards if c.id == card_id), None)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    options, correct_index = generate_quiz_options(
        card_answer=card.answer,
        all_cards=cards,
        current_card_id=card.id,
        current_category=card.category,
    )

    return QuizQuestion(
        card_id=card.id,
        question=card.question,
        options=options,
        correct_index=correct_index,
        category=card.category,
        difficulty=card.difficulty,
        question_type=card.question_type,
        title=card.title,
    )
