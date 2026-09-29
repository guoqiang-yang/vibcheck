import { useEffect, useMemo, useState } from 'react'
import { api } from './api/client'
import type { BillCategory, BillCreate, BillItem, Project } from './types'

type BillFormState = {
  bill_date: string
  amount: string
  category_id: string
  project_id: string
  person: string
  description: string
}

type CategoryFormState = {
  id?: number
  name: string
  parent_id: number | null
}

const CATEGORY_COLORS = ['#1D4ED8', '#0F766E', '#CA8A04', '#C2410C', '#7C3AED', '#64748B', '#DB2777', '#0891B2']

function today() {
  return new Date().toISOString().slice(0, 10)
}

function monthStart(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}-01`
}

function monthEnd(year: number, month: number) {
  return new Date(year, month, 0).toISOString().slice(0, 10)
}

function formatMoney(value: number) {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function projectStatusText(status: Project['status']) {
  const map = { prepare: '筹备中', ongoing: '进行中', finished: '已完成', canceled: '已取消' }
  return status ? map[status] : '未设置'
}

function Icon({ name }: { name: 'plus' | 'download' | 'edit' | 'trash' | 'filter' | 'search' | 'close' | 'chart' | 'list' | 'building' | 'users' | 'settings' | 'sliders' }) {
  const paths = {
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
    trash: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></>,
    filter: <><path d="M3 6h18" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
    search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
    close: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 15v-5" /><path d="M12 15V7" /><path d="M16 15v-3" /></>,
    list: <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>,
    building: <><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></>,
    settings: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
    sliders: <><path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" /></>,
  }
  return <svg className="icon" viewBox="0 0 24 24">{paths[name]}</svg>
}

export default function App() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [startDate, setStartDate] = useState(monthStart(year, month))
  const [endDate, setEndDate] = useState(monthEnd(year, month))
  const [categoryFilter, setCategoryFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [keyword, setKeyword] = useState('')
  const [bills, setBills] = useState<BillItem[]>([])
  const [categories, setCategories] = useState<BillCategory[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [billDraft, setBillDraft] = useState<BillFormState | null>(null)
  const [editingBillId, setEditingBillId] = useState<number | null>(null)
  const [categoryDraft, setCategoryDraft] = useState<CategoryFormState | null>(null)
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [billData, categoryData, projectData] = await Promise.all([
        api.getBills({ year, month, limit: 500 }),
        api.getBillCategories(),
        api.getProjects(),
      ])
      setBills(billData.items)
      setCategories(categoryData)
      setProjects(projectData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setStartDate(monthStart(year, month))
    setEndDate(monthEnd(year, month))
  }, [year, month])

  useEffect(() => {
    void loadData()
  }, [year, month])

  const categoryName = new Map(categories.map(item => [item.id, item.name]))
  const categoryLabel = (category: BillCategory) => category.parent_id ? `${categoryName.get(category.parent_id) ?? '未分组'} / ${category.name}` : category.name
  const parentCategories = categories.filter(item => !item.is_deleted && item.parent_id == null)
  const rootCategories = categories.filter(item => item.parent_id == null)
  const orderedCategories = [
    ...rootCategories.flatMap(parent => [
      parent,
      ...categories.filter(child => child.parent_id === parent.id),
    ]),
    ...categories.filter(item => item.parent_id != null && !categories.some(parent => parent.id === item.parent_id)),
  ]
  const activeCategories = orderedCategories.filter(item => !item.is_deleted)
  const activeProjects = projects.filter(item => !item.is_deleted)

  const filteredBills = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return bills.filter(bill => {
      if (startDate && bill.bill_date < startDate) return false
      if (endDate && bill.bill_date > endDate) return false
      if (categoryFilter && String(bill.category_id ?? '') !== categoryFilter) return false
      if (projectFilter && String(bill.project_id ?? '') !== projectFilter) return false
      if (!q) return true
      return [bill.person, bill.description, bill.project_name, bill.category_name]
        .filter(Boolean)
        .some(value => value!.toLowerCase().includes(q))
    })
  }, [bills, categoryFilter, endDate, keyword, projectFilter, startDate])

  const totalAmount = filteredBills.reduce((sum, bill) => sum + Number(bill.amount), 0)
  const projectAmount = filteredBills.filter(bill => bill.project_id != null).reduce((sum, bill) => sum + Number(bill.amount), 0)
  const unlinkedCount = filteredBills.filter(bill => bill.project_id == null).length

  const categoryStats = useMemo(() => {
    const map = new Map<number | -1, { id: number | null; name: string; amount: number; count: number; last?: BillItem }>()
    filteredBills.forEach(bill => {
      const id = bill.category_id ?? -1
      const category = categories.find(item => item.id === bill.category_id)
      const current = map.get(id) ?? { id: bill.category_id, name: category ? categoryLabel(category) : bill.category_name ?? '未分类', amount: 0, count: 0 }
      current.amount += Number(bill.amount)
      current.count += 1
      if (!current.last || bill.bill_date > current.last.bill_date) current.last = bill
      map.set(id, current)
    })
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount)
  }, [categories, filteredBills])

  const projectStats = useMemo(() => {
    const map = new Map<number, { project: Project; amount: number; count: number }>()
    filteredBills.forEach(bill => {
      if (bill.project_id == null) return
      const project = projects.find(item => item.id === bill.project_id)
      if (!project) return
      const current = map.get(project.id) ?? { project, amount: 0, count: 0 }
      current.amount += Number(bill.amount)
      current.count += 1
      map.set(project.id, current)
    })
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount).slice(0, 3)
  }, [filteredBills, projects])

  function openNewBill() {
    setEditingBillId(null)
    setBillDraft({
      bill_date: today(),
      amount: '',
      category_id: activeCategories[0] ? String(activeCategories[0].id) : '',
      project_id: '',
      person: '',
      description: '',
    })
  }

  function openEditBill(bill: BillItem) {
    setEditingBillId(bill.id)
    setBillDraft({
      bill_date: bill.bill_date,
      amount: String(bill.amount),
      category_id: bill.category_id ? String(bill.category_id) : '',
      project_id: bill.project_id ? String(bill.project_id) : '',
      person: bill.person ?? '',
      description: bill.description ?? '',
    })
  }

  function openCategory(category?: BillCategory) {
    setCategoryDraft(category ? { id: category.id, name: category.name, parent_id: category.parent_id } : { name: '', parent_id: null })
  }

  async function saveBill() {
    if (!billDraft || !billDraft.bill_date || !billDraft.amount || !billDraft.category_id) return
    setSaving(true)
    const body: BillCreate = {
      bill_date: billDraft.bill_date,
      amount: Number(billDraft.amount),
      category_id: Number(billDraft.category_id),
      ...(billDraft.project_id ? { project_id: Number(billDraft.project_id) } : {}),
      ...(billDraft.person.trim() ? { person: billDraft.person.trim() } : {}),
      ...(billDraft.description.trim() ? { description: billDraft.description.trim() } : {}),
    }
    try {
      if (editingBillId) await api.updateBill(editingBillId, body)
      else await api.createBill(body)
      setBillDraft(null)
      setEditingBillId(null)
      await loadData()
    } finally {
      setSaving(false)
    }
  }

  async function removeBill(id: number) {
    if (!window.confirm('确认删除这条账单？')) return
    await api.deleteBill(id)
    await loadData()
  }

  async function saveCategory() {
    if (!categoryDraft?.name.trim()) return
    setSaving(true)
    try {
      const body = { name: categoryDraft.name.trim(), parent_id: categoryDraft.parent_id }
      if (categoryDraft.id) await api.updateBillCategory(categoryDraft.id, body)
      else await api.createBillCategory(body)
      setCategoryDraft(null)
      await loadData()
    } finally {
      setSaving(false)
    }
  }

  async function disableCategory(id: number) {
    if (!window.confirm('停用后不会影响历史账单，确认停用？')) return
    await api.deleteBillCategory(id)
    await loadData()
  }

  function prevMonth() {
    if (month === 1) {
      setYear(value => value - 1)
      setMonth(12)
    } else setMonth(value => value - 1)
  }

  function nextMonth() {
    if (month === 12) {
      setYear(value => value + 1)
      setMonth(1)
    } else setMonth(value => value + 1)
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">T</div>
          <div className="brand-name">Titan Admin</div>
        </div>
        <Nav />
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>记账管理</h1>
            <p>账单、工程、分类在同一工作台中集中处理</p>
          </div>
          <div className="top-actions">
            <button className="btn" onClick={prevMonth}>上月</button>
            <button className="btn" onClick={nextMonth}>下月</button>
            <button className="btn"><Icon name="download" />导出</button>
            <button className="btn" onClick={() => openCategory()}><Icon name="plus" />新增分类</button>
            <button className="btn primary" onClick={openNewBill}><Icon name="plus" />新增账单</button>
          </div>
        </header>

        <section className="content">
          <div className="left-stack">
            <section className="kpis">
              <Kpi title="当前支出" value={formatMoney(totalAmount)} note={`${year}年${month}月筛选结果`} />
              <Kpi title="账单笔数" value={String(filteredBills.length)} note={loading ? '正在刷新数据' : `共读取 ${bills.length} 笔`} />
              <Kpi title="工程支出" value={formatMoney(projectAmount)} note={`占比 ${totalAmount ? Math.round(projectAmount / totalAmount * 100) : 0}%`} />
              <Kpi title="未关联账单" value={String(unlinkedCount)} note={unlinkedCount > 0 ? '建议补充工程' : '全部已关联'} warn={unlinkedCount > 0} />
            </section>

            <section className="toolbar">
              <label>开始日期<input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
              <label>结束日期<input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
              <label>分类<select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="">全部分类</option>
                {orderedCategories.map(item => <option key={item.id} value={item.id}>{categoryLabel(item)}{item.is_deleted ? '（停用）' : ''}</option>)}
              </select></label>
              <label>工程<select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
                <option value="">全部工程</option>
                {projects.map(item => <option key={item.id} value={item.id}>{item.name}{item.is_deleted ? '（停用）' : ''}</option>)}
              </select></label>
              <label className="search-field">搜索<Icon name="search" /><input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="负责人 / 描述 / 工程名" /></label>
              <button className="btn gold" onClick={() => void loadData()}><Icon name="filter" />刷新</button>
            </section>

            {error && <div className="error">{error}</div>}

            <Panel title="账单明细" meta={`${filteredBills.length} records`}>
              <table>
                <thead><tr><th>日期</th><th className="right">金额</th><th>分类</th><th>关联工程</th><th>负责人</th><th>描述</th><th className="right">操作</th></tr></thead>
                <tbody>
                  {filteredBills.map(bill => (
                    <tr key={bill.id}>
                      <td className="muted">{bill.bill_date}</td>
                      <td className="num amount">{formatMoney(Number(bill.amount))}</td>
                      <td><span className="tag">{bill.category_name ?? '未分类'}</span></td>
                      <td>{bill.project_name ?? <span className="muted">未关联</span>}</td>
                      <td>{bill.person || <span className="muted">未填写</span>}</td>
                      <td className="muted">{bill.description || '无描述'}</td>
                      <td><div className="row-actions"><button className="icon-btn" onClick={() => openEditBill(bill)}><Icon name="edit" /></button><button className="icon-btn" onClick={() => void removeBill(bill.id)}><Icon name="trash" /></button></div></td>
                    </tr>
                  ))}
                  {!loading && filteredBills.length === 0 && <tr><td className="empty" colSpan={7}>暂无账单数据</td></tr>}
                </tbody>
              </table>
            </Panel>

            <Panel title="账单分类列表" action={<button className="btn" onClick={() => openCategory()}><Icon name="plus" />新增分类</button>}>
              <table>
                <thead><tr><th>分类名称</th><th>父级</th><th>状态</th><th className="right">本月金额</th><th className="right">账单数</th><th>最近使用</th><th className="right">操作</th></tr></thead>
                <tbody>
                  {orderedCategories.map((category, index) => {
                    const stat = categoryStats.find(item => item.id === category.id)
                    return (
                      <tr key={category.id}>
                        <td className={category.parent_id ? 'category-child' : undefined}><span className="category-color" style={{ background: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} />{category.parent_id ? `└ ${category.name}` : category.name}</td>
                        <td className="muted">{category.parent_id ? categoryName.get(category.parent_id) ?? '未分组' : '一级分类'}</td>
                        <td><span className={category.is_deleted ? 'status-dot off' : 'status-dot'} />{category.is_deleted ? '停用' : '启用'}</td>
                        <td className="num">{formatMoney(stat?.amount ?? 0)}</td>
                        <td className="num">{stat?.count ?? 0}</td>
                        <td className="muted">{stat?.last ? `${stat.last.bill_date} · ${stat.last.description || stat.last.project_name || '最近账单'}` : '暂无使用记录'}</td>
                        <td><div className="category-actions">
                          {!category.is_deleted && <button className="btn" onClick={() => openCategory(category)}>编辑</button>}
                          {!category.is_deleted ? <button className="btn" onClick={() => void disableCategory(category.id)}>停用</button> : <button className="btn" disabled title="后端暂未提供恢复接口">恢复</button>}
                        </div></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Panel>
          </div>

          <aside className="right-stack">
            <section className="side-panel">
              <h2>分类支出占比</h2>
              {categoryStats.slice(0, 6).map((item, index) => {
                const pct = totalAmount ? Math.round(item.amount / totalAmount * 100) : 0
                return <Bar key={item.id ?? -1} label={item.name} value={`${formatMoney(item.amount)} · ${pct}%`} pct={pct} color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              })}
              {categoryStats.length === 0 && <div className="empty compact">暂无分类支出</div>}
            </section>
            <section className="side-panel">
              <h2>高支出工程</h2>
              <div className="project-list">
                {projectStats.map(item => (
                  <div className="project-item" key={item.project.id}>
                    <div className="project-head"><strong>{item.project.name}</strong><span className="tag green">{projectStatusText(item.project.status)}</span></div>
                    <p>负责人：{item.project.maintainer}<br />本期支出：{formatMoney(item.amount)} · {item.count} 笔</p>
                  </div>
                ))}
                {projectStats.length === 0 && <div className="empty compact">暂无工程支出</div>}
              </div>
            </section>
          </aside>
        </section>
      </main>

      {billDraft && <BillDrawer
        draft={billDraft}
        editing={editingBillId != null}
        categories={activeCategories}
        categoryLabel={categoryLabel}
        projects={activeProjects}
        saving={saving}
        onChange={setBillDraft}
        onClose={() => setBillDraft(null)}
        onSave={() => void saveBill()}
      />}

      {categoryDraft && <CategoryDrawer
        draft={categoryDraft}
        parentCategories={parentCategories.filter(item => item.id !== categoryDraft.id)}
        saving={saving}
        onChange={setCategoryDraft}
        onClose={() => setCategoryDraft(null)}
        onSave={() => void saveCategory()}
      />}
    </div>
  )
}

function Nav() {
  return (
    <>
      <div className="nav-section">
        <div className="nav-title">经营</div>
        <div className="nav-item"><Icon name="chart" />总览</div>
        <div className="nav-item active"><Icon name="list" />记账管理</div>
        <div className="nav-item"><Icon name="sliders" />账单分类</div>
        <div className="nav-item"><Icon name="building" />工程管理</div>
      </div>
      <div className="nav-section">
        <div className="nav-title">系统</div>
        <div className="nav-item"><Icon name="users" />工人账号</div>
        <div className="nav-item"><Icon name="settings" />基础配置</div>
      </div>
    </>
  )
}

function Kpi({ title, value, note, warn = false }: { title: string; value: string; note: string; warn?: boolean }) {
  return <div className="kpi"><div className="kpi-label">{title}</div><div className="kpi-value">{value}</div><div className={warn ? 'kpi-note warn' : 'kpi-note'}>{note}</div></div>
}

function Panel({ title, meta, action, children }: { title: string; meta?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="panel"><div className="panel-head"><h2>{title}</h2>{action ?? <span className="panel-meta">{meta}</span>}</div>{children}</section>
}

function Bar({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return <div className="bar-row"><div className="bar-top"><span>{label}</span><span>{value}</span></div><div className="bar"><div className="bar-fill" style={{ width: `${Math.max(pct, 4)}%`, background: color }} /></div></div>
}

function BillDrawer({ draft, editing, categories, categoryLabel, projects, saving, onChange, onClose, onSave }: {
  draft: BillFormState
  editing: boolean
  categories: BillCategory[]
  categoryLabel: (category: BillCategory) => string
  projects: Project[]
  saving: boolean
  onChange: (draft: BillFormState) => void
  onClose: () => void
  onSave: () => void
}) {
  return (
    <section className="drawer">
      <div className="drawer-head"><h2>{editing ? '编辑账单' : '新增账单'}</h2><button className="icon-btn" onClick={onClose}><Icon name="close" /></button></div>
      <div className="drawer-body form-grid">
        <label>日期<input type="date" value={draft.bill_date} onChange={e => onChange({ ...draft, bill_date: e.target.value })} /></label>
        <label>金额<input inputMode="decimal" value={draft.amount} onChange={e => onChange({ ...draft, amount: e.target.value })} placeholder="0.00" /></label>
        <label>分类<select value={draft.category_id} onChange={e => onChange({ ...draft, category_id: e.target.value })}><option value="">选择分类</option>{categories.map(item => <option key={item.id} value={item.id}>{categoryLabel(item)}</option>)}</select></label>
        <label>负责人<input value={draft.person} onChange={e => onChange({ ...draft, person: e.target.value })} placeholder="经办人" /></label>
        <label className="full">关联工程<select value={draft.project_id} onChange={e => onChange({ ...draft, project_id: e.target.value })}><option value="">不关联工程</option>{projects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="full">描述<textarea value={draft.description} onChange={e => onChange({ ...draft, description: e.target.value })} placeholder="款项说明" /></label>
      </div>
      <div className="drawer-foot"><button className="btn" onClick={onClose}>取消</button><button className="btn primary" disabled={saving || !draft.bill_date || !draft.amount || !draft.category_id} onClick={onSave}>{saving ? '保存中' : '保存账单'}</button></div>
    </section>
  )
}

function CategoryDrawer({ draft, parentCategories, saving, onChange, onClose, onSave }: {
  draft: CategoryFormState
  parentCategories: BillCategory[]
  saving: boolean
  onChange: (draft: CategoryFormState) => void
  onClose: () => void
  onSave: () => void
}) {
  return (
    <section className="drawer secondary">
      <div className="drawer-head"><h2>{draft.id ? '编辑账单分类' : '新增账单分类'}</h2><button className="icon-btn" onClick={onClose}><Icon name="close" /></button></div>
      <div className="drawer-body">
        <label>分类名称<input value={draft.name} onChange={e => onChange({ ...draft, name: e.target.value })} placeholder="例如：材料" /></label>
        <label>父级分类<select value={draft.parent_id ?? ''} onChange={e => onChange({ ...draft, parent_id: e.target.value ? Number(e.target.value) : null })}>
          <option value="">一级分类</option>
          {parentCategories.map(parent => <option key={parent.id} value={parent.id}>子分类：{parent.name}</option>)}
        </select></label>
        <label>显示颜色<div className="swatches">{CATEGORY_COLORS.slice(0, 6).map(color => <button key={color} className="swatch" style={{ background: color }} title={color} />)}</div></label>
        <label>状态<select disabled><option>启用</option></select></label>
        <label>说明<textarea disabled value="当前数据库仅保存分类名称与停用状态，颜色和说明待后续表结构确认。" /></label>
      </div>
      <div className="drawer-foot"><button className="btn" onClick={onClose}>取消</button><button className="btn primary" disabled={saving || !draft.name.trim()} onClick={onSave}>{saving ? '保存中' : '保存分类'}</button></div>
    </section>
  )
}
