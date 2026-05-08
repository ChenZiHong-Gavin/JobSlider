"""
初始化卡片数据
"""
import sys
import os

# 添加 backend 到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.services.card_generator import generate_cards

if __name__ == "__main__":
    print("Generating cards from LLM-Everything...")
    cards = generate_cards()
    print(f"Successfully generated {len(cards)} cards!")
