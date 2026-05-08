"""
Markdown 转图片工具

功能：
1. 将 Markdown 文本（支持数学公式和中文）渲染为图片
2. 支持从 JSONL 文件批量读取数据并处理
3. 使用 markdown-it-py 渲染 HTML，playwright 生成图片

环境配置：
- 安装依赖：pip install playwright markdown-it-py
- 安装浏览器：playwright install
"""

import os
from markdown_it import MarkdownIt
from playwright.sync_api import sync_playwright
import json
from typing import List, Dict, Union


def render_markdown_to_html(markdown_text: str) -> str:
    """将 Markdown 文本渲染为 HTML
    
    Args:
        markdown_text: Markdown 格式文本
    
    Returns:
        完整的 HTML 文档
    """
    md = MarkdownIt()
    html_body = md.render(markdown_text)
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
        <style>
            body {{
                font-family: "PingFang SC", "SimHei", "Arial Unicode MS", Arial, sans-serif;
                padding: 20px;
                font-size: 16px;
                line-height: 1.6;
                color: #333;
                width: 800px;
                margin: 0 auto;
            }}
        </style>
    </head>
    <body>
    {html_body}
    <script>
        renderMathInElement(document.body, {{
            delimiters: [
                {{left: '$$', right: '$$', display: true}},
                {{left: '$', right: '$', display: false}},
                {{left: '\\(', right: '\\)', display: false}},
                {{left: '\\[', right: '\\]', display: true}}
            ],
            throwOnError: false
        }});
    </script>
    </body>
    </html>
    """

def save_html(html_content: str, output_path: str) -> None:
    """保存 HTML 文件
    
    Args:
        html_content: HTML 内容
        output_path: 输出路径
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)

def html_to_image(html_path: str, image_path: str, wait_time: int = 1000) -> None:
    """将 HTML 文件转换为图片
    
    Args:
        html_path: HTML 文件路径
        image_path: 输出图片路径
        wait_time: 等待渲染的时间(ms)
    """
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"file://{os.path.abspath(html_path)}")
        page.wait_for_timeout(wait_time)
        page.screenshot(path=image_path, full_page=True)
        browser.close()

def process_markdown(markdown_text: str, output_dir: str, filename: str) -> str:
    """处理单个 Markdown 文本
    
    Args:
        markdown_text: Markdown 文本
        output_dir: 输出目录
        filename: 文件名（不含扩展名）
    
    Returns:
        生成的图片路径
    """
    # 渲染 HTML
    html_content = render_markdown_to_html(markdown_text)
    
    # 保存 HTML
    html_path = os.path.join(output_dir, f"{filename}.html")
    save_html(html_content, html_path)
    
    # 生成图片
    image_path = os.path.join(output_dir, f"{filename}.png")
    html_to_image(html_path, image_path)
    
    return image_path

def main():
    # 示例用法
    output_dir = "./output"
    os.makedirs(output_dir, exist_ok=True)
    
    # 读取 test_data.jsonl 文件
    texts = []
    with open("./test_data.jsonl", "r") as f:
        for line in f:
            data = json.loads(line)
            texts.append(data["note"])

    # 直接 Markdown
    texts = [
        "**RoPE（Rotary Positional Embedding）** 是一种位置编码方式，它通过在**向量空间中引入旋转操作**来融合绝对位置和相对位置的信息。\n\n核心思想是：\n1. 将 token 的特征向量两两组合成复数形式 $(x_{2i}, x_{2i+1})$，即表示为二维向量对；\n2. 对每个向量对施加角度为 $\\theta$ 的旋转操作：\n   \\[\n   \\begin{aligned}\n   \\text{RoPE}(x_{2i}, x_{2i+1}) &= (x_{2i} \\cos \\theta - x_{2i+1} \\sin \\theta, \\\\\n   &\\quad x_{2i} \\sin \\theta + x_{2i+1} \\cos \\theta)\n   \\end{aligned}\n   \\]\n   其中 $\\theta$ 通常是线性递增的，用于编码不同的位置。\n\nRoPE 的优势包括：\n- **实现简单**：不像 Transformer XL 那样需要额外结构；\n- **计算开销小**：旋转操作比其他复杂编码方式更高效；\n- **支持线性注意力结构**：不像相对位置编码那样必须依赖注意力矩阵；\n- **具有远程衰减特性**：模型更容易关注近距离 token，有利于语言建模。\n\n但缺点也比较明显：\n- **外推能力有限**：相比 Alibi 这类具备强外推能力的位置编码，RoPE 只能稍微延长序列长度推理（例如训练长度为 2k，只能支持略长于 2k 的推理）；\n- 通常需要配合线性插值、NTK 插值、YaRN 等方法提升长序列推理性能。"
    ]

    # 处理每个文本
    for i, text in enumerate(texts):
        image_path = process_markdown(text, output_dir, f"output_{i}")
        print(f"已生成图片: {image_path}")

if __name__ == "__main__":
    main()
