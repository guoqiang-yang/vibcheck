# VibCheck · Architecture

## 整体架构
前后端分离，手机 Web（PWA）形态，同一 git 仓库（monorepo）。

```
┌─────────────────────┐        HTTP/REST        ┌─────────────────────┐
│   Frontend (PWA)    │  ──────────────────────▶ │   Backend (API)     │
│  React + Vite + TS  │                          │  Python + FastAPI   │
└─────────────────────┘                          └──────────┬──────────┘
                                                            │ SQLAlchemy
                                                 ┌──────────▼──────────┐
                                                 │   MySQL（远程）      │
                                                 │   182.92.65.140      │
                                                 └─────────────────────┘
```

## 技术栈

### 前端
| 技术 | 用途 |
|------|------|
| React 18 + TypeScript | UI 框架 |
| Vite | 构建工具 |
| vite-plugin-pwa | PWA 支持 |
| Tailwind CSS | 样式 |
| TanStack Query | 服务端数据请求与缓存 |
| React Router v6 | 页面路由 |
| Axios | HTTP 请求 |

### 后端
| 技术 | 用途 |
|------|------|
| Python 3.11+ | 运行环境 |
| FastAPI | API 框架（自动生成接口文档）|
| SQLAlchemy 2.0 | ORM |
| Alembic | 数据库迁移 |
| Pydantic v2 | 数据校验 |
| PyMySQL | MySQL 驱动 |
| Uvicorn | ASGI 服务器 |

## 项目目录结构
```
vibcheck/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── pages/          # 页面组件（Calendar / DailyDetail）
│   │   ├── components/     # 通用组件
│   │   ├── api/            # Axios 请求封装
│   │   └── types/          # TypeScript 类型定义
│   └── package.json
├── backend/                # FastAPI
│   ├── app/
│   │   ├── routers/        # 路由（events / categories）
│   │   ├── models/         # SQLAlchemy 模型
│   │   ├── schemas/        # Pydantic 请求/响应结构
│   │   └── main.py         # 入口
│   └── requirements.txt
├── database/
│   └── db.sql
└── docs/
    ├── product/
    └── tech/
```

## API 约定
- 风格：RESTful
- 前缀：`/api/v1/`
- 格式：JSON
- 接口文档：FastAPI 自动生成，访问 `/docs`
