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
│   │   ├── pages/          # 页面组件
│   │   │   ├── Calendar.tsx       # 日历时间轴页
│   │   │   ├── DailyDetail.tsx    # 日期详情页
│   │   │   ├── Stats.tsx          # 统计总结页（v2.0 新增）
│   │   │   └── Profile.tsx        # 用户中心页（v2.0 新增）
│   │   ├── components/     # 通用组件
│   │   ├── api/            # Axios 请求封装
│   │   └── types/          # TypeScript 类型定义
│   └── package.json
├── backend/                # FastAPI
│   ├── app/
│   │   ├── routers/        # 路由
│   │   │   ├── events.py       # 时间事件 CRUD
│   │   │   ├── categories.py   # 分类 CRUD（v2.0 扩展）
│   │   │   └── stats.py        # 统计接口（v2.0 新增）
│   │   ├── models/         # SQLAlchemy 模型
│   │   ├── schemas/        # Pydantic 请求/响应结构
│   │   └── main.py         # 入口
│   └── requirements.txt
├── database/
│   └── db.sql              # 表结构定义（权威）
├── prototype/              # 产品原型 HTML
└── docs/
    ├── product/            # features.md / vision.md
    ├── tech/               # arch.md（本文件）
    └── state/              # status.md / ai_notes.mvp.md
```

## 路由结构

| 路由 | 页面 | 说明 |
|------|------|------|
| `/calendar` | Calendar.tsx | 日历时间轴页（月视图）|
| `/daily/:date` | DailyDetail.tsx | 日期详情页 |
| `/stats` | Stats.tsx | 统计总结页（v2.0）|
| `/profile` | Profile.tsx | 用户中心页（v2.0）|

> **底部 Tab 导航**（v2.0）：日历 / 统计 / 我的，三个 Tab 对应上述前三个路由（`/daily/:date` 不在 Tab 内，从日历页跳入）。

## API 端点一览

### v1.0 已有
| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/v1/categories` | 获取分类列表（v2.0 起含已删除，新增 `is_deleted` 字段）|
| GET | `/api/v1/events` | 获取事件列表（支持 `date` / `start_date+end_date` 过滤）|
| POST | `/api/v1/events` | 新增事件 |
| PUT | `/api/v1/events/{uuid}` | 编辑事件 |
| DELETE | `/api/v1/events/{uuid}` | 删除事件 |

### v2.0 新增
| Method | Path | 说明 |
|--------|------|------|
| POST | `/api/v1/categories` | 新增分类 |
| PUT | `/api/v1/categories/{id}` | 编辑分类（名称/颜色）|
| DELETE | `/api/v1/categories/{id}` | 逻辑删除分类 |
| POST | `/api/v1/categories/{id}/restore` | 恢复已删除分类 |
| GET | `/api/v1/stats/weekly` | 周统计（`?year=&week=`）|
| GET | `/api/v1/stats/monthly` | 月统计（`?year=&month=`）|

## API 约定
- 风格：RESTful
- 前缀：`/api/v1/`
- 格式：JSON
- 默认用户：`user_id = 1000`（MVP 无登录）
- 接口文档：FastAPI 自动生成，访问 `/docs`
