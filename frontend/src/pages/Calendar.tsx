import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { TimeEvent } from '../types'

// ── Constants ────────────────────────────────────────────────────

const HR_START = 4
const HR_END = 24
const TOTAL_HRS = HR_END - HR_START
const DATE_COL_W = 30
const ROW_ACTUAL_H = 14
const ROW_PLANNED_H = 10

const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

// ── Helpers ──────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function toX(tlW: number, h: number, m: number) {
  return ((h - HR_START) + m / 60) / TOTAL_HRS * tlW
}

function engAlpha(eng: string | null) {
  return eng === 'high' ? 0.88 : eng === 'mid' ? 0.46 : 0.16
}

function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// ── Component ────────────────────────────────────────────────────

export default function Calendar() {
  const navigate = useNavigate()
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())
  const [tlWidth, setTlWidth] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const timeHeaderRef = useRef<HTMLDivElement>(null)
  const dayRowsRef = useRef<HTMLDivElement>(null)

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data: events = [] } = useQuery({
    queryKey: ['events', startDate, endDate],
    queryFn: () => api.getEvents({ start_date: startDate, end_date: endDate }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
    staleTime: Infinity,
  })

  // Measure timeline width on mount + resize
  useEffect(() => {
    function measure() {
      if (scrollRef.current) setTlWidth(scrollRef.current.clientWidth - DATE_COL_W)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Draw sticky time header
  useEffect(() => {
    const el = timeHeaderRef.current
    if (!el || tlWidth === 0) return
    let html = ''
    for (let h = HR_START; h <= HR_END; h++) {
      const x = toX(tlWidth, h, 0)
      const isMajor4 = h % 4 === 0
      const isMajor2 = h % 2 === 0
      const tickH = isMajor4 ? '100%' : isMajor2 ? '55%' : '30%'
      const tickC = isMajor4 ? '#94A3B8' : isMajor2 ? '#CBD5E1' : '#F0E4E8'
      html += `<div style="position:absolute;bottom:0;left:${x}px;width:1px;height:${tickH};background:${tickC}"></div>`
      if (isMajor4 && h < HR_END) {
        html += `<span style="position:absolute;bottom:2px;left:${x + 2}px;font-size:7px;font-weight:600;color:#94A3B8;white-space:nowrap;pointer-events:none">${h}</span>`
      }
    }
    el.innerHTML = html
  }, [tlWidth])

  // Draw day rows
  useEffect(() => {
    const container = dayRowsRef.current
    if (!container || tlWidth === 0) return

    const now = new Date()
    const catMap = new Map(categories.map(c => [c.id, c] as const))
    const byDate = new Map<string, TimeEvent[]>()
    events.forEach(ev => {
      const list = byDate.get(ev.date) ?? []
      list.push(ev)
      byDate.set(ev.date, list)
    })

    // Grid lines HTML (reused per row)
    let gridLines = ''
    for (let h = HR_START; h <= HR_END; h++) {
      const x = toX(tlWidth, h, 0)
      gridLines += `<div style="position:absolute;top:0;bottom:0;left:${x}px;width:1px;background:${h % 4 === 0 ? '#E8F5F9' : '#F8FAFC'};pointer-events:none"></div>`
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const availH = (scrollRef.current?.clientHeight ?? 0) - 18 // subtract time header
    const rowActualH = Math.max(ROW_ACTUAL_H, Math.floor(availH / daysInMonth))
    let html = ''

    for (let d = 1; d <= daysInMonth; d++) {
      const key = dateKey(year, month, d)
      const date = new Date(year, month, d)
      const isToday = key === todayStr
      const isWE = date.getDay() === 0 || date.getDay() === 6
      const dayEvents = byDate.get(key) ?? []
      const actual = dayEvents.filter(e => e.type === 'actual' || e.type === 'inspiration')
      const planned = dayEvents.filter(e => e.type === 'planned')

      // Date cell
      const dcBg = isToday ? '#C86878' : isWE ? '#FFF8ED' : 'white'
      const numColor = isToday ? 'white' : '#3D2030'
      const dot = isToday
        ? `<div style="width:3px;height:3px;background:rgba(255,255,255,0.8);border-radius:50%;margin-top:1px"></div>`
        : isWE
        ? `<div style="width:3px;height:3px;background:#E07858;border-radius:50%;opacity:0.5;margin-top:1px"></div>`
        : ''

      // Actual row
      let actualHtml = gridLines
      if (isToday) {
        const nx = toX(tlWidth, now.getHours(), now.getMinutes())
        actualHtml += `<div style="position:absolute;top:0;bottom:0;left:${nx}px;width:2px;background:#EF4444;z-index:5">
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:6px;height:6px;background:#EF4444;border-radius:50%;border:1.5px solid white"></div>
        </div>`
      }
      actual.forEach(ev => {
        if (ev.type === 'inspiration') {
          const [sh, sm] = ev.start_time.split(':').map(Number)
          const x = toX(tlWidth, sh, sm)
          actualHtml += `<div style="position:absolute;top:50%;left:${x}px;transform:translate(-50%,-50%);font-size:9px;line-height:1;pointer-events:none">⚡</div>`
          return
        }
        const cat = ev.category_id != null ? catMap.get(ev.category_id) : undefined
        const rgb = cat ? hexToRgb(cat.color) : '155,114,232'
        const color = cat?.color ?? '#9B72E8'
        const [sh, sm] = ev.start_time.split(':').map(Number)
        const [eh, em] = (ev.end_time ?? `${HR_END}:00`).split(':').map(Number)
        const x0 = toX(tlWidth, sh, sm)
        const w = Math.max(toX(tlWidth, eh, em) - x0 - 1, 3)
        actualHtml += `<div style="position:absolute;top:2px;height:${rowActualH - 4}px;left:${x0}px;width:${w}px;border-radius:4px;background:rgba(${rgb},${engAlpha(ev.engagement)});border:1px solid ${color}"></div>`
      })

      // Planned row (only if non-empty)
      let plannedHtml = ''
      if (planned.length > 0) {
        let ph = gridLines
        planned.forEach(ev => {
          const cat = ev.category_id != null ? catMap.get(ev.category_id) : undefined
          const rgb = cat ? hexToRgb(cat.color) : '155,114,232'
          const color = cat?.color ?? '#9B72E8'
          const [sh, sm] = ev.start_time.split(':').map(Number)
          const [eh, em] = (ev.end_time ?? `${HR_END}:00`).split(':').map(Number)
          const x0 = toX(tlWidth, sh, sm)
          const w = Math.max(toX(tlWidth, eh, em) - x0 - 1, 3)
          ph += `<div style="position:absolute;top:1px;height:${ROW_PLANNED_H - 2}px;left:${x0}px;width:${w}px;border-radius:4px;border:1.5px dashed ${color};background:rgba(${rgb},0.06);opacity:${key < todayStr ? 0.5 : 1}"></div>`
        })
        plannedHtml = `<div style="position:relative;height:${ROW_PLANNED_H}px;background:rgba(139,92,246,0.03);border-top:1px dashed rgba(139,92,246,0.18)">${ph}</div>`
      }

      html += `
        <div data-date="${key}" style="display:flex;flex-direction:row;border-bottom:1px solid #F5EEF0;background:${isToday ? '#FFF6F8' : isWE ? '#FFFCF5' : 'white'};cursor:pointer">
          <div style="flex-shrink:0;width:${DATE_COL_W}px;position:sticky;left:0;z-index:15;background:${dcBg};display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:1.5px solid #C86878;gap:1px;pointer-events:none">
            <span style="font-size:10px;font-weight:700;line-height:1;color:${numColor}">${d}</span>
            ${dot}
          </div>
          <div style="flex:1;display:flex;flex-direction:column">
            <div style="position:relative;height:${rowActualH}px">${actualHtml}</div>
            ${plannedHtml}
          </div>
        </div>`
    }

    container.innerHTML = html

    // Attach click → navigate
    container.querySelectorAll<HTMLElement>('[data-date]').forEach(el => {
      el.addEventListener('click', () => navigate(`/daily/${el.dataset.date}`))
    })

    // Scroll today into view when on current month
    const [todayY, todayM] = todayStr.split('-').map(Number)
    if (year === todayY && month === todayM - 1) {
      requestAnimationFrame(() => {
        const todayEl = container.querySelector<HTMLElement>(`[data-date="${todayStr}"]`)
        if (todayEl && scrollRef.current) {
          scrollRef.current.scrollTop = Math.max(0, todayEl.offsetTop - 60)
        }
      })
    }
  }, [tlWidth, year, month, events, categories, todayStr, navigate])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 430, margin: '0 auto', background: 'white', boxShadow: '0 0 40px rgba(0,0,0,0.10)' }}>

      {/* Header */}
      <header style={{ background: 'linear-gradient(130deg,#C86878 0%,#C88860 100%)', color: 'white', padding: '10px 14px 9px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <IconBtn onClick={prevMonth}><ChevronLeft /></IconBtn>
          <span style={{ fontSize: 16, fontWeight: 700, minWidth: 96, textAlign: 'center' }}>
            {year}年{MONTH_NAMES[month]}
          </span>
          <IconBtn onClick={nextMonth}><ChevronRight /></IconBtn>
        </div>
        <button
          onClick={() => { setYear(new Date().getFullYear()); setMonth(new Date().getMonth()) }}
          style={{ padding: '0 11px', height: 30, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          今天
        </button>
      </header>

      {/* Legend */}
      <div style={{ background: 'white', borderBottom: '1px solid #F5EEF0', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap', fontSize: 9, color: '#A08898', flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: cat.color }} />
            {cat.name}
          </div>
        ))}
        <div style={{ width: 1, height: 12, background: '#F5EEF0', flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: '#A08898', flexShrink: 0 }}>
          <div style={{ width: 20, height: 8, borderRadius: 2, border: '1.5px dashed #A08898' }} />
          计划日程
        </div>
      </div>

      {/* Scroll area */}
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>

        {/* Time header (sticky) */}
        <div style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', height: 18, background: 'white', borderBottom: '1px solid rgba(200,104,120,0.20)' }}>
          <div style={{ flexShrink: 0, width: DATE_COL_W, background: '#C86878' }} />
          <div ref={timeHeaderRef} style={{ flex: 1, position: 'relative' }} />
        </div>

        {/* Day rows (drawn by useEffect) */}
        <div ref={dayRowsRef} />
      </div>
    </div>
  )
}

// ── Shared icon components ────────────────────────────────────────

function IconBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ width: 30, height: 30, border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
