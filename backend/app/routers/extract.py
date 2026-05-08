"""
知识提取 API 路由
"""
import os
import uuid
import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from app.services.knowledge_extractor import (
    extract_from_folder, save_cards, create_task, get_task,
)

router = APIRouter()

CARDS_JSON = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "card-data", "cards.json",
)


class ExtractRequest(BaseModel):
    folder_path: str
    category: str = "通用"


class ExtractResponse(BaseModel):
    task_id: str
    message: str


class ExtractStatus(BaseModel):
    task_id: str
    status: str
    total_files: int
    processed_files: int
    total_cards: int
    current_file: str
    error: str | None = None


async def _run_extraction(task_id: str, folder_path: str, category: str):
    task = get_task(task_id)
    try:
        cards = await extract_from_folder(folder_path, category, task_id)
        added = save_cards(cards, CARDS_JSON)
        if task:
            task.progress.status = "completed"
            task.progress.total_cards = added
    except Exception as e:
        if task:
            task.progress.status = "failed"
            task.progress.error = str(e)


@router.post("/extract", response_model=ExtractResponse)
async def start_extraction(
    request: ExtractRequest,
    background_tasks: BackgroundTasks,
):
    if not os.path.isdir(request.folder_path):
        raise HTTPException(400, f"文件夹不存在: {request.folder_path}")

    task_id = uuid.uuid4().hex[:8]
    create_task(task_id)
    background_tasks.add_task(_run_extraction, task_id, request.folder_path, request.category)

    return ExtractResponse(task_id=task_id, message="提取任务已启动")


@router.get("/extract/status/{task_id}", response_model=ExtractStatus)
async def get_extraction_status(task_id: str):
    task = get_task(task_id)
    if not task:
        raise HTTPException(404, "任务不存在")

    p = task.progress
    return ExtractStatus(
        task_id=task_id,
        status=p.status,
        total_files=p.total_files,
        processed_files=p.processed_files,
        total_cards=p.total_cards,
        current_file=p.current_file,
        error=p.error,
    )
