# VibCheck · Features

## v1.0（MVP）已交付功能

> 真机测试通过，生产环境运行正常（2026-06-03）

### 边界说明
- 默认用户 user_id=1000, name=Oscar，无登录/注册
- 分类固定 4 个（硬编码）：工作 / 学习 / 运动 / 会议
- 分类自定义管理留到 Post-MVP

---

## Feature 1：日历时间轴页（Calendar View）

### 布局规范（手机端）
- 页面占满整个视口高度（100dvh），不留底部空白
- 顶部：月份导航栏（固定，不随内容滚动）
- 主体：时间轴列表区域，内部纵向滚动（overflow-y: auto）
- 时间轴头部（时间刻度行）固定在列表顶部，随主体横向滚动

### 已实现
- 以月为单位，每天一行，横向时间轴（04:00 – 24:00）
- 每天两行：
  - 上层「实际行」：已发生事项（实色块）+ 灵感 ⚡ 标记
  - 下层「计划行」：计划事项（虚线框），过期后淡化保留
- 色块颜色 = 分类颜色
- 色块透明度 = 投入度（高→实色 / 中→半透明 / 低→淡色）
- 灵感在实际行以 ⚡ 图标标记，仅占一个时间点，无时长
- 前后月切换，快速跳回「今天」
- 点击某天跳转到日期详情页

### 暂不做（Post-MVP）
- 搜索 / 筛选
- 农历 / 节假日显示

---

## Feature 2：日期详情页（Daily Detail View）

### 已实现
- 展示当天全部事项（实际 + 计划 + 灵感）列表，按开始时间升序
- Header mini 时间轴 + 分类投入度统计条
- 底部弹出半屏表单（新增 / 编辑 / 删除）
- 点击卡片进入编辑模式，预填所有字段

### 事项字段

| 字段 | actual | planned | inspiration |
|------|--------|---------|-------------|
| 标题 title | 必填 | 必填 | 必填 |
| 分类 category_id | 必填 | 必填 | — |
| 开始时间 start_time | 必填 | 必填 | 必填（时间点）|
| 结束时间 end_time | 必填 | 必填 | — |
| 投入度 engagement（高/中/低）| 必填 | — | — |
| 过程详情 content | 选填 | 选填 | 选填 |
| 备注 note | — | — | — |

> **note 字段说明**：字段已在数据库预留（TEXT），但 v1.0 表单未向用户开放。预留给未来"快速备注"或"标签"场景使用。

### 暂不做（Post-MTV）
- 复盘统计
- 里程碑节点

---

## Feature 3：数据层

### 表结构（详见 database/db.sql）

**t_users**：用户表，MVP 预置 id=1000 / name=Oscar

**t_categories**：分类表，绑定 user_id，MVP 预置 4 条
- 工作 `#4F86E8` / 学习 `#F0883A` / 运动 `#2DBD8A` / 会议 `#9B72E8`

**t_time_events**：时间事件表，统一存储三种类型
- `type` 枚举：actual / planned / inspiration
- `engagement` 枚举：high / mid / low（仅 actual 有值）
- `category_id`：灵感时为 null
- `end_time`：灵感时为 null
- `note`：简短备注（已预留，v1.0 未开放）
- `content`：过程详情（长文，v1.0 已开放，选填）

---

## Post-MVP 功能池

按价值 × 复杂度综合排序：

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P1 | **分类自定义管理** | 用户可增删改分类名称和颜色，数据层已预留 user_id 绑定 |
| P1 | **复盘统计** | 按分类/周/月汇总投入时长，可视化图表，核心产品价值 |
| P2 | **长期任务 + 里程碑** | 跨天任务和目标追踪，需新表或扩展现有表 |
| P3 | **用户登录 / 注册** | 多用户支持，需要 auth 体系，影响面广 |
| P3 | **数据导出** | 导出 CSV/PDF，依赖统计模块 |
| P4 | **通知提醒** | 需要 PWA Push 或系统通知权限，复杂度高 |

---

---

# VibCheck · v2.0 需求文档

> 需求已锁定（2026-06-03），可进入开发阶段。

## v2.0 目标

让灵感记录更醒目、支持分类自定义管理、通过图表统计帮助用户看见自己的时间投入。

---

## 导航结构变更

| 版本 | 导航形式 |
|------|----------|
| v1.0 | Header 内切换（日历 ↔ 日期详情） |
| v2.0 | 新增底部 Tab 导航栏，三个 Tab |

**Tab 定义：**
| Tab | 图标 | 路由 |
|-----|------|------|
| 日历 | 日历 SVG | `/calendar` |
| 统计 | 柱状图 SVG | `/stats` |
| 我的 | 用户 SVG | `/profile` |

---

## Feature 4：灵感符号优化 ✅

### 背景
⚡ 在日历时间轴上以 9px emoji 渲染，视觉辨识度低，容易被忽略。

### 改动规格
| 位置 | 旧方案 | 新方案 |
|------|--------|--------|
| 日历时间轴 | `⚡` emoji 9px | 内联 SVG 闪电，14px，fill `#FBBF24`，stroke `#F59E0B` |
| 日期详情页 InspirationRow | `⚡` emoji 15px | 内联 SVG 闪电，18px，同色 |
| 日期详情页 MiniTimeline | `⚡` emoji 10px | 内联 SVG 闪电，13px，同色 |

### 交互规则
- 日历时间轴上点击 ⚡ 图标：跳转到该日期的详情页（与点击整行行为一致）

### 影响文件
- `frontend/src/pages/Calendar.tsx`
- `frontend/src/pages/DailyDetail.tsx`

---

## Feature 5：分类自定义管理 ✅

### 入口
用户中心页（「我的」Tab）→「分类管理」模块

### 功能规则

| 操作 | 规则 |
|------|------|
| 查看 | 展示当前用户所有分类（含已逻辑删除），活跃在前，已删除在后 |
| 新增 | 名称 2–4 字，选色；上限 **10 个**（含已删除，见边界规则） |
| 编辑 | 可修改名称和颜色（仅活跃分类） |
| 删除 | 逻辑删除（`is_deleted = 1`），历史事件仍按原色显示 |
| 恢复 | 已删除分类可恢复为活跃状态（`is_deleted = 0`） |

### 边界规则

| 场景 | 处理方式 |
|------|----------|
| 总数（含已删除）已达 10 个，再点「添加分类」 | Toast 提示"已达上限（10个），可恢复已删除分类或先删除旧分类"，拒绝打开新增表单 |
| 已删除分类下的历史 actual 事件 | 不受影响，按原色正常显示 |
| 已删除分类下的计划（planned）事件 | 不处理，分类与计划无强绑定关系 |
| 新增事项表单中选择分类 | 已删除分类以删除样式展示（虚线框+对角线），不可选中 |

### 已删除分类视觉规则（通用）
- **色块**：虚线矩形，内部对角线贯穿，均为虚线，颜色与分类配置色一致
- **名称**：删除线样式
- **操作**：已删除分类显示「恢复」按钮，不显示「编辑」

### 色盘规格
20 个固定颜色，4 行 × 5 列：

```
#EF4444  #F97316  #FBBF24  #84CC16  #22C55E
#14B8A6  #3B82F6  #8B5CF6  #EC4899  #F43F5E
#4F86E8  #F0883A  #2DBD8A  #9B72E8  #E85C8A
#64748B  #78716C  #854D0E  #1E40AF  #065F46
```

### 数据层变更
```sql
ALTER TABLE t_categories ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0;
```

### API 规格

**现有接口变更**
- `GET /api/v1/categories` — 返回所有分类（含已删除），新增 `is_deleted` 字段

**新增接口**

`POST /api/v1/categories` — 新增分类
```json
// Request
{ "name": "阅读", "color": "#E85C8A" }
// Response
{ "id": 5, "user_id": 1000, "name": "阅读", "color": "#E85C8A", "is_deleted": false, "created_at": "..." }
```

`PUT /api/v1/categories/{id}` — 编辑分类（名称/颜色，仅活跃分类）
```json
// Request
{ "name": "深度阅读", "color": "#E85C8A" }
// Response（同上结构）
```

`DELETE /api/v1/categories/{id}` — 逻辑删除
```json
// Response
{ "ok": true }
```

`POST /api/v1/categories/{id}/restore` — 恢复已删除分类
```json
// Response（返回更新后的分类对象）
{ "id": 5, "user_id": 1000, "name": "阅读", "color": "#E85C8A", "is_deleted": false, "created_at": "..." }
```

---

## Feature 6：统计总结 ✅

### 入口
底部 Tab「统计」→ `/stats`，默认进入周视图

### 视图切换
页面顶部 Tab：**周视图** / **月视图**

### 周视图

| 项目 | 规格 |
|------|------|
| 导航 | 自然周（周一~周日），前后周切换，默认当前周 |
| 图表类型 | 堆叠柱状图 |
| 横轴 | 一～日（7 列），今天高亮 |
| 纵轴 | 投入时长（小时），自适应最大值 |
| 色块颜色 | 各分类配置色 |
| 附加信息 | 本周投入度分布（高/中/低 水平比例条） |

### 月视图

| 项目 | 规格 |
|------|------|
| 导航 | 自然月，前后月切换，默认当前月 |
| 图表类型 | 环形饼图（donut） |
| 图例 | 分类名 + 时长（h）+ 百分比，按时长降序 |
| 附加信息 | 本月投入度分布（高/中/低 水平比例条） |

### 空状态规则
- 当周/月无任何 actual 记录时，图表区域显示**占位空状态图**（骨架轮廓，灰色虚线），不报错
- 投入度条显示为纯灰色空条
- 汇总数字显示 `0`

### 统计口径
- 仅统计 `type = 'actual'` 且 `end_time IS NOT NULL` 的事件
- 时长 = `end_time - start_time`（单位：小时，精确到 0.1h）
- 投入度按 `high / mid / low` 分组累加时长，计算百分比

### API 规格

`GET /api/v1/stats/weekly?year=2026&week=23`
```json
// Response
{
  "year": 2026,
  "week": 23,
  "start_date": "2026-06-02",
  "end_date": "2026-06-08",
  "total_hours": 28.5,
  "by_day": [
    {
      "date": "2026-06-02",
      "weekday": 1,
      "total_hours": 4.5,
      "segments": [
        { "category_id": 1, "name": "工作", "color": "#4F86E8", "hours": 3.0 },
        { "category_id": 2, "name": "学习", "color": "#F0883A", "hours": 1.5 }
      ]
    }
  ],
  "engagement": {
    "high_hours": 12.0, "mid_hours": 9.5, "low_hours": 7.0,
    "high_pct": 42, "mid_pct": 33, "low_pct": 25
  }
}
```

`GET /api/v1/stats/monthly?year=2026&month=6`
```json
// Response
{
  "year": 2026,
  "month": 6,
  "total_hours": 113.0,
  "record_days": 22,
  "daily_avg_hours": 3.8,
  "by_category": [
    { "category_id": 1, "name": "工作", "color": "#4F86E8", "hours": 52.0, "pct": 46 },
    { "category_id": 2, "name": "学习", "color": "#F0883A", "hours": 32.0, "pct": 28 },
    { "category_id": 3, "name": "运动", "color": "#2DBD8A", "hours": 18.0, "pct": 16 },
    { "category_id": 4, "name": "会议", "color": "#9B72E8", "hours": 11.0, "pct": 10 }
  ],
  "engagement": {
    "high_hours": 42.9, "mid_hours": 45.2, "low_hours": 24.9,
    "high_pct": 38, "mid_pct": 40, "low_pct": 22
  }
}
```

> 无数据时：`total_hours: 0`，`by_day` / `by_category` 为空数组，`engagement` 全为 0。

---

## Feature 7：用户中心页 ✅

### 路由
`/profile`

### 内容
- 用户信息卡片（头像首字母 + 用户名 Oscar）
- 分类管理模块（分类列表 + 新增入口，即 Feature 5 的完整 UI）

---

## 需求状态

| 模块 | 状态 |
|------|------|
| Feature 4：灵感符号优化 | ✅ 已确认 |
| Feature 5：分类自定义管理 | ✅ 已确认 |
| Feature 6：统计总结 | ✅ 已确认 |
| Feature 7：用户中心页 | ✅ 已确认 |

---

---

# VibCheck · v3.0 需求文档

> 需求已锁定（2026-06-23），可进入开发阶段。

## v3.0 目标

灵感模块支持随笔子类型、主功能支持子分类标签、新增完整记账模块（工程+账单）。

---

## 导航结构变更

| 版本 | Tab 定义 |
|------|----------|
| v2.0 | 日历 / 统计 / 我的 |
| v3.0 | 日历 / **记账** / 统计 / 我的 |

**Tab 定义：**
| Tab | 图标 | 路由 |
|-----|------|------|
| 日历 | 日历 SVG | `/calendar` |
| 记账 | 账本 SVG | `/ledger` |
| 统计 | 柱状图 SVG | `/stats` |
| 我的 | 用户 SVG | `/profile` |

---

## Feature 8：灵感模块改进 ✅

### 图标变更
| 位置 | 旧方案 | 新方案 |
|------|--------|--------|
| 所有灵感图标 | 内联 SVG 闪电（#FBBF24）| 点亮灯泡 SVG（#FBBF24/#F59E0B） |
| 随笔图标 | — | 铅笔 SVG（#8A6A74） |

### 随笔子类型
inspiration 类型下通过 `sub_category` 字段区分两种子类型：

| sub_category 值 | 语义 | 图标 | 表单占位符 |
|-----------------|------|------|-----------|
| `'灵感'`（默认/null） | 突发奇想 | 灯泡 SVG | 灵感一闪… |
| `'随笔'` | 日常工作感悟 | 铅笔 SVG | 记录工作感悟… |

### 表单变更
- inspiration Tab 下新增子类型选择器（两个按钮：灵感 / 随笔）
- sub_category 默认选中"灵感"

### 展示规则
- InspirationRow：按 sub_category 显示对应图标
- MiniTimeline：灵感显示灯泡，随笔显示铅笔
- 日历时间轴：同上

### 数据层
```sql
-- 仅新增 sub_category 字段，type ENUM 不变
ALTER TABLE t_time_events
  ADD COLUMN sub_category VARCHAR(20) DEFAULT NULL;
```

---

## Feature 9：主功能模块改进 ✅

### 改名
| 位置 | 旧文案 | 新文案 |
|------|--------|--------|
| 新增事项弹层 Tab | 已记录 | 记录 |
| 详情页 Section 标题 | 已记录 | 记录 |

### 子分类
- actual / planned 类型支持可选子分类标签
- 输入方式：自由文本，2–8 字，选填
- 存储：`t_time_events.sub_category`（与灵感随笔共用字段）
- 展示：事项卡片标题下方显示小标签（`#tag` 样式）

### API 变更
现有 `POST /api/v1/events` 和 `PUT /api/v1/events/{uuid}` 的 Request body 新增可选字段：
```json
{ "sub_category": "施工管理" }
```
Response 同步返回 `sub_category` 字段。

---

## Feature 10：记账功能 ✅

### 入口
- 底部 Tab「记账」→ `/ledger`（账单列表）
- 「我的」页 → 「记账管理」→ `/ledger/manage`（分类+工程管理）

---

### 10-A 账单列表页（`/ledger`）

| 项目 | 规格 |
|------|------|
| 默认展示 | 最近 20 条账单，按 bill_date 降序 |
| 筛选方式 | 顶部年/月选择器，切换后重新拉取 |
| 汇总 | 筛选期内账单总金额（显示在列表顶部） |
| 账单卡片 | 日期 · 金额 · 账单分类 · 负责人 · 描述 · 关联工程名（若有） |
| 新增入口 | 右下角 FAB |
| 编辑 | 点击卡片打开编辑 Sheet |

**新增/编辑 Sheet 字段：**
| 字段 | 类型 | 必填 |
|------|------|------|
| 账单日期 bill_date | date picker | 必填 |
| 金额 amount | 数字输入 | 必填 |
| 账单分类 category_id | 选择（来自 t_bill_categories）| 选填 |
| 关联工程 project_id | 选择（来自 t_projects 活跃列表）| 选填 |
| 负责人 person | 文本输入 | 选填 |
| 描述 description | 多行文本 | 选填 |

---

### 10-B 记账管理页（`/ledger/manage`）

**两个区块：**

**区块1：账单分类管理**
- 展示所有分类（含已删除），活跃在前
- 操作：新增（名称）/ 编辑 / 逻辑删除

**区块2：工程管理**
- 展示所有工程列表，按 created_at 降序
- 状态标签：筹备 / 进行中 / 已完成 / 已取消
- 点击工程 → 工程详情/编辑页（Sheet 或新页）
- 新增/编辑工程字段：工程名（必填）、负责人（必填）、工程分类、省/市/具体地址、甲方、乙方、合同金额、开始日期、结束日期、状态、描述

---

### API 规格

**账单分类**

`GET /api/v1/bill-categories` — 返回当前用户所有分类（含已删除）

`POST /api/v1/bill-categories`
```json
// Request
{ "name": "材料款" }
// Response
{ "id": 1, "user_id": 1000, "name": "材料款", "is_deleted": false, "created_at": "..." }
```

`PUT /api/v1/bill-categories/{id}`
```json
// Request
{ "name": "材料费" }
```

`DELETE /api/v1/bill-categories/{id}` → `{ "ok": true }`

**工程**

`GET /api/v1/projects` — 返回所有工程（含已删除）

`POST /api/v1/projects`
```json
{
  "name": "XX大桥工程", "maintainer": "张三",
  "category": "桥梁", "province": "广东", "city": "广州",
  "location_detail": "天河区XX路",
  "client": "XX市政局", "contractor": "XX建设",
  "amount": 5000000.00,
  "start_date": "2026-01-01", "finish_date": "2027-06-30",
  "status": "ongoing", "description": "备注"
}
```

`PUT /api/v1/projects/{id}` — 同上字段均可选

`DELETE /api/v1/projects/{id}` → `{ "ok": true }`

**账单**

`GET /api/v1/bills?year=2026&month=6&limit=20&offset=0`
```json
{
  "total": 45,
  "total_amount": 128000.00,
  "items": [
    {
      "id": 1, "bill_date": "2026-06-15", "amount": 50000.00,
      "category_id": 1, "category_name": "材料款",
      "project_id": 2, "project_name": "XX大桥工程",
      "person": "李四", "description": "第一批钢筋款",
      "created_at": "..."
    }
  ]
}
```

`POST /api/v1/bills`
```json
{
  "bill_date": "2026-06-15", "amount": 50000.00,
  "category_id": 1, "project_id": 2,
  "person": "李四", "description": "第一批钢筋款"
}
```

`PUT /api/v1/bills/{id}` — 同上字段均可选

`DELETE /api/v1/bills/{id}` → `{ "ok": true }`

---

### 数据表（见 database/db_v3.0_draft.sql，已由用户确认）

- `t_bill_categories`：账单分类
- `t_projects`：工程（含 maintainer / status / finish_date）
- `t_bills`：账单（project_id 可为 null，person 自由文本）

---

## 需求状态

| 模块 | 状态 |
|------|------|
| Feature 8：灵感模块改进 | ✅ 已确认 |
| Feature 9：主功能改进 | ✅ 已确认 |
| Feature 10：记账功能 | ✅ 已确认 |
