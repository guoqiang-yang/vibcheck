# VibCheck · Bug 追踪

## 规则
- **用户**：在「待修复」区添加条目，格式见模板
- **AI**：修复后移至「已修复」，填写 Fix 说明和日期
- 状态：`🔴 待修复` / `🟡 排查中` / `🟢 已修复` / `⚪ 无法复现/不处理`

---

## 条目模板

```
### BUG-XXX · [一句话描述]
- **发现日期**：YYYY-MM-DD
- **页面/功能**：
- **复现步骤**：
- **截图**：（路径或描述）
- **状态**：🔴 待修复
```

---

## 待修复


---

## 已修复

### BUG-001 · 新建已记录事项——结束时间字段被截断 + 输入框 focus 页面放大
- **发现日期**：2026-06-02
- **修复日期**：2026-06-02
- **截图**：`resource/bugfix/mvp/detail-0602-01.png`
- **描述**：
  - 问题1：开始时间、结束时间两个输入框有遮挡（结束时间被截断不可见）
  - 问题2：focus 任意输入框时页面放大并超出屏幕
- **Root Cause**：
  - 问题1：`input[type="time"]` 在 iOS 有浏览器内置 `min-width: auto`，仅给 Field 包装 div 加 `minWidth:0` 不够，input 元素本身仍会撑出去；加上 `overflowY:auto` 滚动容器隐式将 `overflow-x` 改为 `auto`，水平溢出内容被裁剪
  - 问题2：iOS Safari 规定：input `font-size < 16px` 时 focus 会触发页面自动 zoom，导致页面变宽超出屏幕
- **Fix**：
  - `DailyDetail.tsx:443` — 滚动容器加 `overflowX: 'hidden'`
  - `DailyDetail.tsx:482,486` — 两个 `input[type="time"]` 的 style 加 `minWidth: 0`
  - `DailyDetail.tsx:310` — `inputStyle.fontSize` 从 `14` 改为 `16`（≥16px 才不触发 iOS 自动缩放）
- **状态**：🟢 已修复

### BUG-001-reopen · 时间框遮挡（部分机型）
- **发现日期**：2026-06-03
- **描述**：部分机型两个时间框有遮挡，部分机型正常
- **状态**：🟡 排查中（已用 CSS Grid 修复主要场景，持续观察）

---

### BUG-002 · 今天日期显示错误（日历页高亮昨天）
- **发现日期**：2026-06-03
- **修复日期**：2026-06-03
- **截图**：`resource/bugfix/mvp/calender-0603-01.png`
- **描述**：今天是6月3日，日历页高亮显示的是6月2日
- **Root Cause**：`new Date().toISOString()` 返回 UTC 时间，中国 UTC+8 时本地 6月3日 00:00–07:59 对应 UTC 仍是 6月2日，导致 `todayStr` 偏早一天。Calendar.tsx、DailyDetail.tsx 均有此问题。
- **Fix**：新增 `localDateStr(d)` helper（用 `getFullYear/Month/Date` 读取本地时间），替换所有 `toISOString().slice(0,10)` 用法：`Calendar.tsx:43`、`DailyDetail.tsx:569`
- **状态**：🟢 已修复

### BUG-003 · 详情页日期切换按钮异常（`<` 跳两天，`>` 无反应）
- **发现日期**：2026-06-03
- **修复日期**：2026-06-03
- **截图**：`resource/bugfix/mvp/detail-0603-02.png`
- **描述**：点 `<` 从6月2日跳到5月31日（跳过6月1日）；点 `>` 无任何反应
- **Root Cause**：`shiftDate` 函数末尾用 `d.toISOString().slice(0,10)` 将本地时间转为 UTC 字符串，导致偏移：`new Date("2026-06-02T00:00:00")` 在 UTC+8 下实为 UTC June 1 16:00；+1天 = UTC June 2 16:00 → `toISOString()` 仍返回 "2026-06-02"（无变化，`>` 没反应）；-1天 = UTC May 31 16:00 → 返回 "2026-05-31"（跳过一天）
- **Fix**：`DailyDetail.tsx:27-30` — `shiftDate` 末尾改用 `localDateStr(d)`，同步修复 `shiftDate` 和 `useParams` 默认日期
- **状态**：🟢 已修复