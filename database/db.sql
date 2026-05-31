-- VibCheck Database Schema
-- MySQL 5.7+
-- 所有表以 t_ 开头

-- ── 用户表 ──────────────────────────────────────────────────────────
CREATE TABLE t_users (
  id          INT          NOT NULL,
  name        VARCHAR(50)  NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

INSERT INTO t_users (id, name) VALUES (1000, 'Oscar');

-- ── 分类表 ──────────────────────────────────────────────────────────
CREATE TABLE t_categories (
  id          INT          NOT NULL AUTO_INCREMENT,
  user_id     INT          NOT NULL,
  name        VARCHAR(50)  NOT NULL,
  color       VARCHAR(7)   NOT NULL COMMENT 'hex色值，如 #4F86E8',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id)
);

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
