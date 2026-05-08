"""
Pydantic 模型
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class Card(BaseModel):
    """卡片模型"""
    id: str
    title: str
    category: str
    question: str
    answer: str
    question_type: str
    difficulty: str
    source_file: str
    tags: Optional[List[str]] = None
    distractors: Optional[List[str]] = None

    class Config:
        from_attributes = True


class StudyProgress(BaseModel):
    """学习进度模型"""
    card_id: str
    status: str
    ease_factor: float
    interval: int
    repetitions: int
    due_date: Optional[datetime] = None
    last_reviewed: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReviewHistory(BaseModel):
    """复习历史"""
    date: datetime
    rating: int
    time_spent: int


class AnswerRequest(BaseModel):
    """答题请求"""
    rating: int  # 1-4
    time_spent: int  # 秒
    answer: Optional[str] = None  # 文字回答（可选）


class AnswerResponse(BaseModel):
    """答题响应"""
    success: bool
    next_due_date: Optional[datetime] = None
    message: str


class ProgressStats(BaseModel):
    """进度统计"""
    total: int
    mastered: int
    learning: int
    due_today: int
    study_time: int
    streak: int


class CategoryInfo(BaseModel):
    """分类信息"""
    name: str
    count: int
    mastered: int
    color: str


class QuizQuestion(BaseModel):
    """选择题模型"""
    card_id: str
    question: str
    options: List[str]          # 4 个选项
    correct_index: int          # 正确答案索引 (0-3)
    category: str
    difficulty: str
    question_type: str
    title: str


class QuizAnswerRequest(BaseModel):
    """选择题答题请求"""
    selected_index: int         # 用户选择的索引 (0-3)
    time_spent: int             # 秒


class EvaluateRequest(BaseModel):
    """AI 评估请求"""
    card_id: str
    user_answer: str


class EvaluateResult(BaseModel):
    """AI 评估结果"""
    score: float  # 0-100
    feedback: str
    missing_points: List[str]
    suggestions: List[str]
