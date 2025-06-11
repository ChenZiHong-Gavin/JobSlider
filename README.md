# JobSlider
JobSlider（面试滑题乐）——面向面试的百词斩

## 🚀 项目结构

```
JobSlider/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI 应用入口
│   │   ├── models/          # Pydantic 数据模型
│   │   ├── routes/          # API 路由
│   │   └── database/        # TinyDB 数据库配置
│   ├── requirements.txt     # Python 依赖
│   └── README.md           # 后端文档
└── README.md               # 项目总览
```

## 🛠️ 技术栈

### 前端
- React 18 + TypeScript
- Vite 构建工具
- Tailwind CSS + shadcn/ui
- Lucide React 图标

### 后端
- FastAPI (Python)
- TinyDB 轻量级数据库
- Pydantic 数据验证
- Uvicorn ASGI 服务器

## 📖 快速开始

### 后端启动

```bash
cd backend
pip install -r requirements.txt
python run.py
```

后端服务将在 `http://localhost:8000` 启动，API文档可在 `http://localhost:8000/docs` 查看。

### 前端启动

```bash
npm install
npm run dev
```
