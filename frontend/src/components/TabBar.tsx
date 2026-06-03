import { useNavigate, useLocation } from 'react-router-dom'

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)
const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>
)
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)

const TABS = [
  { path: '/calendar', label: '日历', Icon: CalendarIcon },
  { path: '/stats',    label: '统计', Icon: ChartIcon },
  { path: '/profile',  label: '我的', Icon: UserIcon },
]

export default function TabBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div style={{
      display: 'flex',
      background: 'white',
      borderTop: '1px solid #F0E4E8',
      flexShrink: 0,
      paddingBottom: 'env(safe-area-inset-bottom, 6px)',
    }}>
      {TABS.map(({ path, label, Icon }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1, border: 'none', background: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '7px 0 4px', gap: 3,
              color: active ? '#C86878' : '#C0A8B0',
            }}
          >
            <Icon />
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 500 }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
