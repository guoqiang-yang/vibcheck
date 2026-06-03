import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Category } from '../types'
import TabBar from '../components/TabBar'

// ── Color palette (20 colors, 4×5) ───────────────────────────────
const COLORS = [
  '#EF4444', '#F97316', '#FBBF24', '#84CC16', '#22C55E',
  '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E',
  '#4F86E8', '#F0883A', '#2DBD8A', '#9B72E8', '#E85C8A',
  '#64748B', '#78716C', '#854D0E', '#1E40AF', '#065F46',
]

const MAX_CATEGORIES = 10

// ── Helpers ───────────────────────────────────────────────────────

function DeletedBox({ color }: { color: string }) {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" fill="none" style={{ flexShrink: 0 }}>
      <rect x="1" y="1" width="26" height="18" rx="4"
        stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="1" y1="1" x2="27" y2="19"
        stroke={color} strokeWidth="1.2" strokeDasharray="3 2" />
    </svg>
  )
}

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C0A8B0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

// ── Category row ──────────────────────────────────────────────────

function CategoryRow({ cat, onEdit, onRestore }: {
  cat: Category
  onEdit: (cat: Category) => void
  onRestore: (cat: Category) => void
}) {
  const isDeleted = cat.is_deleted === true

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: '1px solid #F5EEF0', opacity: isDeleted ? 0.72 : 1 }}>
      {isDeleted
        ? <DeletedBox color={cat.color} />
        : <div style={{ width: 28, height: 20, borderRadius: 5, background: cat.color, flexShrink: 0 }} />
      }
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: isDeleted ? '#A08898' : '#2E1A22', textDecoration: isDeleted ? 'line-through' : 'none' }}>
        {cat.name}
      </span>
      {isDeleted ? (
        <button onClick={() => onRestore(cat)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: 11, fontWeight: 700, color: '#2DBD8A' }}>
          恢复
        </button>
      ) : (
        <button onClick={() => onEdit(cat)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}>
          <EditIcon />
        </button>
      )}
    </div>
  )
}

// ── Edit / Add sheet ──────────────────────────────────────────────

type SheetMode = 'add' | 'edit' | null

function CategorySheet({ mode, cat, onClose, onSaved }: {
  mode: SheetMode
  cat: Category | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [nameErr, setNameErr] = useState('')

  useEffect(() => {
    if (mode === 'edit' && cat) {
      setName(cat.name)
      setColor(cat.color)
    } else {
      setName('')
      setColor(COLORS[0])
    }
    setNameErr('')
  }, [mode, cat])

  const charCount = [...name].length

  function validate() {
    if (charCount < 2 || charCount > 4) {
      setNameErr('名称需 2–4 个字')
      return false
    }
    return true
  }

  async function handleSave() {
    if (!validate() || saving) return
    setSaving(true)
    try {
      if (mode === 'add') {
        await api.createCategory({ name, color })
      } else if (mode === 'edit' && cat) {
        await api.updateCategory(cat.id, { name, color })
      }
      onSaved()
    } catch {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!cat || deleting) return
    setDeleting(true)
    try {
      await api.deleteCategory(cat.id)
      onSaved()
    } catch {
      setDeleting(false)
    }
  }

  if (!mode) return null

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: 'white', borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.14)',
        zIndex: 101, maxHeight: '85dvh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Handle */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 32, height: 3, borderRadius: 2, background: '#E0D4D8' }} />
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: '#2E1A22', padding: '10px 16px 0', flexShrink: 0 }}>
          {mode === 'add' ? '添加分类' : '编辑分类'}
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 8px', WebkitOverflowScrolling: 'touch' }}>

          {/* Name */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8A6A74', letterSpacing: '0.6px', marginBottom: 6 }}>名称（2–4字）</div>
            <div style={{ position: 'relative' }}>
              <input
                value={name}
                onChange={e => { setName(e.target.value); setNameErr('') }}
                maxLength={8}
                placeholder="如：阅读、健康"
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 40px 9px 12px', border: `1.5px solid ${nameErr ? '#EF4444' : '#E0D4D8'}`, borderRadius: 10, fontSize: 15, color: '#2E1A22', background: '#FDFAFA', outline: 'none', fontFamily: 'inherit' }}
              />
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: charCount > 4 ? '#EF4444' : '#C0A8B0' }}>
                {charCount}/4
              </span>
            </div>
            {nameErr && <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{nameErr}</div>}
          </div>

          {/* Color picker */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8A6A74', letterSpacing: '0.6px', marginBottom: 8 }}>颜色</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 7 }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{
                  width: '100%', aspectRatio: '1', borderRadius: '50%', background: c,
                  border: 'none', cursor: 'pointer', padding: 0,
                  boxShadow: color === c ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : 'none',
                }} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8A6A74', letterSpacing: '0.6px', marginBottom: 6 }}>预览</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#FDF6F8', borderRadius: 10, border: '1px solid #F0E4E8' }}>
              <div style={{ width: 28, height: 20, borderRadius: 5, background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#2E1A22', flex: 1 }}>{name || '分类名称'}</span>
              <div style={{ display: 'flex', gap: 3 }}>
                <div style={{ width: 32, height: 11, borderRadius: 3, background: color, opacity: 0.88 }} />
                <div style={{ width: 20, height: 11, borderRadius: 3, background: color, opacity: 0.46 }} />
                <div style={{ width: 14, height: 11, borderRadius: 3, background: color, opacity: 0.16 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, display: 'flex', gap: 10, padding: '12px 16px 20px', borderTop: '1px solid #F0E4E8' }}>
          {mode === 'edit' ? (
            <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: '12px 0', border: '1.5px dashed #C86878', borderRadius: 12, background: 'white', color: '#C86878', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {deleting ? '删除中…' : '删除'}
            </button>
          ) : (
            <button onClick={onClose} style={{ flex: 1, padding: '12px 0', border: '1.5px solid #E0D4D8', borderRadius: 12, background: 'white', color: '#8A6A74', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              取消
            </button>
          )}
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '12px 0', border: 'none', borderRadius: 12, background: '#C86878', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Toast ─────────────────────────────────────────────────────────

function Toast({ msg, onDismiss }: { msg: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: '#2E1A22', color: 'white', borderRadius: 12,
      padding: '10px 18px', fontSize: 13, fontWeight: 500,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)', zIndex: 200,
      maxWidth: 320, textAlign: 'center', whiteSpace: 'pre-wrap',
    }}>
      {msg}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────

export default function Profile() {
  const queryClient = useQueryClient()
  const [sheetMode, setSheetMode] = useState<SheetMode>(null)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [restoring, setRestoring] = useState<number | null>(null)

  const { data: allCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
    staleTime: Infinity,
  })

  const active = allCategories.filter(c => !c.is_deleted)
  const deleted = allCategories.filter(c => c.is_deleted)
  const total = allCategories.length

  function openAdd() {
    if (total >= MAX_CATEGORIES) {
      setToast('已达分类上限（10个），可恢复已删除分类或先删除旧分类')
      return
    }
    setEditingCat(null)
    setSheetMode('add')
  }

  function openEdit(cat: Category) {
    setEditingCat(cat)
    setSheetMode('edit')
  }

  function closeSheet() {
    setSheetMode(null)
    setEditingCat(null)
  }

  function onSaved() {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    closeSheet()
  }

  async function handleRestore(cat: Category) {
    if (restoring) return
    setRestoring(cat.id)
    try {
      await api.restoreCategory(cat.id)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    } finally {
      setRestoring(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 430, margin: '0 auto', background: 'white', boxShadow: '0 0 40px rgba(0,0,0,0.10)' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(130deg,#C86878 0%,#C88860 100%)', color: 'white', flexShrink: 0, padding: '11px 14px 14px' }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>我的</div>
        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>VibCheck · 个人中心</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: '#FDF6F8', WebkitOverflowScrolling: 'touch' }}>

        {/* Profile card */}
        <div style={{ margin: '12px 12px 0', background: 'white', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,#C86878,#C88860)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 800, flexShrink: 0 }}>
            O
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#2E1A22' }}>Oscar</div>
            <div style={{ fontSize: 11, color: '#8A6A74', marginTop: 2 }}>记录始于 2026-05-28</div>
          </div>
        </div>

        {/* Category section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 12px 8px' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#8A6A74', letterSpacing: '1px', textTransform: 'uppercase' }}>
            分类管理
          </span>
          <button onClick={openAdd} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#C86878', padding: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            添加分类
          </button>
        </div>

        <div style={{ margin: '0 12px', background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          {active.map(cat => (
            <CategoryRow key={cat.id} cat={cat} onEdit={openEdit} onRestore={handleRestore} />
          ))}
          {deleted.map(cat => (
            <CategoryRow key={cat.id} cat={cat} onEdit={openEdit} onRestore={handleRestore} />
          ))}
          {allCategories.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#8A6A74', fontSize: 12 }}>
              暂无分类，点击「添加分类」开始
            </div>
          )}
        </div>

        <div style={{ padding: '8px 12px', fontSize: 10, color: '#A08898', lineHeight: 1.6 }}>
          已使用 {total} / {MAX_CATEGORIES} 个分类（含已删除）
        </div>

        <div style={{ height: 16 }} />
      </div>

      <TabBar />

      {/* Sheet */}
      <CategorySheet mode={sheetMode} cat={editingCat} onClose={closeSheet} onSaved={onSaved} />

      {/* Toast */}
      {toast && <Toast msg={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
