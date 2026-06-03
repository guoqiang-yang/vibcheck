import axios from 'axios'
import type {
  Category, CategoryCreate, CategoryUpdate,
  TimeEvent, TimeEventCreate, TimeEventUpdate,
  WeeklyStats, MonthlyStats,
} from '../types'

const http = axios.create({ baseURL: '/api/v1' })

export const api = {
  // ── Categories ────────────────────────────────────────────────
  getCategories: () =>
    http.get<Category[]>('/categories').then(r => r.data),

  createCategory: (body: CategoryCreate) =>
    http.post<Category>('/categories', body).then(r => r.data),

  updateCategory: (id: number, body: CategoryUpdate) =>
    http.put<Category>(`/categories/${id}`, body).then(r => r.data),

  deleteCategory: (id: number) =>
    http.delete(`/categories/${id}`),

  restoreCategory: (id: number) =>
    http.post<Category>(`/categories/${id}/restore`).then(r => r.data),

  // ── Events ────────────────────────────────────────────────────
  getEvents: (params: { date?: string; start_date?: string; end_date?: string }) =>
    http.get<TimeEvent[]>('/events', { params }).then(r => r.data),

  createEvent: (body: TimeEventCreate) =>
    http.post<TimeEvent>('/events', body).then(r => r.data),

  updateEvent: (uuid: string, body: TimeEventUpdate) =>
    http.put<TimeEvent>(`/events/${uuid}`, body).then(r => r.data),

  deleteEvent: (uuid: string) =>
    http.delete(`/events/${uuid}`),

  // ── Stats ─────────────────────────────────────────────────────
  getWeeklyStats: (year: number, week: number) =>
    http.get<WeeklyStats>('/stats/weekly', { params: { year, week } }).then(r => r.data),

  getMonthlyStats: (year: number, month: number) =>
    http.get<MonthlyStats>('/stats/monthly', { params: { year, month } }).then(r => r.data),
}
