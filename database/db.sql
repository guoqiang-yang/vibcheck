-- VibCheck Database Schema
-- MySQL 5.7+
-- 所有表以 t_ 开头

-- ── 用户表 ──────────────────────────────────────────────────────────
CREATE TABLE t_users (
  id          INT          NOT NULL,
  name        VARCHAR(50)  NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

INSERT INTO t_users (id, name) VALUES (1000, 'Oscar');

-- ── 分类表 ──────────────────────────────────────────────────────────
CREATE TABLE t_categories (
  id          INT          NOT NULL AUTO_INCREMENT,
  user_id     INT          NOT NULL,
  name        VARCHAR(50)  NOT NULL,
  color       VARCHAR(7)   NOT NULL COMMENT 'hex色值，如 #4F86E8',
  is_deleted  TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '逻辑删除：0=正常，1=已删除',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id)
);

-- v2.0 迁移（已有数据库执行此语句）：
-- ALTER TABLE t_categories ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '逻辑删除：0=正常，1=已删除';
-- ALTER TABLE t_categories ADD COLUMN   updated_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
-- ALTER TABLE t_users ADD COLUMN   updated_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

INSERT INTO t_categories (user_id, name, color) VALUES
  (1000, '工作', '#4F86E8'),
  (1000, '学习', '#F0883A'),
  (1000, '运动', '#2DBD8A'),
  (1000, '会议', '#9B72E8');

-- ── 时间事件表 ──────────────────────────────────────────────────────
CREATE TABLE t_time_events (
  id           BIGINT                                   NOT NULL AUTO_INCREMENT,
  uuid         VARCHAR(36)                              NOT NULL COMMENT 'uuid',
  user_id      INT                                      NOT NULL,
  date         DATE                                     NOT NULL,
  title        VARCHAR(100)                             NOT NULL,
  type         ENUM('actual', 'planned', 'inspiration') NOT NULL,
  category_id  INT                                      DEFAULT NULL COMMENT '灵感时为 null',
  start_time   TIME                                     NOT NULL,
  end_time     TIME                                     DEFAULT NULL COMMENT '灵感时为 null',
  engagement   ENUM('high', 'mid', 'low')               DEFAULT NULL COMMENT '仅 actual 有值',
  note         TEXT                                     DEFAULT NULL COMMENT '简短备注',
  content      TEXT                                     DEFAULT NULL COMMENT '过程详情',
  created_at   DATETIME                                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME                                 NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_uuid (uuid),
  KEY idx_user_date (user_id, date)
);

-- ── v3.0 迁移（已有数据库执行此语句）────────────────────────────────
-- ALTER TABLE t_time_events ADD COLUMN sub_category VARCHAR(20) DEFAULT NULL COMMENT '子分类：inspiration下为灵感/随笔；actual/planned下为用户自定义子分类';

-- ── 账单分类表 ───────────────────────────────────────────────────────
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

-- ── 工程表 ──────────────────────────────────────────────────────────
CREATE TABLE t_projects (
  id               INT           NOT NULL AUTO_INCREMENT,
  user_id          INT           NOT NULL DEFAULT 1000,
  maintainer       VARCHAR(32)   NOT NULL COMMENT '负责人',
  name             VARCHAR(100)  NOT NULL COMMENT '工程/项目名',
  category         VARCHAR(50)   DEFAULT NULL COMMENT '工程分类',
  province         VARCHAR(30)   DEFAULT NULL COMMENT '省',
  city             VARCHAR(30)   DEFAULT NULL COMMENT '市',
  location_detail  VARCHAR(200)  DEFAULT NULL COMMENT '具体地址',
  client           VARCHAR(100)  DEFAULT NULL COMMENT '甲方',
  contractor       VARCHAR(100)  DEFAULT NULL COMMENT '乙方',
  amount           DECIMAL(12,2) DEFAULT NULL COMMENT '合同总金额',
  start_date       DATE          DEFAULT NULL COMMENT '开始日期',
  finish_date      DATE          DEFAULT NULL COMMENT '结束日期',
  status           ENUM('prepare','ongoing','finished','canceled') DEFAULT NULL COMMENT '工程状态',
  description      TEXT          DEFAULT NULL COMMENT '备注',
  is_deleted       TINYINT(1)    NOT NULL DEFAULT 0,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id)
);

-- ── 账单表 ──────────────────────────────────────────────────────────
CREATE TABLE t_bills (
  id           BIGINT        NOT NULL AUTO_INCREMENT,
  user_id      INT           NOT NULL DEFAULT 1000,
  project_id   INT           DEFAULT NULL COMMENT '关联工程，可为null',
  bill_date    DATE          NOT NULL COMMENT '账单日期',
  amount       DECIMAL(12,2) NOT NULL COMMENT '金额',
  category_id  INT           DEFAULT NULL COMMENT '关联 t_bill_categories',
  description  TEXT          DEFAULT NULL COMMENT '描述',
  person       VARCHAR(50)   DEFAULT NULL COMMENT '负责人',
  is_deleted   TINYINT(1)    NOT NULL DEFAULT 0,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_project_id (project_id),
  KEY idx_bill_date (bill_date)
);
