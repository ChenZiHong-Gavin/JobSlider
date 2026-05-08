"""
SRS (Spaced Repetition System) 间隔重复算法
基于 SM-2 算法实现
"""
from datetime import datetime, timedelta, timezone
from typing import Tuple


def calculate_next_review(
    rating: int,
    ease_factor: float,
    interval: int,
    repetitions: int,
) -> Tuple[float, int, int, datetime]:
    """
    计算下次复习时间

    Args:
        rating: 评分 (1-4)
            1 = Again - 完全不会
            2 = Hard - 有点模糊
            3 = Good - 基本掌握
            4 = Easy - 完全掌握
        ease_factor: 当前易度因子
        interval: 当前间隔天数
        repetitions: 连续成功次数

    Returns:
        (new_ease_factor, new_interval, new_repetitions, next_due_date)
    """
    # SM-2 算法参数
    MIN_EASE_FACTOR = 1.3

    if rating < 3:
        # 回答错误，重置
        new_repetitions = 0
        new_interval = 1
    else:
        # 回答正确
        new_repetitions = repetitions + 1

        if new_repetitions == 1:
            new_interval = 1
        elif new_repetitions == 2:
            new_interval = 6
        else:
            new_interval = round(interval * ease_factor)

    # 更新易度因子
    new_ease_factor = ease_factor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
    new_ease_factor = max(MIN_EASE_FACTOR, new_ease_factor)

    # 根据评分调整间隔
    if rating == 2:
        new_interval = round(new_interval * 1.2)
    elif rating == 4:
        new_interval = round(new_interval * 1.3)

    # 计算下次复习日期
    next_due_date = datetime.now(timezone.utc) + timedelta(days=new_interval)

    return new_ease_factor, new_interval, new_repetitions, next_due_date


def get_status_from_repetitions(repetitions: int, rating: int) -> str:
    """根据重复次数和评分确定状态"""
    if repetitions == 0:
        return "new"
    elif repetitions < 3:
        return "learning"
    elif rating < 3:
        return "learning"
    elif repetitions >= 5:
        return "mastered"
    else:
        return "review"
