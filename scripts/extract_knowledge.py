"""
知识提取 CLI 工具
从任意文件夹提取知识卡片

用法：
    python scripts/extract_knowledge.py /path/to/folder --category "分类名"

环境变量：
    OPENAI_API_KEY   - API Key（必填）
    OPENAI_API_BASE  - API 地址（默认 https://api.openai.com/v1）
    OPENAI_MODEL     - 模型名（默认 gpt-4o-mini）
"""
import sys
import os
import asyncio
import argparse

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# 加载 .env 文件
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.services.knowledge_extractor import extract_from_folder, save_cards, scan_folder


def main():
    parser = argparse.ArgumentParser(description="从知识文件夹提取学习卡片")
    parser.add_argument("folder", help="知识文件夹路径")
    parser.add_argument("--category", default="通用", help="卡片分类名（默认：通用）")
    parser.add_argument(
        "--output",
        default=os.path.join(os.path.dirname(__file__), "..", "card-data", "cards.json"),
        help="输出 JSON 路径",
    )
    args = parser.parse_args()

    folder = os.path.abspath(args.folder)
    files = scan_folder(folder)
    print(f"找到 {len(files)} 个文件（.md/.txt）")

    if not files:
        print("没有可提取的文件")
        return

    print(f"开始提取，分类: {args.category}")
    print(f"使用模型: {os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')}")
    print(f"API 地址: {os.environ.get('OPENAI_API_BASE', 'https://api.openai.com/v1')}")
    print()

    cards = asyncio.run(extract_from_folder(folder, args.category))
    print(f"\n生成了 {len(cards)} 张卡片")

    output = os.path.abspath(args.output)
    added = save_cards(cards, output)
    print(f"新增 {added} 张卡片到 {output}")


if __name__ == "__main__":
    main()
