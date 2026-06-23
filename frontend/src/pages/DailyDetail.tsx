import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { TimeEvent, Category, Engagement } from '../types'

// ── Helpers ──────────────────────────────────────────────────────

const HR_START = 4
const HR_END = 24
const TOTAL_HRS = HR_END - HR_START

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function formatDateDisplay(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日 周${days[d.getDay()]}`
}

function localDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shiftDate(dateStr: string, delta: number) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return localDateStr(d)
}

function fmtTime(t: string) { return t.slice(0, 5) }

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function durationHours(start: string, end: string | null) {
  if (!end) return 0
  return (timeToMinutes(end) - timeToMinutes(start)) / 60
}

// ── Focus dots ───────────────────────────────────────────────────

function FocusDots({ engagement, rgb, onDark }: {
  engagement: Engagement | null
  rgb: string
  onDark: boolean
}) {
  const filled = engagement === 'high' ? 3 : engagement === 'mid' ? 2 : 1
  const label = engagement === 'high' ? '高投入' : engagement === 'mid' ? '中投入' : '低投入'
  const dotColor = onDark ? 'white' : `rgb(${rgb})`
  const labelColor = onDark ? 'rgba(255,255,255,0.85)' : `rgb(${rgb})`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: i < filled ? dotColor : 'transparent',
          border: i < filled ? 'none'
            : onDark ? '1px solid rgba(255,255,255,0.55)'
              : `1px solid rgb(${rgb})`,
        }} />
      ))}
      <span style={{ fontSize: 10, fontWeight: 600, marginLeft: 2, color: labelColor }}>
        {label}
      </span>
    </div>
  )
}

// ── Actual event card ─────────────────────────────────────────────

function ActualCard({ event, category, onClick }: { event: TimeEvent; category?: Category; onClick?: () => void }) {
  const rgb = category ? hexToRgb(category.color) : '155,114,232'
  const color = category?.color ?? '#9B72E8'
  const isHigh = event.engagement === 'high'
  const headAlpha = isHigh ? 0.88 : event.engagement === 'mid' ? 0.14 : 0.06
  const bodyAlpha = isHigh ? 0.07 : 0.05

  return (
    <div onClick={onClick} style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', cursor: onClick ? 'pointer' : undefined }}>
      {/* Head */}
      <div style={{ padding: '11px 14px', background: `rgba(${rgb},${headAlpha})`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: isHigh ? 'rgba(255,255,255,0.9)' : color }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: isHigh ? 'white' : '#2E1A22', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.title}
          </span>
          {event.sub_category && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 6, flexShrink: 0, background: isHigh ? 'rgba(255,255,255,0.2)' : `rgba(${rgb},0.12)`, color: isHigh ? 'rgba(255,255,255,0.85)' : color }}>
              {event.sub_category}
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, fontWeight: 500, flexShrink: 0, color: isHigh ? 'rgba(255,255,255,0.88)' : `rgba(${rgb},0.9)` }}>
          {fmtTime(event.start_time)}{event.end_time ? ` – ${fmtTime(event.end_time)}` : ''}
        </span>
      </div>
      {/* Focus row */}
      <div style={{ padding: '0 14px 10px', background: `rgba(${rgb},${headAlpha})` }}>
        <FocusDots engagement={event.engagement} rgb={rgb} onDark={isHigh} />
      </div>
      {/* Divider */}
      <div style={{ height: 1, margin: '0 14px', background: `rgba(${rgb},0.15)` }} />
      {/* Body */}
      {event.content && (
        <div style={{ padding: '10px 14px 12px', background: `rgba(${rgb},${bodyAlpha})` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '3px 0', fontSize: 12, lineHeight: 1.5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: color }} />
            <span style={{ opacity: 0.82 }}>{event.content}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Planned event card ────────────────────────────────────────────

function PlannedCard({ event, category, expired, onClick }: { event: TimeEvent; category?: Category; expired: boolean; onClick?: () => void }) {
  const rgb = category ? hexToRgb(category.color) : '155,114,232'
  const color = category?.color ?? '#9B72E8'

  return (
    <div onClick={onClick} style={{ marginBottom: 10, opacity: expired ? 0.55 : 1, cursor: onClick ? 'pointer' : undefined }}>
      <div style={{ border: `1.5px dashed rgba(${rgb},0.55)`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', padding: '4px 14px', color, background: `rgba(${rgb},0.06)`, opacity: 0.65 }}>
          {expired ? '已过期计划' : '计划中'}
        </div>
        <div style={{ padding: '6px 14px 10px', background: `rgba(${rgb},0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: color }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#2E1A22', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.title}
            </span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, flexShrink: 0, color }}>
            {fmtTime(event.start_time)}{event.end_time ? ` – ${fmtTime(event.end_time)}` : ''}
          </span>
        </div>
        {event.content && (
          <>
            <div style={{ height: 1, margin: '0 14px', background: `rgba(${rgb},0.15)` }} />
            <div style={{ padding: '10px 14px 12px', background: `rgba(${rgb},0.06)` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '3px 0', fontSize: 12, lineHeight: 1.5 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: color }} />
                <span style={{ opacity: 0.82 }}>{event.content}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Inspiration icons ─────────────────────────────────────────────

const LightbulbIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#FBBF24" stroke="#F59E0B" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M9 21h6M12 3a6 6 0 0 1 4.243 10.243C15.126 14.36 15 15.18 15 16H9c0-.82-.126-1.64-1.243-2.757A6 6 0 0 1 12 3z"/>
    <path d="M9 16h6"/>
  </svg>
)

function InspirationIcon({ subCategory, size = 18 }: { subCategory: string | null; size?: number }) {
  if (subCategory === '随笔') {
    return <span style={{ fontSize: size, lineHeight: 1, flexShrink: 0 }}>✏️</span>
  }
  return <LightbulbIcon size={size} />
}

// ── Inspiration row ───────────────────────────────────────────────

function InspirationRow({ event, onClick }: { event: TimeEvent; onClick?: () => void }) {
  const isEssay = event.sub_category === '随笔'
  return (
    <div onClick={onClick} style={{ marginBottom: 8, background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', cursor: onClick ? 'pointer' : undefined, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px' }}>
        <InspirationIcon subCategory={event.sub_category} size={18} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#2E1A22', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.title}
            </span>
            {isEssay && (
              <span style={{ fontSize: 10, fontWeight: 600, color: '#8A6A74', background: '#F0E4E8', borderRadius: 6, padding: '1px 6px', flexShrink: 0 }}>随笔</span>
            )}
          </div>
        </div>
        <span style={{ fontSize: 11, color: '#8A6A74', flexShrink: 0 }}>{fmtTime(event.start_time)}</span>
      </div>
      {event.content && (
        <div style={{ padding: '0 14px 10px 37px', fontSize: 12, lineHeight: 1.5, color: '#8A6A74' }}>
          {event.content}
        </div>
      )}
    </div>
  )
}

// ── Mini timeline ─────────────────────────────────────────────────

function MiniTimeline({ events, categories, dateStr }: {
  events: TimeEvent[]
  categories: Category[]
  dateStr: string
}) {
  const tlRef = useRef<HTMLDivElement>(null)
  const lbRef = useRef<HTMLDivElement>(null)
  const LABEL_HRS = [4, 8, 12, 16, 20]

  useEffect(() => {
    const el = tlRef.current
    if (!el) return
    const W = el.offsetWidth
    const toX = (h: number, m: number) => ((h - HR_START) + m / 60) / TOTAL_HRS * W

    let html = ''
    events.forEach(ev => {
      const [sh, sm] = ev.start_time.split(':').map(Number)
      if (ev.type === 'inspiration') {
        const isEssay = ev.sub_category === '随笔'
        const icon = isEssay
          ? `<span style="font-size:11px;line-height:1">✏️</span>`
          : `<svg width="13" height="13" viewBox="0 0 24 24" fill="#FBBF24" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21h6M12 3a6 6 0 0 1 4.243 10.243C15.126 14.36 15 15.18 15 16H9c0-.82-.126-1.64-1.243-2.757A6 6 0 0 1 12 3z"/><path d="M9 16h6"/></svg>`
        html += `<div style="position:absolute;top:50%;left:${toX(sh,sm)}px;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center">${icon}</div>`
        return
      }
      const [eh, em] = (ev.end_time ?? `${HR_END}:00`).split(':').map(Number)
      const x0 = toX(sh, sm), x1 = toX(eh, em)
      const w = Math.max(x1 - x0 - 1, 4)
      if (ev.type === 'planned') {
        html += `<div style="position:absolute;top:4px;height:calc(100% - 8px);left:${x0}px;width:${w}px;border-radius:4px;border:1.5px dashed rgba(255,255,255,0.55);background:rgba(255,255,255,0.08)"></div>`
      } else {
        html += `<div style="position:absolute;top:4px;height:calc(100% - 8px);left:${x0}px;width:${w}px;border-radius:4px;background:rgba(255,255,255,0.72)"></div>`
      }
    })

    const today = new Date().toISOString().slice(0, 10)
    if (dateStr === today) {
      const now = new Date()
      const nx = toX(now.getHours(), now.getMinutes())
      html += `<div style="position:absolute;top:50%;left:${nx}px;transform:translate(-50%,-50%);width:6px;height:6px;background:white;border-radius:50%;box-shadow:0 0 0 2px rgba(255,255,255,0.4)"></div>`
    }
    el.innerHTML = html

    if (lbRef.current) {
      lbRef.current.innerHTML = LABEL_HRS.map(h =>
        `<span style="position:absolute;bottom:0;left:${toX(h, 0)}px;font-size:8px;font-weight:500;color:rgba(255,255,255,0.60);transform:translateX(-50%);white-space:nowrap">${h}</span>`
      ).join('')
    }
  }, [events, categories, dateStr])

  return (
    <div style={{ padding: '10px 14px 18px' }}>
      <div ref={tlRef} style={{ position: 'relative', height: 28, background: 'rgba(255,255,255,0.12)', borderRadius: 6 }} />
      <div ref={lbRef} style={{ position: 'relative', height: 16, marginTop: 2 }} />
    </div>
  )
}

// ── Stats strip ───────────────────────────────────────────────────

function StatsStrip({ events, categories }: { events: TimeEvent[]; categories: Category[] }) {
  const catMap = new Map(categories.map(c => [c.id, c]))
  const catHours = new Map<number, number>()

  events.filter(e => e.type === 'actual' && e.end_time).forEach(e => {
    if (!e.category_id) return
    const h = durationHours(e.start_time, e.end_time)
    catHours.set(e.category_id, (catHours.get(e.category_id) ?? 0) + h)
  })

  const chips = Array.from(catHours.entries())
    .filter(([, h]) => h > 0)
    .map(([id, h]) => ({ cat: catMap.get(id), hours: h }))

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'white', borderBottom: '1px solid #F0E4E8', flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
      {chips.length === 0
        ? <span style={{ fontSize: 11, color: '#8A6A74' }}>今日暂无记录</span>
        : chips.map(({ cat, hours }) => cat && (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, background: '#FDF6F8', border: '1px solid #F0E4E8', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: cat.color }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: '#8A6A74' }}>{cat.name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2E1A22' }}>
              {hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`}
            </span>
          </div>
        ))}
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#8A6A74', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
      {children}
      <div style={{ flex: 1, height: 1, background: '#F0E4E8' }} />
    </div>
  )
}

// ── Icon button ───────────────────────────────────────────────────

function IconBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ width: 30, height: 30, border: 'none', background: 'rgba(255,255,255,0.16)', color: 'white', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {children}
    </button>
  )
}

const ChevronLeft = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
)
const ChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
)

// ── Form helpers ─────────────────────────────────────────────────

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#8A6A74', marginBottom: 6, letterSpacing: '0.6px' }}>
        {label.toUpperCase()}
      </div>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px',
  border: '1.5px solid #E0D4D8', borderRadius: 10, fontSize: 16,
  color: '#2E1A22', background: '#FDFAFA', outline: 'none',
  fontFamily: 'inherit',
}

// ── Add Event Sheet ───────────────────────────────────────────────

const TYPE_TABS = [
  { key: 'actual' as const, label: '记录' },
  { key: 'planned' as const, label: '计划' },
  { key: 'inspiration' as const, label: '💡 灵感' },
]

const INSPIRATION_SUB_TABS = [
  { key: '灵感', label: '💡 灵感' },
  { key: '随笔', label: '✏️ 随笔' },
]

const ENGAGEMENT_OPTS: { key: Engagement; label: string; dots: number }[] = [
  { key: 'high', label: '高投入', dots: 3 },
  { key: 'mid', label: '中投入', dots: 2 },
  { key: 'low', label: '低投入', dots: 1 },
]

function nowHHMM() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function AddEventSheet({ date, categories, event, onClose, onSaved, onDeleted }: {
  date: string
  categories: Category[]
  event?: TimeEvent
  onClose: () => void
  onSaved: () => void
  onDeleted?: () => void
}) {
  const isEdit = event != null
  const [type, setType] = useState<'actual' | 'planned' | 'inspiration'>(event?.type ?? 'actual')
  const [inspirationSub, setInspirationSub] = useState<string>(event?.sub_category === '随笔' ? '随笔' : '灵感')
  const [subCategory, setSubCategory] = useState(
    event?.type !== 'inspiration' ? (event?.sub_category ?? '') : ''
  )
  const [title, setTitle] = useState(event?.title ?? '')
  const [categoryId, setCategoryId] = useState<number | undefined>(event?.category_id ?? categories[0]?.id)
  const [startTime, setStartTime] = useState(() => event?.start_time.slice(0, 5) ?? nowHHMM())
  const [endTime, setEndTime] = useState(event?.end_time?.slice(0, 5) ?? '')
  const [engagement, setEngagement] = useState<Engagement>(event?.engagement ?? 'mid')
  const [content, setContent] = useState(event?.content ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const needsCategory = type !== 'inspiration'
  const needsEndTime = type !== 'inspiration'
  const needsEngagement = type === 'actual'

  const canSubmit = title.trim().length > 0 && startTime.length > 0

  const selCat = categories.find(c => c.id === categoryId)
  const selRgb = selCat ? hexToRgb(selCat.color) : '155,114,232'

  async function handleSubmit() {
    if (!canSubmit || saving) return
    setSaving(true)
    const resolvedSubCategory = type === 'inspiration'
      ? inspirationSub
      : (subCategory.trim() || undefined)

    try {
      if (isEdit && event) {
        await api.updateEvent(event.uuid, {
          title: title.trim(),
          type,
          ...(needsCategory && categoryId != null ? { category_id: categoryId } : {}),
          start_time: startTime,
          ...(needsEndTime && endTime ? { end_time: endTime } : { end_time: undefined }),
          ...(needsEngagement ? { engagement } : {}),
          content: content.trim() || undefined,
          sub_category: resolvedSubCategory,
        })
      } else {
        await api.createEvent({
          date,
          title: title.trim(),
          type,
          ...(needsCategory && categoryId != null ? { category_id: categoryId } : {}),
          start_time: startTime,
          ...(needsEndTime && endTime ? { end_time: endTime } : {}),
          ...(needsEngagement ? { engagement } : {}),
          ...(content.trim() ? { content: content.trim() } : {}),
          sub_category: resolvedSubCategory,
        })
      }
      onSaved()
    } catch {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!event || deleting) return
    setDeleting(true)
    try {
      await api.deleteEvent(event.uuid)
      onDeleted?.()
    } catch {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100 }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: 'white', borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.14)',
        zIndex: 101, maxHeight: '90dvh',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Drag handle */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0D4D8' }} />
        </div>

        {/* Type tabs */}
        <div style={{ flexShrink: 0, display: 'flex', gap: 6, padding: '8px 16px 12px' }}>
          {TYPE_TABS.map(tab => (
            <button key={tab.key} onClick={() => setType(tab.key)} style={{
              flex: 1, padding: '7px 0', border: 'none', borderRadius: 10,
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: type === tab.key ? '#C86878' : '#F5EDEF',
              color: type === tab.key ? 'white' : '#8A6A74',
              transition: 'background 0.15s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable form area */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 16px 8px', WebkitOverflowScrolling: 'touch' }}>

          {/* Inspiration sub-type selector */}
          {type === 'inspiration' && (
            <Field label="类型">
              <div style={{ display: 'flex', gap: 8 }}>
                {INSPIRATION_SUB_TABS.map(tab => (
                  <button key={tab.key} onClick={() => setInspirationSub(tab.key)} style={{
                    flex: 1, padding: '7px 0', border: 'none', borderRadius: 10,
                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    background: inspirationSub === tab.key ? '#C86878' : '#F5EDEF',
                    color: inspirationSub === tab.key ? 'white' : '#8A6A74',
                    transition: 'background 0.15s',
                  }}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {/* Title */}
          <Field label="标题">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={
                type === 'inspiration'
                  ? (inspirationSub === '随笔' ? '记录工作感悟…' : '灵感一闪…')
                  : '事项名称'
              }
              style={inputStyle}
            />
          </Field>

          {/* Category */}
          {needsCategory && (
            <Field label="分类">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {categories.map(cat => {
                  const active = cat.id === categoryId
                  const rgb = hexToRgb(cat.color)
                  return (
                    <button key={cat.id} onClick={() => setCategoryId(cat.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                      borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      border: active ? `1.5px solid ${cat.color}` : '1.5px solid #E0D4D8',
                      background: active ? `rgba(${rgb},0.10)` : 'white',
                      color: active ? cat.color : '#8A6A74',
                    }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: cat.color }} />
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </Field>
          )}

          {/* Times */}
          <div style={{ display: 'grid', gridTemplateColumns: needsEndTime ? '1fr 1fr' : '1fr', gap: 10 }}>
            <Field label="开始时间">
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ ...inputStyle, minWidth: 0, WebkitAppearance: 'none', appearance: 'none' }} />
            </Field>
            {needsEndTime && (
              <Field label="结束时间">
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ ...inputStyle, minWidth: 0, WebkitAppearance: 'none', appearance: 'none' }} />
              </Field>
            )}
          </div>

          {/* Engagement */}
          {needsEngagement && (
            <Field label="投入度">
              <div style={{ display: 'flex', gap: 8 }}>
                {ENGAGEMENT_OPTS.map(opt => {
                  const active = engagement === opt.key
                  return (
                    <button key={opt.key} onClick={() => setEngagement(opt.key)} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      padding: '8px 0', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      border: active ? `1.5px solid rgba(${selRgb},0.6)` : '1.5px solid #E0D4D8',
                      background: active ? `rgba(${selRgb},0.10)` : 'white',
                      color: active ? `rgb(${selRgb})` : '#8A6A74',
                    }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: i < opt.dots
                            ? (active ? `rgb(${selRgb})` : '#C0A8B0')
                            : 'transparent',
                          border: i < opt.dots ? 'none' : '1px solid #C0A8B0',
                        }} />
                      ))}
                      <span style={{ marginLeft: 2 }}>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </Field>
          )}

          {/* Sub-category (actual / planned only) */}
          {type !== 'inspiration' && (
            <Field label="子分类（选填，2-8字）">
              <input
                value={subCategory}
                onChange={e => setSubCategory(e.target.value.slice(0, 8))}
                placeholder="如：施工管理、方案设计…"
                style={inputStyle}
              />
            </Field>
          )}

          {/* Content (all types) */}
          <Field label="详细记录">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="过程记录、心得…"
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </Field>
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, display: 'flex', gap: 10, padding: '12px 16px', borderTop: '1px solid #F0E4E8' }}>
          {isEdit ? (
            <button onClick={handleDelete} disabled={deleting} style={{
              flex: 1, padding: '12px 0', border: '1.5px solid #F0C0C8', borderRadius: 12,
              background: 'white', color: '#C86878', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              {deleting ? '删除中…' : '删除'}
            </button>
          ) : (
            <button onClick={onClose} style={{
              flex: 1, padding: '12px 0', border: '1.5px solid #E0D4D8', borderRadius: 12,
              background: 'white', color: '#8A6A74', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              取消
            </button>
          )}
          <button onClick={handleSubmit} disabled={!canSubmit || saving} style={{
            flex: 2, padding: '12px 0', border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default',
            background: canSubmit ? '#C86878' : '#E0D4D8',
            color: canSubmit ? 'white' : '#B0A0A4',
            transition: 'background 0.15s',
          }}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────

export default function DailyDetail() {
  const { date = localDateStr(new Date()) } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TimeEvent | null>(null)

  function openEdit(ev: TimeEvent) { setEditingEvent(ev); setShowForm(true) }
  function openAdd() { setEditingEvent(null); setShowForm(true) }
  function closeSheet() { setShowForm(false); setEditingEvent(null) }

  const { data: events = [] } = useQuery({
    queryKey: ['events', date],
    queryFn: () => api.getEvents({ date }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
    staleTime: Infinity,
  })

  const catMap = new Map(categories.map(c => [c.id, c]))
  const today = new Date().toISOString().slice(0, 10)

  const actual = events.filter(e => e.type === 'actual')
  const planned = events.filter(e => e.type === 'planned')
  const inspirations = events.filter(e => e.type === 'inspiration')

  const isExpired = (ev: TimeEvent) => {
    if (date < today) return true
    if (date === today) {
      const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
      const endMin = timeToMinutes(ev.end_time ?? ev.start_time)
      return endMin < nowMin
    }
    return false
  }

  const sortedActual = [...actual, ...inspirations].sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 430, margin: '0 auto', background: '#FDF6F8', boxShadow: '0 0 40px rgba(0,0,0,0.10)', overflowX: 'hidden' }}>

      {/* ── Header ── */}
      <header style={{ background: 'linear-gradient(130deg, #C86878 0%, #C88860 100%)', color: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 0' }}>
          {/* Left: back to calendar + prev day */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 64 }}>
            <IconBtn onClick={() => navigate('/calendar')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </IconBtn>
            <IconBtn onClick={() => navigate(`/daily/${shiftDate(date, -1)}`)}>
              <ChevronLeft />
            </IconBtn>
          </div>

          {/* Center: date */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '0.3px' }}>
              {formatDateDisplay(date)}
            </div>
            <div style={{ fontSize: 10, opacity: 0.72, marginTop: 1 }}>VibCheck Daily</div>
          </div>

          {/* Right: next day */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: 64 }}>
            <IconBtn onClick={() => navigate(`/daily/${shiftDate(date, 1)}`)}>
              <ChevronRight />
            </IconBtn>
          </div>
        </div>

        <MiniTimeline events={events} categories={categories} dateStr={date} />
      </header>

      {/* ── Stats strip ── */}
      <StatsStrip events={events} categories={categories} />

      {/* ── Scroll area ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 80px', WebkitOverflowScrolling: 'touch' }}>

        {/* Actual + inspirations */}
        {sortedActual.length > 0 && (
          <>
            <SectionLabel>记录</SectionLabel>
            {sortedActual.map(ev =>
              ev.type === 'inspiration'
                ? <InspirationRow key={ev.uuid} event={ev} onClick={() => openEdit(ev)} />
                : <ActualCard key={ev.uuid} event={ev} category={ev.category_id ? catMap.get(ev.category_id) : undefined} onClick={() => openEdit(ev)} />
            )}
          </>
        )}

        {/* Planned */}
        {planned.length > 0 && (
          <div style={{ marginTop: sortedActual.length > 0 ? 18 : 0 }}>
            <SectionLabel>计划日程</SectionLabel>
            {planned
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map(ev => (
                <PlannedCard
                  key={ev.uuid}
                  event={ev}
                  category={ev.category_id ? catMap.get(ev.category_id) : undefined}
                  expired={isExpired(ev)}
                  onClick={() => openEdit(ev)}
                />
              ))}
          </div>
        )}

        {/* Empty state */}
        {events.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 60, color: '#8A6A74' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14 }}>今天还没有记录</div>
            <div style={{ fontSize: 12, marginTop: 6, opacity: 0.7 }}>点击 + 开始记录</div>
          </div>
        )}
      </div>

      {/* ── FAB ── */}
      <button
        onClick={openAdd}
        style={{ position: 'fixed', bottom: 24, right: 'calc(50% - 215px + 16px)', width: 46, height: 46, background: '#E07858', color: 'white', border: 'none', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(224,120,88,0.38)', cursor: 'pointer', zIndex: 60 }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
      </button>

      {/* ── Add event sheet ── */}
      {showForm && (
        <AddEventSheet
          date={date}
          categories={categories}
          event={editingEvent ?? undefined}
          onClose={closeSheet}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
            closeSheet()
          }}
          onDeleted={() => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
            closeSheet()
          }}
        />
      )}
    </div>
  )
}
