# VibCheck

个人日程记录与规划 App，手机 Web（PWA）形态。

以「天」为单位记录每日事项，**颜色 = 分类，透明度 = 投入度**。支持三种事项类型：已记录 / 计划 / 灵感⚡。

---

## 快速启动

```bash
# 克隆后安装依赖（仅首次）
cd frontend && npm install && cd ..
cd backend && pip install -r requirements.txt && cd ..

# 一键启动（本地开发）
make dev
```

浏览器访问：`http://localhost:3000`

停止服务：

```bash
make stop
```

---

## 环境配置

| 文件 | 说明 |
|------|------|
| `backend/.env` | 生产环境（远程 MySQL） |
| `backend/.env.dev` | 开发环境（本地 MySQL） |

两个文件均已加入 `.gitignore`，不会提交。

`make dev` 自动使用 `APP_ENV=dev` 加载 `.env.dev`；生产部署直接运行 `uvicorn` 不带该变量。

`.env.dev` 格式：

```
DATABASE_URL=mysql+pymysql://root:password@127.0.0.1:3306/vibcheck
```

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + PWA |
| 后端 | Python + FastAPI + SQLAlchemy 2.0 + Pydantic v2 |
| 数据库 | MySQL（开发本地 / 生产远程） |
| 状态管理 | TanStack Query + React Router v6 |

---

## 项目结构

```
vibcheck/
├── frontend/          # React PWA（端口 3000）
│   └── src/
│       ├── pages/     # Calendar / DailyDetail
│       ├── api/       # Axios 请求封装
│       └── types/     # TypeScript 类型
├── backend/           # FastAPI（端口 8000）
│   └── app/
│       ├── routers/   # events / categories
│       ├── models/    # SQLAlchemy 模型
│       └── schemas/   # Pydantic 请求/响应
├── database/
│   └── db.sql         # 表结构 + 种子数据
├── docs/              # 产品 / 技术文档
└── Makefile
```

---

## 页面路由

| 路由 | 页面 |
|------|------|
| `/calendar` | 月视图横向时间轴 |
| `/daily/:date` | 日期详情（如 `/daily/2026-05-29`） |

---

## API

后端自动生成接口文档，启动后访问：

```
http://localhost:8000/docs
```

主要接口：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/categories` | 获取分类列表 |
| GET | `/api/v1/events?date=YYYY-MM-DD` | 获取某天事项 |
| POST | `/api/v1/events` | 新增事项 |
| PUT | `/api/v1/events/:uuid` | 编辑事项 |
| DELETE | `/api/v1/events/:uuid` | 删除事项 |

---

## 数据库初始化

```bash
mysql -uroot -p -A vibcheck < database/db.sql
```

初始化后包含默认用户（Oscar，user_id=1000）和 4 个分类：

| 分类 | 颜色 |
|------|------|
| 工作 | `#4F86E8` |
| 学习 | `#F0883A` |
| 运动 | `#2DBD8A` |
| 会议 | `#9B72E8` |

---

## MVP 进度

- [x] 数据库表结构 + 种子数据
- [x] Backend REST API（CRUD）
- [x] Frontend 脚手架（PWA + 路由）
- [x] 日期详情页 — 列表展示
- [x] 日期详情页 — 新增表单
- [ ] 日期详情页 — 编辑 / 删除
- [ ] 日历月视图
