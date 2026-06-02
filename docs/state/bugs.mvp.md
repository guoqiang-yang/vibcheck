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

