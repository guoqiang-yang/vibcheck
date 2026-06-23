import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Calendar from './pages/Calendar'
import DailyDetail from './pages/DailyDetail'
import Stats from './pages/Stats'
import Profile from './pages/Profile'
import Ledger from './pages/Ledger'
import LedgerManage from './pages/LedgerManage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/calendar" replace />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/daily/:date" element={<DailyDetail />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/ledger/manage" element={<LedgerManage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
