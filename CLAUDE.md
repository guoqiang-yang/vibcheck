# VibCheck · AI 协作指南

## 项目简介
个人日程记录与规划 App，手机 Web（PWA）形态。
以"天"为单位记录事项，颜色=分类，透明度=投入度。

## 快速上手
开始工作前，按顺序读以下文件：
1. `docs/state/status.md` — 当前进度、待做事项、服务启动方式
2. `docs/product/features.md` — 功能规则、字段定义
3. `docs/tech/arch.md` — 技术栈、目录结构、API 约定
4. `docs/state/ai_notes.mvp.md` — AI 执行日志（了解决策过程和踩过的坑）

> `ai_notes.mvp.md` 按「日期 + Task」组织，记录每个阶段的思考过程与执行步骤。
> 触发指令：「总结 memory」由 AI 追加更新。

## 技术栈
- Frontend: React + Vite + TypeScript + Tailwind CSS（端口 3000）
- Backend: Python + FastAPI + SQLAlchemy（端口 8000）
- Database: MySQL 本机（连接信息见 backend/.env，勿提交）

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
└── docs/
    ├── product/     # vision.md / features.md
    ├── tech/        # arch.md
    └── state/       # status.md / ai_notes.mvp.md
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
