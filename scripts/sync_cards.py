"""
同步卡片数据
当 LLM-Everything 更新后运行此脚本
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.services.card_generator import generate_cards

def sync():
    """同步卡片"""
    print("正在同步卡片数据...")
    cards = generate_cards()
    print(f"同步完成！共 {len(cards)} 张卡片")

if __name__ == "__main__":
    sync()
