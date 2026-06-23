-- VibCheck v3.0 表结构草稿（待用户确认后正式写入 db.sql）
-- 修改完成后告知 AI，AI 将据此整理 features.md 并进入开发

-- ══════════════════════════════════════════════
-- 一、现有表变更
-- ══════════════════════════════════════════════

-- 1. t_time_events：新增子分类字段
--    type ENUM 不变（actual / planned / inspiration）
--    灵感模块的随笔与灵感通过 sub_category 区分：'灵感' | '随笔'
--    actual/planned 的子分类也存于此字段（自由文本 2-8 字）
--    （生产环境迁移语句）
ALTER TABLE t_time_events
  ADD COLUMN sub_category VARCHAR(20) DEFAULT NULL COMMENT '子分类：inspiration 下为灵感/随笔；actual/planned 下为用户自定义子分类';


-- ══════════════════════════════════════════════
-- 二、新增表
-- ══════════════════════════════════════════════

-- 2. 账单分类表（在「记账管理」页维护）
CREATE TABLE t_bill_categories (
  id          INT          NOT NULL AUTO_INCREMENT,
  user_id     INT          NOT NULL DEFAULT 1000,
  name        VARCHAR(50)  NOT NULL COMMENT '分类名称',
  is_deleted  TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id)
);


-- 3. 工程表
CREATE TABLE t_projects (
  id               INT           NOT NULL AUTO_INCREMENT,
  user_id          INT           NOT NULL DEFAULT 0,
  maintainer       VARCHAR(32)   NOT NULL COMMENT '负责人',
  name             VARCHAR(100)  NOT NULL COMMENT '工程/项目名',
  category         VARCHAR(50)   DEFAULT NULL COMMENT '工程分类，自由文本',
  province         VARCHAR(30)   DEFAULT NULL COMMENT '省',
  city             VARCHAR(30)   DEFAULT NULL COMMENT '市',
  location_detail  VARCHAR(200)  DEFAULT NULL COMMENT '具体地址',
  client           VARCHAR(100)  DEFAULT NULL COMMENT '甲方',
  contractor       VARCHAR(100)  DEFAULT NULL COMMENT '乙方',
  amount           DECIMAL(12,2) DEFAULT NULL COMMENT '合同总金额',
  start_date       DATE          DEFAULT NULL COMMENT '开始日期',
  finish_date      DATE          DEFAULT NULL COMMENT '结束日期',
  status           ENUM('prepare', 'ongoing', 'finished', 'canceled') DEFAULT NULL COMMENT '工程状态',
  description      TEXT          DEFAULT NULL COMMENT '备注',
  is_deleted       TINYINT(1)    NOT NULL DEFAULT 0,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id)
);


-- 4. 账单表
CREATE TABLE t_bills (
  id           BIGINT        NOT NULL AUTO_INCREMENT,
  user_id      INT           NOT NULL DEFAULT 0,
  project_id   INT           DEFAULT NULL COMMENT '关联工程，可为 null（独立账单）',
  bill_date    DATE          NOT NULL COMMENT '账单日期',
  amount       DECIMAL(12,2) NOT NULL COMMENT '金额',
  category_id  INT           DEFAULT NULL COMMENT '关联 t_bill_categories',
  description  TEXT          DEFAULT NULL COMMENT '描述',
  person       VARCHAR(50)   DEFAULT NULL COMMENT '负责人，自由文本',
  is_deleted   TINYINT(1)    NOT NULL DEFAULT 0,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_project_id (project_id),
  KEY idx_bill_date (bill_date)
);
