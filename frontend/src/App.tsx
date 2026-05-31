import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Calendar from './pages/Calendar'
import DailyDetail from './pages/DailyDetail'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/calendar" replace />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/daily/:date" element={<DailyDetail />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
