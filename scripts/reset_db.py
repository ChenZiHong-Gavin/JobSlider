"""
重置数据库
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import asyncio
from app.database import engine
from app.models.models import Base

async def reset():
    """重置数据库"""
    print("正在重置数据库...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("数据库已重置")

if __name__ == "__main__":
    asyncio.run(reset())
