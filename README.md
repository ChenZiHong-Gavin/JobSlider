# JobSlider - 通用知识卡片学习应用

基于间隔重复算法（SRS）的知识学习应用。支持从**任意文件夹**的 Markdown / TXT 文档中，通过 LLM 自动提取高质量问答卡片，以选择题形式进行学习。

![JobSlider](https://img.shields.io/badge/JobSlider-v0.2.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)

## 功能特性

- **通用知识提取** - 指定任意文件夹，LLM 自动生成问答卡片和干扰选项
- **间隔重复** - SM-2 算法驱动，科学安排复习时间
- **选择题模式** - 四选一选择题，干扰项与问题高度相关
- **分类学习** - 按文档目录自动分类，可选择特定领域学习
- **进度追踪** - 可视化学习进度和掌握度
- **快捷键** - 键盘 1-4 选择答案，Enter 下一题
- **CLI + Web** - 命令行批量提取，Web 界面在线提取和学习

## 项目结构

```
JobSlider/
├── frontend/              # React + TypeScript + Tailwind
│   └── src/
│       ├── components/    # UI 组件（Flashcard, Header, ...）
│       ├── pages/         # 页面（Study, Extract, Progress, ...）
│       ├── stores/        # Zustand 状态管理
│       ├── lib/           # API 客户端、工具函数
│       └── types/         # TypeScript 类型定义
├── backend/               # FastAPI + SQLite
│   └── app/
│       ├── routers/       # API 路由（study, cards, extract, ...）
│       ├── services/      # 业务逻辑（SRS, 知识提取, 选择题生成）
│       └── models/        # 数据模型（SQLAlchemy + Pydantic）
├── card-data/             # 运行时数据
│   ├── cards.json         # 卡片数据
│   └── jobslider.db       # SQLite 学习进度数据库
├── scripts/               # 工具脚本
│   ├── extract_knowledge.py  # 知识提取 CLI
│   ├── init_cards.py         # 初始化卡片（规则提取）
│   └── reset_db.py           # 重置数据库
├── .env                   # 环境变量配置
├── start.bat              # Windows 一键启动
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
# 前端
cd frontend && npm install

# 后端
cd backend && pip install -r requirements.txt
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_API_KEY=sk-your-api-key
DEFAULT_MODEL=qwen-max
```

支持任何 OpenAI 兼容 API（OpenAI、DeepSeek、通义千问、本地模型等）。

### 3. 提取知识卡片

**CLI 方式（推荐批量提取）：**

```bash
python scripts/extract_knowledge.py "D:\你的知识文件夹" --category "分类名"
```

文件夹内的子目录会自动成为分类。例如：
```
知识文件夹/
├── Python/       → 分类 "Python"
│   ├── basics.md
│   └── async.md
├── Docker/       → 分类 "Docker"
│   └── overview.md
```

**Web 方式：** 启动服务后访问 `/extract` 页面，填入路径即可在线提取。

### 4. 启动服务

```bash
# 后端（http://localhost:8000）
cd backend && python main.py

# 前端（http://localhost:3000）
cd frontend && npm run dev
```

或使用 Windows 一键启动：双击 `start.bat`

### 5. 开始学习

打开 http://localhost:3000 → 点击"学习"→ 选择分类 → 开始答题

## 使用指南

### 学习流程

1. 阅读问题
2. 选择 A/B/C/D（键盘 1-4 快捷选择）
3. 查看解析（Enter 展开详细答案）
4. 进入下一题（Enter）

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `1-4` | 选择 A/B/C/D |
| `Enter` | 查看解析 / 下一题 |

### 知识提取原理

1. **文档扫描** - 递归扫描 `.md` / `.txt` 文件
2. **智能切分** - 按 Markdown 标题层级切分，保留父标题作为上下文
3. **LLM 生成** - 调用大模型为每个知识段生成：问题、答案、难度、标签、3 个迷惑性干扰选项
4. **去重写入** - 按内容哈希去重，追加到 `cards.json`

## API

启动后端后访问 http://localhost:8000/docs 查看完整文档。

| 接口 | 说明 |
|------|------|
| `GET /api/cards` | 获取卡片列表（支持 `?category=` 筛选） |
| `GET /api/study/next` | 获取下一张卡片（支持 `?category=` 筛选） |
| `GET /api/study/quiz/{id}` | 获取选择题 |
| `POST /api/cards/{id}/answer` | 提交答案，更新 SRS |
| `POST /api/extract` | 启动知识提取任务 |
| `GET /api/extract/status/{id}` | 查询提取进度 |
| `GET /api/progress` | 学习进度统计 |
| `GET /api/categories` | 分类列表 |

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 18, TypeScript, Tailwind CSS, Framer Motion, Zustand |
| 后端 | FastAPI, SQLAlchemy 2.0, aiosqlite, Pydantic |
| 数据库 | SQLite |
| LLM | OpenAI 兼容 API（通义千问、DeepSeek、GPT 等） |
| 算法 | SM-2 间隔重复算法 |

## License

MIT
