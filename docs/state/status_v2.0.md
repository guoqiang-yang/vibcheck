# VibCheck · v2.0 Project Status

> 每次会话结束后更新此文件。这是 AI 协作的"交接班记录"。

## 当前阶段
**v2.0 代码全部完成，待部署上线**（2026-06-03）

## v2.0 功能模块

| 模块 | Feature | 状态 | 备注 |
|------|---------|------|------|
| 灵感符号优化 | F4 | ✅ 已完成 | Calendar/DailyDetail ⚡ → SVG 14/18/13px |
| 底部 Tab 导航 | — | ✅ 已完成 | TabBar 组件 + 三页集成 |
| 用户中心页（壳） | F7 | ✅ 已完成 | /profile 路由 + 分类只读列表 |
| 统计页（壳） | F6 | ✅ 已完成 | /stats 路由 + 周/月切换 + 空状态 |
| 分类自定义管理 | F5 | ✅ 已完成 | CRUD + 恢复 + 色盘 + 上限 Toast |
| 统计图表数据 | F6 | ✅ 已完成 | 周柱状图 + 月饼图 + 投入度条 |

> 状态：🔲 待开发 / 🔄 进行中 / ✅ 已完成 / ❌ 阻塞

## 建议开发顺序

1. **F4 灵感图标** — 2 个文件，无依赖，快速验收
2. **Tab 导航结构** — 重构路由入口，为 F5/F6/F7 铺路
3. **F7 用户中心页** — 新建页面壳，无后端依赖
4. **F5 分类管理** — 后端 DB 迁移 + CRUD API + 前端页面
5. **F6 统计总结** — 后端统计 API + 前端图表

## 数据库变更（⚠️ 部署前必须在生产服务器执行）

```sql
ALTER TABLE t_categories ADD COLUMN IF NOT EXISTS is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除';
ALTER TABLE t_categories ADD COLUMN IF NOT EXISTS updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE t_users ADD COLUMN IF NOT EXISTS updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

## 服务启动方式
```bash
# Backend（在 backend/ 目录）
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend（在 frontend/ 目录）
npm run dev   # 跑在 localhost:3000
```

## 关键文档索引

| 文档 | 路径 | 用途 |
|------|------|------|
| 产品需求 | `docs/product/features.md` | v2.0 功能规格、API 定义、边界规则 |
| 技术架构 | `docs/tech/arch.md` | 技术栈、目录结构、API 端点列表 |
| 产品原型 | `prototype/vibcheck.v2.html` | 5 屏 UI 原型图 |
| AI 执行日志 | `docs/state/ai_notes_v2.0.md` | 开发过程思考与决策记录 |
