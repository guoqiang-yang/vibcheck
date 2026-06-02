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

---

## 2026-06-02 ～ 2026-06-03

### Task: 真机测试 + iOS Bugfix

真机测试暴露 iOS Safari 专属问题（BUG-001），经过 3 轮迭代修复：

**第 1 轮**（错误诊断）：以为只是 Field 包装层缺 `minWidth:0`，加了之后部署发现无效。

**第 2 轮**（定位双重根因）：
- 问题 1（输入框遮挡）：`input[type="time"]` 在 iOS 有浏览器内置 `min-width: auto`，只给 div 加 `minWidth:0` 不够；同时 `overflowY:auto` 容器隐式将 `overflow-x` 改为 `auto`，水平溢出被裁剪
- 问题 2（focus 页面缩放）：`inputStyle.fontSize: 14` < 16px，iOS Safari 规则：input font-size 小于 16px 时 focus 触发自动 zoom
- 修复：input 元素本身加 `minWidth:0`，容器加 `overflowX:'hidden'`，fontSize 14→16

**第 3 轮**（彻底修复重叠）：flex 布局中 `flex:1` 无法完全约束 iOS native time input 的渲染边界，改用 CSS Grid `gridTemplateColumns: '1fr 1fr'`——Grid 列宽是硬性约束，彻底消除重叠。

**建立 Bug 追踪机制**：新增 `docs/state/bugs.mvp.md`，用户登记、AI 修复、记录 Root Cause + Fix，形成可追溯的缺陷管理流程。

---

## MVP 完结总结（2026-06-03）

### 产品目标回顾
个人日程记录与规划 App（手机 Web PWA），以"天"为单位记录事项。
核心视觉语言：**颜色 = 分类，透明度 = 投入度**。

### 交付物清单

| 类别 | 内容 |
|------|------|
| 文档 | vision.md / features.md / arch.md / status.md / bugs.mvp.md |
| 数据库 | t_users / t_categories / t_time_events，种子数据就绪 |
| Backend | FastAPI + SQLAlchemy，完整 CRUD（categories + events），部署于生产 |
| Frontend | React + Vite + TypeScript + PWA，Calendar 页 + DailyDetail 页，部署于生产 |
| AI 协作 | CLAUDE.md + .claude/memory/ 体系，可跨会话延续上下文 |

### 核心功能
- **日历时间轴页**：月视图，每天实际行 + 计划行，色块 = 分类×投入度，前后月切换，跳今天
- **日期详情页**：事项列表（actual / planned / inspiration），mini 时间轴 + 统计条，底部半屏表单新增/编辑/删除
- **数据层**：三种事项类型统一在 t_time_events（type 字段区分），投入度 high/mid/low，灵感无 category/end_time

### 关键决策
| 决策 | 原因 |
|------|------|
| MVP 不做登录，预置 user_id=1000 | 降低复杂度，快速验证产品 |
| 分类固定 4 个 | 快速迭代，Post-MVP 再做自定义 |
| actual/planned/inspiration 合并一张表 | 避免过度设计，type 字段区分 |
| 透明度 = 投入度（高/中/低） | 产品核心视觉表达 |

### 踩坑 & 经验
- `overflowY:auto` 会隐式改变 `overflow-x`，移动端布局必须同时处理两个方向
- iOS `input[type="time"]` 有内置最小宽度，flex 布局不可靠，应用 CSS Grid
- iOS Safari input font-size < 16px 触发自动 zoom，所有 input 需 ≥16px
- 移动端 `100dvh` 优于 `100vh`（处理地址栏动态高度）

### Post-MVP 功能池
- 分类自定义管理（名称 + 颜色）
- 复盘统计（按分类 / 按周月汇总）
- 长期任务 + 里程碑
- 用户登录 / 注册
- 数据导出
- 通知提醒

### Git 提交记录
```
2e50a00 fix: use CSS grid for time fields to prevent overlap on iOS
4283ede fix: time fields clipped and iOS input zoom on add-event sheet
12cd91d fix
778c99f fix: calendar row overflow, detail page clip, keyboard avoidance
7f0dbd8 add gitignore
0398bde fix: adaptive row height in calendar
8983442 fix: ts
efdfc8b vibcheck mvp（初始提交）
```
