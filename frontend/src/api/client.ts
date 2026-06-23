import axios from 'axios'
import type {
  Category, CategoryCreate, CategoryUpdate,
  TimeEvent, TimeEventCreate, TimeEventUpdate,
  WeeklyStats, MonthlyStats,
  BillCategory, BillItem, BillListResponse, BillCreate, BillUpdate,
  Project, ProjectCreate, ProjectUpdate,
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

  // ── Bill Categories ───────────────────────────────────────────────
  getBillCategories: () =>
    http.get<BillCategory[]>('/bill-categories').then(r => r.data),

  createBillCategory: (name: string) =>
    http.post<BillCategory>('/bill-categories', { name }).then(r => r.data),

  updateBillCategory: (id: number, name: string) =>
    http.put<BillCategory>(`/bill-categories/${id}`, { name }).then(r => r.data),

  deleteBillCategory: (id: number) =>
    http.delete(`/bill-categories/${id}`),

  // ── Projects ──────────────────────────────────────────────────────
  getProjects: () =>
    http.get<Project[]>('/projects').then(r => r.data),

  createProject: (body: ProjectCreate) =>
    http.post<Project>('/projects', body).then(r => r.data),

  updateProject: (id: number, body: ProjectUpdate) =>
    http.put<Project>(`/projects/${id}`, body).then(r => r.data),

  deleteProject: (id: number) =>
    http.delete(`/projects/${id}`),

  // ── Bills ─────────────────────────────────────────────────────────
  getBills: (params: { year?: number; month?: number; limit?: number; offset?: number }) =>
    http.get<BillListResponse>('/bills', { params }).then(r => r.data),

  createBill: (body: BillCreate) =>
    http.post<BillItem>('/bills', body).then(r => r.data),

  updateBill: (id: number, body: BillUpdate) =>
    http.put<BillItem>(`/bills/${id}`, body).then(r => r.data),

  deleteBill: (id: number) =>
    http.delete(`/bills/${id}`),
}
