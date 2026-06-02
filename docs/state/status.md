# VibCheck · Project Status

> 每次会话结束后更新此文件。这是 AI 协作的"交接班记录"。

## 当前阶段
**MVP 完结** ✅（2026-06-03）→ 进入 Post-MVP 规划

## 已完成

### 阶段 0：文档体系
- [x] docs/product/vision.md — 产品定位、使用场景、与日历 App 的差异
- [x] docs/product/features.md — MVP 功能范围、字段定义、Post-MVP 功能池
- [x] docs/tech/arch.md — 技术选型（React+Vite+Tailwind / FastAPI+SQLAlchemy）
- [x] database/db.sql — 三张表结构（t_users / t_categories / t_time_events）

### 阶段 1：脚手架
- [x] 数据库建表 + 种子数据（Oscar 用户 + 4 个默认分类）
- [x] backend/ — FastAPI 项目（main.py / database.py / models / schemas / routers）
- [x] backend 接口（GET /categories，GET/POST/PUT/DELETE /events）
- [x] frontend/ — React + Vite + TypeScript + Tailwind + PWA
- [x] frontend 基础结构（App.tsx 路由 / types / api/client.ts）

### 阶段 2：页面开发
- [x] 日历时间轴页（Calendar.tsx）
  - 月视图横向时间轴（04:00–24:00），实际行 + 计划行
  - 颜色=分类，透明度=投入度，灵感 ⚡ 标记
  - 前后月切换、跳回今天、点击进入详情页
  - 布局修复：scroll area 加 `minHeight:0`，占满 100dvh 无底部留白
- [x] 日期详情页（DailyDetail.tsx）
  - 事项列表（actual / planned / inspiration），按开始时间升序
  - Header mini 时间轴 + 分类投入度统计条
  - 底部弹出半屏表单（新增 / 编辑 / 删除）
  - 点击卡片进入编辑模式，预填所有字段
  - 删除后缓存全量失效，日历页同步刷新

## MVP 已完结
- 真机测试通过，iOS Safari 专属 bug 已全部修复（详见 bugs.mvp.md）
- 生产环境运行正常

## Post-MVP 候选（按价值排序）
1. 分类自定义管理（名称 + 颜色）
2. 复盘统计（按分类 / 按周月汇总）
3. 长期任务 + 里程碑
4. 用户登录 / 注册
5. 数据导出
6. 通知提醒

## 服务启动方式
```bash
# Backend（在 backend/ 目录）
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend（在 frontend/ 目录）
npm run dev   # 跑在 localhost:3000
```

## 路由结构
- `/calendar` → 日历时间轴页（月视图）
- `/daily/:date` → 日期详情页（如 /daily/2026-05-28）

## 关键决策记录
| 日期 | 决策 | 原因 |
|------|------|------|
| 2026-05-28 | MVP 不做登录，预置用户 id=1000 Oscar | 降低复杂度，保持可扩展 |
| 2026-05-28 | MVP 固定 4 个分类，不做自定义管理 | 快速迭代，Post-MVP 再做 |
| 2026-05-28 | 前后端分离，同一 git 仓库 | 独立部署灵活，单仓库管理方便 |
| 2026-05-28 | React+Vite+Tailwind / FastAPI+SQLAlchemy | AI 写代码友好，生态成熟 |
| 2026-05-28 | events+inspirations 合并为 t_time_events，type 字段区分 | MVP 简单，避免过度设计 |
| 2026-05-28 | 透明度=投入度（高/中/低），颜色=分类 | 产品核心视觉语言 |
