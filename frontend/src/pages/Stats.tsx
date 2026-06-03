import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { WeeklyStats, MonthlyStats, Engagement_ } from '../types'
import TabBar from '../components/TabBar'

// ── Date helpers ──────────────────────────────────────────────────

function getISOWeek(d: Date): number {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

// ── Icon buttons ──────────────────────────────────────────────────

const ChevronLeft = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
)
const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
)
function NavBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </button>
  )
}

// ── Engagement bar ────────────────────────────────────────────────

function EngagementBar({ eng }: { eng: Engagement_ }) {
  const isEmpty = eng.high_hours + eng.mid_hours + eng.low_hours === 0
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <span style={{ fontSize: 9, color: '#8A6A74', fontWeight: 600, whiteSpace: 'nowrap' }}>专注度</span>
        <div style={{ flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex', background: '#F0EAF0' }}>
          {isEmpty ? (
            <div style={{ flex: 1, background: '#F0EAF0', border: '1px dashed #E0D4D8' }} />
          ) : (
            <>
              {eng.high_pct > 0 && <div style={{ width: `${eng.high_pct}%`, background: '#C86878' }} />}
              {eng.mid_pct > 0 && <div style={{ width: `${eng.mid_pct}%`, background: 'rgba(200,104,120,0.45)' }} />}
              {eng.low_pct > 0 && <div style={{ width: `${eng.low_pct}%`, background: 'rgba(200,104,120,0.15)' }} />}
            </>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 7 }}>
        {[
          { label: '高投入', bg: '#C86878', pct: eng.high_pct, hrs: eng.high_hours },
          { label: '中投入', bg: 'rgba(200,104,120,0.45)', pct: eng.mid_pct, hrs: eng.mid_hours },
          { label: '低投入', bg: 'rgba(200,104,120,0.15)', pct: eng.low_pct, hrs: eng.low_hours },
        ].map(({ label, bg, pct, hrs }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#8A6A74' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: bg, flexShrink: 0 }} />
            {label} {isEmpty ? '—' : `${pct}% · ${hrs}h`}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Weekly bar chart ──────────────────────────────────────────────

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function WeeklyChart({ data }: { data: WeeklyStats }) {
  const maxHours = Math.max(...data.by_day.map(d => d.total_hours), 1)
  const BAR_H = 88

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: BAR_H + 20, padding: '0 2px' }}>
        {data.by_day.map((day, i) => {
          const isToday = day.date === todayStr
          const isWeekend = i >= 5
          const barH = day.total_hours > 0 ? Math.max((day.total_hours / maxHours) * BAR_H, 6) : 4
          return (
            <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: BAR_H + 20, justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', height: barH, display: 'flex', flexDirection: 'column-reverse', borderRadius: 4, overflow: 'hidden', background: day.total_hours === 0 ? '#F0EAF0' : undefined, border: day.total_hours === 0 ? '1px dashed #E0D4D8' : undefined }}>
                {day.segments.map(seg => (
                  <div
                    key={seg.category_id ?? 'none'}
                    style={{ width: '100%', height: `${(seg.hours / day.total_hours) * 100}%`, background: seg.color, minHeight: 2 }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 8, fontWeight: isToday ? 800 : 600, color: isToday ? '#C86878' : isWeekend ? '#E07858' : '#8A6A74' }}>
                {WEEKDAY_LABELS[i]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Duration labels on Y-axis reference */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 2px 0', fontSize: 8, color: '#C0A8B0' }}>
        <span>0h</span>
        <span>{(maxHours / 2).toFixed(maxHours % 2 === 0 ? 0 : 1)}h</span>
        <span>{Number.isInteger(maxHours) ? maxHours : maxHours.toFixed(1)}h</span>
      </div>

      {/* Category legend */}
      {data.by_day.some(d => d.segments.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {Array.from(
            new Map(
              data.by_day.flatMap(d => d.segments).map(s => [s.category_id, s])
            ).values()
          ).map(seg => (
            <div key={seg.category_id ?? 'none'} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#8A6A74' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
              {seg.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WeeklyEmpty() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 108, padding: '0 2px' }}>
        {WEEKDAY_LABELS.map(d => (
          <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', height: 6, background: '#F0EAF0', borderRadius: 3, border: '1px dashed #E0D4D8' }} />
            <span style={{ fontSize: 8, color: '#C0A8B0', fontWeight: 600 }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#C0A8B0' }}>本周暂无记录</div>
    </div>
  )
}

// ── Monthly donut chart ───────────────────────────────────────────

function MonthlyChart({ data }: { data: MonthlyStats }) {
  const stops: string[] = []
  let angle = 0
  for (const cat of data.by_category) {
    const deg = (cat.pct / 100) * 360
    stops.push(`${cat.color} ${angle.toFixed(1)}deg ${(angle + deg).toFixed(1)}deg`)
    angle += deg
  }
  const gradient = stops.length > 0
    ? `conic-gradient(${stops.join(',')})`
    : 'conic-gradient(#F0EAF0 0deg 360deg)'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Donut */}
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: gradient, flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 52, height: 52, background: 'white', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#2E1A22' }}>{data.total_hours}</span>
            <span style={{ fontSize: 8, color: '#8A6A74' }}>小时</span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {data.by_category.map(cat => (
            <div key={cat.category_id ?? 'none'} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 9, height: 9, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#2E1A22', flex: 1 }}>{cat.name}</span>
              <span style={{ fontSize: 10, color: '#8A6A74' }}>{cat.hours}h</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#2E1A22', width: 32, textAlign: 'right' }}>{cat.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MonthlyEmpty() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 100, height: 100, borderRadius: '50%', border: '14px dashed #E0D4D8', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#C0A8B0' }}>0</div>
          <div style={{ fontSize: 8, color: '#C0A8B0' }}>小时</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#C0A8B0', lineHeight: 2 }}>本月暂无记录</div>
    </div>
  )
}

// ── Shared empty engagement ───────────────────────────────────────

const emptyEng: Engagement_ = { high_hours: 0, mid_hours: 0, low_hours: 0, high_pct: 0, mid_pct: 0, low_pct: 0 }

// ── Main ──────────────────────────────────────────────────────────

type StatsView = 'weekly' | 'monthly'

export default function Stats() {
  const [view, setView] = useState<StatsView>('weekly')
  const now = new Date()

  const [weekYear, setWeekYear] = useState(now.getFullYear())
  const [week, setWeek] = useState(getISOWeek(now))
  const [monthYear, setMonthYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  function prevWeek() { if (week === 1) { setWeekYear(y => y - 1); setWeek(52) } else setWeek(w => w - 1) }
  function nextWeek() { if (week === 52) { setWeekYear(y => y + 1); setWeek(1) } else setWeek(w => w + 1) }
  function prevMonth() { if (month === 1) { setMonthYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 12) { setMonthYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1) }

  const { data: weeklyData } = useQuery({
    queryKey: ['stats', 'weekly', weekYear, week],
    queryFn: () => api.getWeeklyStats(weekYear, week),
    enabled: view === 'weekly',
  })

  const { data: monthlyData } = useQuery({
    queryKey: ['stats', 'monthly', monthYear, month],
    queryFn: () => api.getMonthlyStats(monthYear, month),
    enabled: view === 'monthly',
  })

  const cardStyle: React.CSSProperties = { margin: '10px 10px 0', background: 'white', borderRadius: 14, padding: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }
  const cardTitle: React.CSSProperties = { fontSize: 9, fontWeight: 700, color: '#8A6A74', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 430, margin: '0 auto', background: 'white', boxShadow: '0 0 40px rgba(0,0,0,0.10)' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(130deg,#C86878 0%,#C88860 100%)', color: 'white', flexShrink: 0 }}>
        <div style={{ padding: '11px 14px 0', fontSize: 16, fontWeight: 800 }}>统计</div>

        {/* 周/月 toggle */}
        <div style={{ display: 'flex', margin: '10px 14px 0', background: 'rgba(255,255,255,0.14)', borderRadius: 10, padding: 2 }}>
          {(['weekly', 'monthly'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ flex: 1, border: 'none', cursor: 'pointer', borderRadius: 8, padding: '5px 0', fontSize: 13, fontWeight: 600, background: view === v ? 'rgba(255,255,255,0.25)' : 'transparent', color: view === v ? 'white' : 'rgba(255,255,255,0.6)' }}>
              {v === 'weekly' ? '周视图' : '月视图'}
            </button>
          ))}
        </div>

        {/* Period nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px 12px' }}>
          <NavBtn onClick={view === 'weekly' ? prevWeek : prevMonth}><ChevronLeft /></NavBtn>
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            {view === 'weekly' ? `${weekYear}年 第${week}周` : `${monthYear}年${month}月`}
          </span>
          <NavBtn onClick={view === 'weekly' ? nextWeek : nextMonth}><ChevronRight /></NavBtn>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: '#FDF6F8', WebkitOverflowScrolling: 'touch' }}>

        {view === 'weekly' && (
          <>
            <div style={cardStyle}>
              <div style={cardTitle}>分类投入时长（小时）</div>
              {weeklyData && weeklyData.total_hours > 0
                ? <WeeklyChart data={weeklyData} />
                : <WeeklyEmpty />
              }
            </div>

            <div style={cardStyle}>
              <div style={cardTitle}>本周投入度分布</div>
              <EngagementBar eng={weeklyData?.engagement ?? emptyEng} />
            </div>

            {weeklyData && weeklyData.total_hours > 0 && (
              <div style={cardStyle}>
                <div style={cardTitle}>本周汇总</div>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#2E1A22' }}>{weeklyData.total_hours}</div>
                    <div style={{ fontSize: 9, color: '#8A6A74', marginTop: 2 }}>总时长 (h)</div>
                  </div>
                  <div style={{ width: 1, background: '#F0E4E8' }} />
                  {weeklyData.by_day.flatMap(d => d.segments).reduce<Array<{ name: string; color: string; hours: number }>>((acc, seg) => {
                    const existing = acc.find(a => a.name === seg.name)
                    if (existing) existing.hours = Math.round((existing.hours + seg.hours) * 10) / 10
                    else acc.push({ name: seg.name, color: seg.color, hours: seg.hours })
                    return acc
                  }, []).sort((a, b) => b.hours - a.hours).slice(0, 2).map((cat, i, arr) => (
                    <div key={cat.name} style={{ display: 'contents' }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: cat.color }}>{cat.hours}</div>
                        <div style={{ fontSize: 9, color: '#8A6A74', marginTop: 2 }}>{cat.name} (h)</div>
                      </div>
                      {i < arr.length - 1 && <div style={{ width: 1, background: '#F0E4E8' }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {view === 'monthly' && (
          <>
            <div style={cardStyle}>
              <div style={cardTitle}>分类投入时长</div>
              {monthlyData && monthlyData.total_hours > 0
                ? <MonthlyChart data={monthlyData} />
                : <MonthlyEmpty />
              }
            </div>

            <div style={cardStyle}>
              <div style={cardTitle}>本月投入度分布</div>
              <EngagementBar eng={monthlyData?.engagement ?? emptyEng} />
            </div>

            {monthlyData && monthlyData.total_hours > 0 && (
              <div style={cardStyle}>
                <div style={cardTitle}>本月汇总</div>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#2E1A22' }}>{monthlyData.total_hours}</div>
                    <div style={{ fontSize: 9, color: '#8A6A74', marginTop: 2 }}>总时长 (h)</div>
                  </div>
                  <div style={{ width: 1, background: '#F0E4E8' }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#2E1A22' }}>{monthlyData.record_days}</div>
                    <div style={{ fontSize: 9, color: '#8A6A74', marginTop: 2 }}>记录天数</div>
                  </div>
                  <div style={{ width: 1, background: '#F0E4E8' }} />
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#C86878' }}>{monthlyData.daily_avg_hours}</div>
                    <div style={{ fontSize: 9, color: '#8A6A74', marginTop: 2 }}>日均 (h)</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ height: 16 }} />
      </div>

      <TabBar />
    </div>
  )
}
