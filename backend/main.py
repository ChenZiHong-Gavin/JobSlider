"""
JobSlider Backend - FastAPI Application
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn
import os

from app.database import init_db
from app.routers import cards, study, evaluate, categories, extract

# LLM-Everything 知识库的 gitbook assets 目录
ASSETS_DIR = os.environ.get("ASSETS_DIR", os.path.join("D:\\Project\\LLM-Everything", ".gitbook", "assets"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化数据库
    await init_db()
    yield
    # 关闭时清理资源


app = FastAPI(
    title="JobSlider API",
    description="LLM 知识卡片学习应用后端",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS 配置
_default_origins = "http://localhost:3000,http://127.0.0.1:3000"
_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", _default_origins).split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(cards.router, prefix="/api", tags=["cards"])
app.include_router(study.router, prefix="/api", tags=["study"])
app.include_router(evaluate.router, prefix="/api", tags=["evaluate"])
app.include_router(categories.router, prefix="/api", tags=["categories"])
app.include_router(extract.router, prefix="/api", tags=["extract"])

# 静态文件：知识库图片资产
if os.path.isdir(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")


@app.get("/")
async def root():
    return {
        "message": "JobSlider API",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
