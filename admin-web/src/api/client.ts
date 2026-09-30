import axios from 'axios'
import type { BillCategory, BillCategoryUpsert, BillCreate, BillItem, BillListResponse, BillUpdate, Project } from '../types'

const http = axios.create({ baseURL: '/api/v1' })

export const api = {
  getBills: (params: { year?: number; month?: number; start_date?: string; end_date?: string; limit?: number; offset?: number }) =>
    http.get<BillListResponse>('/bills', { params }).then(r => r.data),

  createBill: (body: BillCreate) =>
    http.post<BillItem>('/bills', body).then(r => r.data),

  updateBill: (id: number, body: BillUpdate) =>
    http.put<BillItem>(`/bills/${id}`, body).then(r => r.data),

  deleteBill: (id: number) =>
    http.delete(`/bills/${id}`).then(r => r.data),

  getBillCategories: () =>
    http.get<BillCategory[]>('/bill-categories').then(r => r.data),

  createBillCategory: (body: BillCategoryUpsert) =>
    http.post<BillCategory>('/bill-categories', body).then(r => r.data),

  updateBillCategory: (id: number, body: BillCategoryUpsert) =>
    http.put<BillCategory>(`/bill-categories/${id}`, body).then(r => r.data),

  deleteBillCategory: (id: number) =>
    http.delete(`/bill-categories/${id}`).then(r => r.data),

  getProjects: () =>
    http.get<Project[]>('/projects').then(r => r.data),
}
