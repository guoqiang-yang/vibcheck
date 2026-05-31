# AI 工作日志
> 触发指令：「总结 memory」更新此文件。

---

## 2026-05-28

### Task: 产品奠基
- 通过 4 问梳理产品定位（用户/场景/差异/MVP边界）
- 确认核心视觉规则：颜色=分类，透明度=投入度（高/中/低）
- 确认三种事件类型：actual / planned / inspiration（⚡，只有时间点）
- 确认字段：note（简短备注）+ content（过程详情）
- 输出：vision.md / features.md / status.md

### Task: 技术选型
- 前端：React + Vite + TypeScript + Tailwind CSS + PWA
- 后端：Python + FastAPI + SQLAlchemy + PyMySQL
- 前后端分离，同一 git 仓库，端口 3000 / 8000
- 输出：arch.md

### Task: 数据库设计与建表
- 三张表（t_ 前缀）：t_users / t_categories / t_time_events
- id 用 BIGINT AUTO_INCREMENT，另加 uuid VARCHAR(36) 字段
- 建表成功，种子数据入库（Oscar + 工作/学习/运动/会议）
- 输出：database/db.sql，远程 MySQL 建表验证通过

### Task: Backend 开发
- FastAPI 脚手架 + 远程 MySQL 连接验证
- 实现接口：GET /categories，GET/POST/PUT/DELETE /events
- 支持按 date 或 start_date/end_date 查询
- 验证：/api/v1/health 正常，全接口测试通过

### Task: Frontend 脚手架
- React + Vite + Tailwind + PWA 初始化
- 路由：/calendar（日历页）/ /daily/:date（详情页）
- 完成：types/index.ts / api/client.ts / 页面占位组件
- 坑：curl 测试本地服务需加 `--noproxy '*'` 绕过系统代理

### Task: AI 协作体系建立
- memory 存放在项目级（.claude/memory/），不写系统目录
- CLAUDE.md 作为多 AI 协作统一入口，Claude Code 自动加载
- 约定工作方式：写文件前先草稿确认，每次只做一件事
