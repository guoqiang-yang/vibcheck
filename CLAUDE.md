# VibCheck · AI 协作指南

## 项目简介
个人日程记录与规划 App，手机 Web（PWA）形态。
以"天"为单位记录事项，颜色=分类，透明度=投入度。

## 快速上手
开始工作前，按顺序读以下文件：
1. `docs/state/status_v2.0.md` — 当前进度、待做事项、服务启动方式
2. `docs/product/features.md` — 功能规则、字段定义、API schema
3. `docs/tech/arch.md` — 技术栈、目录结构、API 约定
4. `docs/state/ai_notes_v2.0.md` — AI 执行日志（了解决策过程和踩过的坑）

> state 目录文档命名规则：`{type}_v{version}.md`，如 `status_v2.0.md` / `ai_notes_v2.0.md` / `bugs_v2.0.md`
> `ai_notes_v2.0.md` 按「日期 + Task」组织，记录每个阶段的思考过程与执行步骤。

## 技术栈
- Frontend: React + Vite + TypeScript + Tailwind CSS（端口 3000）
- Backend: Python + FastAPI + SQLAlchemy（端口 8000）
- Database: MySQL 本机（连接信息见 backend/.env，勿提交）

## 版本迭代协作流程（强制）

每个大版本迭代必须严格遵守以下顺序，**不得跳过任何步骤直接进入开发**：

1. **用户先写原始需求** — 在 `docs/product/raw_require.md` 自由描述想法，语言可随意不严谨
2. **AI 协助细化** — 读取原始需求，提出问题、补全字段、明确边界，双方对齐
3. **需求入档** — 细化确认后，由 AI 整理写入 `docs/product/features.md` 对应版本章节
4. **需求锁定** — 所有模块状态变为「✅ 已确认」后，才能进入开发阶段
5. **逐步实现** — 按模块拆解开发任务，逐一完成

> 如果用户未完成原始需求就要求开发，AI 应提醒用户先在 `raw_require.md` 写下想法，再开始细化和实现。

## 关键规范
- 数据库表以 `t_` 开头
- 默认用户 user_id=1000（Oscar），MVP 无登录
- API 前缀：`/api/v1/`
- 文件修改前先草稿确认，再写入

## 目录结构
```
vibcheck/
├── frontend/        # React 前端
├── backend/         # FastAPI 后端
├── database/db.sql  # 表结构定义（权威）
├── prototype/       # 产品原型 HTML（vibcheck.v2.html）
└── docs/
    ├── product/     # vision.md / features.md / raw_require.md
    ├── tech/        # arch.md
    └── state/       # status_v2.0.md / ai_notes_v2.0.md / bugs_v2.0.md
```


## 生产环境部署（Ubuntu 24.04）

如需了解可以读取 README.Deploy.md


### 三、后续更新

```bash
bash /opt/vibcheck/deploy/deploy.sh
```

### 四、常用运维命令

```bash
systemctl status vibcheck        # 查看后端状态
journalctl -u vibcheck -f        # 实时查看后端日志
systemctl reload nginx           # 重载 nginx 配置
```
