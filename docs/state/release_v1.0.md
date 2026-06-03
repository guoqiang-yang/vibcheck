# VibCheck v1.0 发布说明

**发布日期**：2026-06-03
**Git Tag**：`v1.0`
**开发周期**：2026-05-28 → 2026-06-03（7 天）

---

## 产品定位

个人日程记录与规划 App，手机 Web（PWA）形态。
以"天"为单位记录事项，核心视觉语言：**颜色 = 分类，透明度 = 投入度**。

---

## 功能清单

### 日历时间轴页（Calendar）
- 月视图，每天一行横向时间轴（04:00–24:00）
- 每天两行：上层「实际行」（实色块）+ 下层「计划行」（虚线框）
- 色块颜色 = 分类，透明度 = 投入度（高/中/低）
- 灵感以 ⚡ 图标标记，仅占时间点
- 前后月切换 + 跳回今天
- 点击某天进入详情页

### 日期详情页（DailyDetail）
- 展示当天全部事项（已记录 / 计划 / 灵感），按开始时间升序
- Header：mini 时间轴 + 分类投入度统计条
- 底部半屏表单：新增 / 编辑 / 删除
- 三种事项类型字段差异：
  - 已记录（actual）：标题、分类、开始/结束时间、投入度、详细记录
  - 计划（planned）：标题、分类、开始/结束时间、详细记录
  - 灵感（inspiration）：标题、时间点、详细记录

### 数据层
- 三张表：`t_users` / `t_categories` / `t_time_events`
- 默认用户 Oscar（id=1000），4 个默认分类（工作/学习/运动/会议）
- API：`GET/POST/PUT/DELETE /api/v1/events`，`GET /api/v1/categories`

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React + Vite + TypeScript + Tailwind CSS + PWA |
| 后端 | Python + FastAPI + SQLAlchemy + uvicorn |
| 数据库 | MySQL |
| 部署 | Ubuntu 24.04 + Nginx + systemd |

---

## Bug 修复记录

| Bug | 现象 | Root Cause | 修复 |
|-----|------|-----------|------|
| BUG-001 | 结束时间字段被截断 | `input[type=time]` iOS 内置 min-width 撑破 flex 容器；`overflowY:auto` 隐式裁断横向 | `overflowX:hidden` + input 加 `minWidth:0` |
| BUG-001 | focus 输入框页面放大 | iOS Safari input font-size < 16px 触发自动 zoom | `inputStyle.fontSize: 14 → 16` |
| BUG-001-reopen | 时间框重叠 + 样式丢失（iOS 真机） | iOS `-webkit-appearance:auto` 覆盖自定义 CSS，原生 size 超出 flex/grid 边界 | flex → CSS Grid `1fr 1fr`；加 `appearance:none` |
| BUG-002 | 今天日期高亮错误（显示昨天） | `toISOString()` 返回 UTC，UTC+8 下跨日差 8 小时 | 新增 `localDateStr()` helper，用本地时间 |
| BUG-003 | `<` 跳两天，`>` 无反应 | `shiftDate` 用 `toISOString()` 导致日期偏移，+1 返回原日期，-1 跳过一天 | `shiftDate` 末尾改用 `localDateStr()` |

---

## 关键经验（iOS Safari 踩坑）

1. **`overflowY:auto` 会隐式改 `overflow-x`**：移动端布局需同时声明两个方向
2. **`input[type=time/date]` 默认 `-webkit-appearance:auto`**：会覆盖所有自定义 CSS，必须加 `appearance:none`
3. **`input` font-size < 16px 触发 iOS 自动 zoom**：所有 input 统一用 ≥16px
4. **`toISOString()` 是 UTC 时间**：涉及"今天"的逻辑必须用本地时间 `getFullYear/Month/Date`
5. **`flex:1` 无法严格约束 iOS native input 宽度**：用 CSS Grid `1fr` 才是硬性边界

---

## Post-MVP 功能池

1. 分类自定义管理（名称 + 颜色）
2. 复盘统计（按分类 / 按周月汇总）
3. 长期任务 + 里程碑
4. 用户登录 / 注册
5. 数据导出
6. 通知提醒

---

## Git 提交历史

```
30e07e3 docs: mark BUG-001-reopen as fixed
eb2d86d fix: add appearance:none to time inputs to fix iOS native override
2d75bcf fix: use local date instead of UTC to fix today highlight and nav
dc6c7a3 docs: MVP complete — add retrospective and update status
2e50a00 fix: use CSS grid for time fields to prevent overlap on iOS
4283ede fix: time fields clipped and iOS input zoom on add-event sheet
12cd91d fix
778c99f fix: calendar row overflow, detail page clip, keyboard avoidance
7f0dbd8 add gitignore
0398bde fix: adaptive row height in calendar
8983442 fix: ts
efdfc8b vibcheck mvp（初始提交）
```
