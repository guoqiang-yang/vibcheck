import axios from 'axios'
import type { Category, TimeEvent, TimeEventCreate, TimeEventUpdate } from '../types'

const http = axios.create({ baseURL: '/api/v1' })

export const api = {
  getCategories: () =>
    http.get<Category[]>('/categories').then(r => r.data),

  getEvents: (params: { date?: string; start_date?: string; end_date?: string }) =>
    http.get<TimeEvent[]>('/events', { params }).then(r => r.data),

  createEvent: (body: TimeEventCreate) =>
    http.post<TimeEvent>('/events', body).then(r => r.data),

  updateEvent: (uuid: string, body: TimeEventUpdate) =>
    http.put<TimeEvent>(`/events/${uuid}`, body).then(r => r.data),

  deleteEvent: (uuid: string) =>
    http.delete(`/events/${uuid}`),
}
