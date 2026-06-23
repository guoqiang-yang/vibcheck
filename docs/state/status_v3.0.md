# VibCheck · v3.0 Project Status

> 每次会话结束后更新此文件。这是 AI 协作的"交接班记录"。

## 当前阶段
**v3.0 代码全部完成，待部署上线**（2026-06-23）

## v3.0 功能模块

| 模块 | Feature | 状态 | 备注 |
|------|---------|------|------|
| 灵感模块改进 | F8 | ✅ 已完成 | 灯泡图标 + 随笔子类型（sub_category） |
| 主功能改进 | F9 | ✅ 已完成 | "已记录"→"记录" + actual/planned 子分类标签 |
| 记账功能 | F10 | ✅ 已完成 | 账单列表 + 筛选 + 工程管理 + 分类管理 |

> 状态：🔲 待开发 / 🔄 进行中 / ✅ 已完成 / ❌ 阻塞

## 数据库变更（⚠️ 部署前必须在生产服务器执行）

```sql
-- 1. t_time_events 加子分类字段
ALTER TABLE t_time_events
  ADD COLUMN sub_category VARCHAR(20) DEFAULT NULL COMMENT '子分类：inspiration下为灵感/随笔；actual/planned下为用户自定义子分类';

-- 2. 新增账单分类表
CREATE TABLE t_bill_categories (
  id          INT          NOT NULL AUTO_INCREMENT,
  user_id     INT          NOT NULL DEFAULT 1000,
  name        VARCHAR(50)  NOT NULL,
  is_deleted  TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id)
);

-- 3. 新增工程表
CREATE TABLE t_projects (
  id               INT           NOT NULL AUTO_INCREMENT,
  user_id          INT           NOT NULL DEFAULT 1000,
  maintainer       VARCHAR(32)   NOT NULL,
  name             VARCHAR(100)  NOT NULL,
  category         VARCHAR(50)   DEFAULT NULL,
  province         VARCHAR(30)   DEFAULT NULL,
  city             VARCHAR(30)   DEFAULT NULL,
  location_detail  VARCHAR(200)  DEFAULT NULL,
  client           VARCHAR(100)  DEFAULT NULL,
  contractor       VARCHAR(100)  DEFAULT NULL,
  amount           DECIMAL(12,2) DEFAULT NULL,
  start_date       DATE          DEFAULT NULL,
  finish_date      DATE          DEFAULT NULL,
  status           ENUM('prepare','ongoing','finished','canceled') DEFAULT NULL,
  description      TEXT          DEFAULT NULL,
  is_deleted       TINYINT(1)    NOT NULL DEFAULT 0,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id)
);

-- 4. 新增账单表
CREATE TABLE t_bills (
  id           BIGINT        NOT NULL AUTO_INCREMENT,
  user_id      INT           NOT NULL DEFAULT 1000,
  project_id   INT           DEFAULT NULL,
  bill_date    DATE          NOT NULL,
  amount       DECIMAL(12,2) NOT NULL,
  category_id  INT           DEFAULT NULL,
  description  TEXT          DEFAULT NULL,
  person       VARCHAR(50)   DEFAULT NULL,
  is_deleted   TINYINT(1)    NOT NULL DEFAULT 0,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_project_id (project_id),
  KEY idx_bill_date (bill_date)
);
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
| 产品需求 | `docs/product/features.md` | v3.0 功能规格、API 定义、边界规则 |
| 技术架构 | `docs/tech/arch.md` | 技术栈、目录结构、API 端点列表 |
| 表结构草稿 | `database/db_v3.0_draft.sql` | 用户确认后的完整表设计 |
| AI 执行日志 | `docs/state/ai_notes_v2.0.md` | 开发过程思考与决策记录 |
