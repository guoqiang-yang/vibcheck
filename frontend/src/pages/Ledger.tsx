import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import TabBar from '../components/TabBar'
import type { BillItem, BillCreate, BillUpdate, BillCategory, Project } from '../types'

// ── Helpers ──────────────────────────────────────────────────────

function fmtAmount(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(s: string) {
  const [, m, d] = s.split('-')
  return `${parseInt(m)}月${parseInt(d)}日`
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px',
  border: '1.5px solid #E0D4D8', borderRadius: 10, fontSize: 16,
  color: '#2E1A22', background: '#FDFAFA', outline: 'none', fontFamily: 'inherit',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#8A6A74', marginBottom: 6, letterSpacing: '0.6px' }}>
        {label.toUpperCase()}
      </div>
      {children}
    </div>
  )
}

// ── Bill Sheet ────────────────────────────────────────────────────

function BillSheet({ bill, billCategories, projects, onClose, onSaved, onDeleted }: {
  bill?: BillItem
  billCategories: BillCategory[]
  projects: Project[]
  onClose: () => void
  onSaved: () => void
  onDeleted?: () => void
}) {
  const isEdit = bill != null
  const today = new Date().toISOString().slice(0, 10)

  const [billDate, setBillDate] = useState(bill?.bill_date ?? today)
  const [amount, setAmount] = useState(bill ? String(bill.amount) : '')
  const [categoryId, setCategoryId] = useState<number | undefined>(bill?.category_id ?? undefined)
  const [projectId, setProjectId] = useState<number | undefined>(bill?.project_id ?? undefined)
  const [person, setPerson] = useState(bill?.person ?? '')
  const [description, setDescription] = useState(bill?.description ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const canSubmit = billDate && amount && parseFloat(amount) > 0 && categoryId != null

  async function handleSubmit() {
    if (!canSubmit || saving) return
    setSaving(true)
    const body: BillCreate | BillUpdate = {
      bill_date: billDate,
      amount: parseFloat(amount),
      ...(categoryId != null ? { category_id: categoryId } : {}),
      ...(projectId != null ? { project_id: projectId } : {}),
      person: person.trim() || undefined,
      description: description.trim() || undefined,
    }
    try {
      if (isEdit && bill) {
        await api.updateBill(bill.id, body)
      } else {
        await api.createBill(body as BillCreate)
      }
      onSaved()
    } catch { setSaving(false) }
  }

  async function handleDelete() {
    if (!bill || deleting) return
    setDeleting(true)
    try {
      await api.deleteBill(bill.id)
      onDeleted?.()
    } catch { setDeleting(false) }
  }

  const activeCategories = billCategories.filter(c => !c.is_deleted)
  const activeProjects = projects.filter(p => !p.is_deleted)

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, background: 'white',
        borderRadius: '20px 20px 0 0', boxShadow: '0 -4px 30px rgba(0,0,0,0.14)',
        zIndex: 101, maxHeight: '90dvh', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0D4D8' }} />
        </div>
        <div style={{ flexShrink: 0, padding: '4px 16px 10px', fontSize: 15, fontWeight: 700, color: '#2E1A22' }}>
          {isEdit ? '编辑账单' : '新增账单'}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 8px', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="日期">
              <input type="date" value={billDate} onChange={e => setBillDate(e.target.value)}
                style={{ ...inputStyle, minWidth: 0, WebkitAppearance: 'none', appearance: 'none' }} />
            </Field>
            <Field label="金额（元）">
              <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00" style={{ ...inputStyle, minWidth: 0 }} />
            </Field>
          </div>

          <Field label="账单分类 *">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {activeCategories.length === 0
                ? <span style={{ fontSize: 12, color: '#8A6A74' }}>请先在「记账管理」中添加账单分类</span>
                : activeCategories.map(cat => (
                  <button key={cat.id} onClick={() => setCategoryId(cat.id)} style={{
                    padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    border: categoryId === cat.id ? '1.5px solid #C86878' : '1.5px solid #E0D4D8',
                    background: categoryId === cat.id ? 'rgba(200,104,120,0.1)' : 'white',
                    color: categoryId === cat.id ? '#C86878' : '#8A6A74',
                  }}>{cat.name}</button>
                ))
              }
            </div>
          </Field>

          {activeProjects.length > 0 && (
            <Field label="关联工程（选填）">
              <select value={projectId ?? ''} onChange={e => setProjectId(e.target.value ? Number(e.target.value) : undefined)}
                style={{ ...inputStyle }}>
                <option value="">不关联工程</option>
                {activeProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
          )}

          <Field label="负责人（选填）">
            <input value={person} onChange={e => setPerson(e.target.value)} placeholder="姓名" style={inputStyle} />
          </Field>
          <Field label="描述（选填）">
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="款项说明…" rows={3} style={{ ...inputStyle, resize: 'none' }} />
          </Field>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', gap: 10, padding: '12px 16px', borderTop: '1px solid #F0E4E8' }}>
          {isEdit ? (
            <button onClick={handleDelete} disabled={deleting} style={{
              flex: 1, padding: '12px 0', border: '1.5px solid #F0C0C8', borderRadius: 12,
              background: 'white', color: '#C86878', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>{deleting ? '删除中…' : '删除'}</button>
          ) : (
            <button onClick={onClose} style={{
              flex: 1, padding: '12px 0', border: '1.5px solid #E0D4D8', borderRadius: 12,
              background: 'white', color: '#8A6A74', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>取消</button>
          )}
          <button onClick={handleSubmit} disabled={!canSubmit || saving} style={{
            flex: 2, padding: '12px 0', border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default',
            background: canSubmit ? '#C86878' : '#E0D4D8', color: canSubmit ? 'white' : '#B0A0A4',
          }}>{saving ? '保存中…' : '保存'}</button>
        </div>
      </div>
    </>
  )
}

// ── Bill Card ─────────────────────────────────────────────────────

function BillCard({ bill, onClick }: { bill: BillItem; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      background: 'white', borderRadius: 14, marginBottom: 10, overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)', cursor: 'pointer',
    }}>
      <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#2E1A22' }}>¥{fmtAmount(bill.amount)}</span>
            {bill.category_name && (
              <span style={{ fontSize: 11, fontWeight: 600, color: '#C86878', background: 'rgba(200,104,120,0.1)', borderRadius: 6, padding: '2px 7px' }}>
                {bill.category_name}
              </span>
            )}
          </div>
          {(bill.project_name || bill.person) && (
            <div style={{ marginTop: 4, fontSize: 12, color: '#8A6A74', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {bill.project_name && <span>📋 {bill.project_name}</span>}
              {bill.person && <span>👤 {bill.person}</span>}
            </div>
          )}
          {bill.description && (
            <div style={{ marginTop: 3, fontSize: 12, color: '#B0A0A4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {bill.description}
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: '#8A6A74' }}>{fmtDate(bill.bill_date)}</div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────

export default function Ledger() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [showForm, setShowForm] = useState(false)
  const [editingBill, setEditingBill] = useState<BillItem | null>(null)

  const { data: billData } = useQuery({
    queryKey: ['bills', year, month],
    queryFn: () => api.getBills({ year, month, limit: 100 }),
  })
  const { data: billCategories = [] } = useQuery({
    queryKey: ['bill-categories'],
    queryFn: api.getBillCategories,
    staleTime: Infinity,
  })
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
    staleTime: Infinity,
  })

  const bills = billData?.items ?? []
  const totalAmount = billData?.total_amount ?? 0

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  function openAdd() { setEditingBill(null); setShowForm(true) }
  function openEdit(b: BillItem) { setEditingBill(b); setShowForm(true) }
  function closeSheet() { setShowForm(false); setEditingBill(null) }
  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['bills'] })
    closeSheet()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 430, margin: '0 auto', background: '#FDF6F8', boxShadow: '0 0 40px rgba(0,0,0,0.10)', overflowX: 'hidden' }}>

      {/* Header */}
      <header style={{ background: 'linear-gradient(130deg, #C86878 0%, #C88860 100%)', color: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 12px' }}>
          <button onClick={prevMonth} style={{ width: 30, height: 30, border: 'none', background: 'rgba(255,255,255,0.16)', color: 'white', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{year}年{month}月</div>
            <div style={{ fontSize: 10, opacity: 0.72, marginTop: 1 }}>账单记录</div>
          </div>
          <button onClick={nextMonth} style={{ width: 30, height: 30, border: 'none', background: 'rgba(255,255,255,0.16)', color: 'white', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        {/* Total */}
        <div style={{ padding: '0 16px 14px', display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 11, opacity: 0.8 }}>本月合计</span>
          <span style={{ fontSize: 24, fontWeight: 700 }}>¥{fmtAmount(totalAmount)}</span>
          {billData && <span style={{ fontSize: 11, opacity: 0.7 }}>共 {billData.total} 笔</span>}
        </div>
      </header>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 90px', WebkitOverflowScrolling: 'touch' }}>
        {bills.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 60, color: '#8A6A74' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📒</div>
            <div style={{ fontSize: 14 }}>本月暂无账单</div>
            <div style={{ fontSize: 12, marginTop: 6, opacity: 0.7 }}>点击 + 新增账单</div>
          </div>
        ) : (
          bills.map(b => <BillCard key={b.id} bill={b} onClick={() => openEdit(b)} />)
        )}
      </div>

      {/* FAB */}
      <button onClick={openAdd} style={{
        position: 'fixed', bottom: 80, right: 'calc(50% - 215px + 16px)',
        width: 46, height: 46, background: '#E07858', color: 'white',
        border: 'none', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(224,120,88,0.38)', cursor: 'pointer', zIndex: 60,
      }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>

      {/* Manage entry */}
      <button onClick={() => navigate('/ledger/manage')} style={{
        position: 'fixed', bottom: 80, left: 'calc(50% - 215px + 16px)',
        height: 46, padding: '0 14px', background: 'white', color: '#8A6A74',
        border: '1.5px solid #E0D4D8', borderRadius: 13, display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, cursor: 'pointer', zIndex: 60,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        记账管理
      </button>

      <TabBar />

      {showForm && (
        <BillSheet
          bill={editingBill ?? undefined}
          billCategories={billCategories}
          projects={projects}
          onClose={closeSheet}
          onSaved={refresh}
          onDeleted={refresh}
        />
      )}
    </div>
  )
}
