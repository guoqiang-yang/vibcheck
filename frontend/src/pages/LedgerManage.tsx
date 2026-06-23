import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Project, ProjectCreate, ProjectUpdate } from '../types'

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px',
  border: '1.5px solid #E0D4D8', borderRadius: 10, fontSize: 15,
  color: '#2E1A22', background: '#FDFAFA', outline: 'none', fontFamily: 'inherit',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#8A6A74', marginBottom: 5, letterSpacing: '0.6px' }}>
        {label.toUpperCase()}
      </div>
      {children}
    </div>
  )
}

// ── Section header ─────────────────────────────────────────────────

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 8px' }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#2E1A22' }}>{title}</span>
      <button onClick={onAdd} style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
        border: 'none', borderRadius: 8, background: '#C86878', color: 'white',
        fontSize: 12, fontWeight: 600, cursor: 'pointer',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        新增
      </button>
    </div>
  )
}

// ── Bill Category Management ───────────────────────────────────────

function BillCategorySection() {
  const qc = useQueryClient()
  const { data: cats = [] } = useQuery({ queryKey: ['bill-categories'], queryFn: api.getBillCategories })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  async function handleCreate() {
    if (!newName.trim()) return
    await api.createBillCategory(newName.trim())
    qc.invalidateQueries({ queryKey: ['bill-categories'] })
    setNewName(''); setAdding(false)
  }
  async function handleUpdate(id: number) {
    if (!editName.trim()) return
    await api.updateBillCategory(id, editName.trim())
    qc.invalidateQueries({ queryKey: ['bill-categories'] })
    setEditingId(null)
  }
  async function handleDelete(id: number) {
    await api.deleteBillCategory(id)
    qc.invalidateQueries({ queryKey: ['bill-categories'] })
  }

  return (
    <div>
      <SectionHeader title="账单分类" onAdd={() => { setAdding(true); setNewName('') }} />
      <div style={{ padding: '0 16px' }}>
        {adding && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="分类名称" autoFocus
              style={{ ...inputStyle, flex: 1 }}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <button onClick={handleCreate} style={{ padding: '9px 14px', border: 'none', borderRadius: 10, background: '#C86878', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>保存</button>
            <button onClick={() => setAdding(false)} style={{ padding: '9px 12px', border: '1.5px solid #E0D4D8', borderRadius: 10, background: 'white', color: '#8A6A74', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>取消</button>
          </div>
        )}
        {cats.map(cat => (
          <div key={cat.id} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
            background: 'white', borderRadius: 10, marginBottom: 8,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            opacity: cat.is_deleted ? 0.5 : 1,
          }}>
            {editingId === cat.id ? (
              <>
                <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                  style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: 14 }}
                  onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)}
                />
                <button onClick={() => handleUpdate(cat.id)} style={{ padding: '6px 12px', border: 'none', borderRadius: 8, background: '#C86878', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>保存</button>
                <button onClick={() => setEditingId(null)} style={{ padding: '6px 10px', border: '1.5px solid #E0D4D8', borderRadius: 8, background: 'white', color: '#8A6A74', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>取消</button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#2E1A22', textDecoration: cat.is_deleted ? 'line-through' : 'none' }}>{cat.name}</span>
                {!cat.is_deleted && (
                  <button onClick={() => { setEditingId(cat.id); setEditName(cat.name) }}
                    style={{ padding: '5px 10px', border: '1.5px solid #E0D4D8', borderRadius: 8, background: 'white', color: '#8A6A74', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>编辑</button>
                )}
                <button onClick={() => handleDelete(cat.id)}
                  style={{ padding: '5px 10px', border: '1.5px solid #F0C0C8', borderRadius: 8, background: 'white', color: '#C86878', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>删除</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Project Sheet ─────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  prepare: '筹备中', ongoing: '进行中', finished: '已完成', canceled: '已取消',
}

function ProjectSheet({ project, onClose, onSaved, onDeleted }: {
  project?: Project
  onClose: () => void
  onSaved: () => void
  onDeleted?: () => void
}) {
  const isEdit = project != null
  const [name, setName] = useState(project?.name ?? '')
  const [maintainer, setMaintainer] = useState(project?.maintainer ?? '')
  const [category, setCategory] = useState(project?.category ?? '')
  const [province, setProvince] = useState(project?.province ?? '')
  const [city, setCity] = useState(project?.city ?? '')
  const [locationDetail, setLocationDetail] = useState(project?.location_detail ?? '')
  const [client, setClient] = useState(project?.client ?? '')
  const [contractor, setContractor] = useState(project?.contractor ?? '')
  const [amount, setAmount] = useState(project?.amount != null ? String(project.amount / 10000) : '')
  const [startDate, setStartDate] = useState(project?.start_date ?? '')
  const [finishDate, setFinishDate] = useState(project?.finish_date ?? '')
  const [status, setStatus] = useState<string>(project?.status ?? 'ongoing')
  const [description, setDescription] = useState(project?.description ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const canSubmit = name.trim() && maintainer.trim()

  async function handleSubmit() {
    if (!canSubmit || saving) return
    setSaving(true)
    const body: ProjectCreate | ProjectUpdate = {
      name: name.trim(),
      maintainer: maintainer.trim(),
      category: category.trim() || undefined,
      province: province.trim() || undefined,
      city: city.trim() || undefined,
      location_detail: locationDetail.trim() || undefined,
      client: client.trim() || undefined,
      contractor: contractor.trim() || undefined,
      amount: amount ? parseFloat(amount) * 10000 : undefined,
      start_date: startDate || undefined,
      finish_date: finishDate || undefined,
      status: status as ProjectCreate['status'],
      description: description.trim() || undefined,
    }
    try {
      if (isEdit && project) {
        await api.updateProject(project.id, body)
      } else {
        await api.createProject(body as ProjectCreate)
      }
      onSaved()
    } catch { setSaving(false) }
  }

  async function handleDelete() {
    if (!project || deleting) return
    setDeleting(true)
    try {
      await api.deleteProject(project.id)
      onDeleted?.()
    } catch { setDeleting(false) }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, background: 'white',
        borderRadius: '20px 20px 0 0', boxShadow: '0 -4px 30px rgba(0,0,0,0.14)',
        zIndex: 101, maxHeight: '92dvh', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0D4D8' }} />
        </div>
        <div style={{ flexShrink: 0, padding: '4px 16px 10px', fontSize: 15, fontWeight: 700, color: '#2E1A22' }}>
          {isEdit ? '编辑工程' : '新增工程'}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 8px', WebkitOverflowScrolling: 'touch' }}>
          <Field label="工程名 *"><input value={name} onChange={e => setName(e.target.value)} placeholder="工程/项目名称" style={inputStyle} /></Field>
          <Field label="负责人 *"><input value={maintainer} onChange={e => setMaintainer(e.target.value)} placeholder="负责人姓名" style={inputStyle} /></Field>

          <Field label="状态">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <button key={k} onClick={() => setStatus(k)} style={{
                  padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  border: status === k ? '1.5px solid #C86878' : '1.5px solid #E0D4D8',
                  background: status === k ? 'rgba(200,104,120,0.1)' : 'white',
                  color: status === k ? '#C86878' : '#8A6A74',
                }}>{v}</button>
              ))}
            </div>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="省"><input value={province} onChange={e => setProvince(e.target.value)} placeholder="省份" style={{ ...inputStyle, minWidth: 0 }} /></Field>
            <Field label="市"><input value={city} onChange={e => setCity(e.target.value)} placeholder="城市" style={{ ...inputStyle, minWidth: 0 }} /></Field>
          </div>
          <Field label="具体地址"><input value={locationDetail} onChange={e => setLocationDetail(e.target.value)} placeholder="具体地点" style={inputStyle} /></Field>
          <Field label="工程分类"><input value={category} onChange={e => setCategory(e.target.value)} placeholder="如：桥梁、房建…" style={inputStyle} /></Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="甲方"><input value={client} onChange={e => setClient(e.target.value)} placeholder="甲方名称" style={{ ...inputStyle, minWidth: 0 }} /></Field>
            <Field label="乙方"><input value={contractor} onChange={e => setContractor(e.target.value)} placeholder="乙方名称" style={{ ...inputStyle, minWidth: 0 }} /></Field>
          </div>

          <Field label="合同金额（万元）"><input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={inputStyle} /></Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="开始日期"><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...inputStyle, minWidth: 0, WebkitAppearance: 'none', appearance: 'none' }} /></Field>
            <Field label="结束日期"><input type="date" value={finishDate} onChange={e => setFinishDate(e.target.value)} style={{ ...inputStyle, minWidth: 0, WebkitAppearance: 'none', appearance: 'none' }} /></Field>
          </div>
          <Field label="备注"><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="工程备注…" rows={3} style={{ ...inputStyle, resize: 'none' }} /></Field>
        </div>
        <div style={{ flexShrink: 0, display: 'flex', gap: 10, padding: '12px 16px', borderTop: '1px solid #F0E4E8' }}>
          {isEdit ? (
            <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: '12px 0', border: '1.5px solid #F0C0C8', borderRadius: 12, background: 'white', color: '#C86878', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {deleting ? '删除中…' : '删除'}
            </button>
          ) : (
            <button onClick={onClose} style={{ flex: 1, padding: '12px 0', border: '1.5px solid #E0D4D8', borderRadius: 12, background: 'white', color: '#8A6A74', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>取消</button>
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

// ── Project Section ───────────────────────────────────────────────

function ProjectSection() {
  const qc = useQueryClient()
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: api.getProjects })
  const [showSheet, setShowSheet] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  function refresh() {
    qc.invalidateQueries({ queryKey: ['projects'] })
    setShowSheet(false); setEditingProject(null)
  }

  return (
    <div>
      <SectionHeader title="工程管理" onAdd={() => { setEditingProject(null); setShowSheet(true) }} />
      <div style={{ padding: '0 16px' }}>
        {projects.length === 0 && (
          <div style={{ textAlign: 'center', color: '#8A6A74', padding: '20px 0', fontSize: 13 }}>暂无工程，点击新增</div>
        )}
        {projects.map(p => (
          <div key={p.id} onClick={() => { setEditingProject(p); setShowSheet(true) }}
            style={{
              background: 'white', borderRadius: 12, marginBottom: 8,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)', cursor: 'pointer',
              overflow: 'hidden', opacity: p.is_deleted ? 0.5 : 1,
            }}>
            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#2E1A22', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  {p.status && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, flexShrink: 0, padding: '2px 7px', borderRadius: 6,
                      background: p.status === 'ongoing' ? 'rgba(34,197,94,0.1)' : p.status === 'finished' ? 'rgba(100,116,139,0.1)' : p.status === 'canceled' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                      color: p.status === 'ongoing' ? '#16A34A' : p.status === 'finished' ? '#64748B' : p.status === 'canceled' ? '#DC2626' : '#D97706',
                    }}>{STATUS_LABELS[p.status]}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#8A6A74', marginTop: 3 }}>
                  {[p.maintainer, p.city || p.province, p.client].filter(Boolean).join(' · ')}
                </div>
              </div>
              {p.amount != null && (
                <div style={{ flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#C86878' }}>
                  ¥{(p.amount / 10000).toFixed(1)}万
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {showSheet && (
        <ProjectSheet
          project={editingProject ?? undefined}
          onClose={() => { setShowSheet(false); setEditingProject(null) }}
          onSaved={refresh}
          onDeleted={refresh}
        />
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────

export default function LedgerManage() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 430, margin: '0 auto', background: '#FDF6F8', boxShadow: '0 0 40px rgba(0,0,0,0.10)', overflowX: 'hidden' }}>
      <header style={{ background: 'linear-gradient(130deg, #C86878 0%, #C88860 100%)', color: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px' }}>
          <button onClick={() => navigate('/ledger')} style={{ width: 30, height: 30, border: 'none', background: 'rgba(255,255,255,0.16)', color: 'white', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>记账管理</div>
            <div style={{ fontSize: 10, opacity: 0.72, marginTop: 1 }}>分类 · 工程</div>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 20 }}>
        <BillCategorySection />
        <div style={{ height: 1, background: '#F0E4E8', margin: '8px 0' }} />
        <ProjectSection />
      </div>
    </div>
  )
}
