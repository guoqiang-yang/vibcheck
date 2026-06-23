export type EventType = 'actual' | 'planned' | 'inspiration'
export type Engagement = 'high' | 'mid' | 'low'

export interface Category {
  id: number
  user_id: number
  name: string
  color: string
  is_deleted?: boolean
  created_at: string
}

export interface CategoryCreate {
  name: string
  color: string
}

export interface CategoryUpdate {
  name?: string
  color?: string
}

export interface TimeEvent {
  id: number
  uuid: string
  user_id: number
  date: string
  title: string
  type: EventType
  category_id: number | null
  start_time: string
  end_time: string | null
  engagement: Engagement | null
  note: string | null
  content: string | null
  sub_category: string | null
  created_at: string
  updated_at: string
}

export interface TimeEventCreate {
  date: string
  title: string
  type: EventType
  category_id?: number
  start_time: string
  end_time?: string
  engagement?: Engagement
  note?: string
  content?: string
  sub_category?: string
}

export interface TimeEventUpdate {
  title?: string
  type?: EventType
  category_id?: number
  start_time?: string
  end_time?: string
  engagement?: Engagement
  note?: string
  content?: string
  sub_category?: string
}

// ── Ledger ─────────────────────────────────────────────────────────

export interface BillCategory {
  id: number
  user_id: number
  name: string
  is_deleted: boolean
  created_at: string
}

export interface Project {
  id: number
  user_id: number
  maintainer: string
  name: string
  category: string | null
  province: string | null
  city: string | null
  location_detail: string | null
  client: string | null
  contractor: string | null
  amount: number | null
  start_date: string | null
  finish_date: string | null
  status: 'prepare' | 'ongoing' | 'finished' | 'canceled' | null
  description: string | null
  is_deleted: boolean
  created_at: string
}

export interface BillItem {
  id: number
  user_id: number
  bill_date: string
  amount: number
  category_id: number | null
  category_name: string | null
  project_id: number | null
  project_name: string | null
  person: string | null
  description: string | null
  created_at: string
}

export interface BillListResponse {
  total: number
  total_amount: number
  items: BillItem[]
}

export interface BillCreate {
  bill_date: string
  amount: number
  category_id?: number
  project_id?: number
  person?: string
  description?: string
}

export interface BillUpdate {
  bill_date?: string
  amount?: number
  category_id?: number
  project_id?: number
  person?: string
  description?: string
}

export interface ProjectCreate {
  name: string
  maintainer: string
  category?: string
  province?: string
  city?: string
  location_detail?: string
  client?: string
  contractor?: string
  amount?: number
  start_date?: string
  finish_date?: string
  status?: 'prepare' | 'ongoing' | 'finished' | 'canceled'
  description?: string
}

export type ProjectUpdate = Partial<ProjectCreate>

// ── Stats ──────────────────────────────────────────────────────────

export interface StatSegment {
  category_id: number | null
  name: string
  color: string
  hours: number
}

export interface StatDay {
  date: string
  weekday: number
  total_hours: number
  segments: StatSegment[]
}

export interface Engagement_ {
  high_hours: number
  mid_hours: number
  low_hours: number
  high_pct: number
  mid_pct: number
  low_pct: number
}

export interface WeeklyStats {
  year: number
  week: number
  start_date: string
  end_date: string
  total_hours: number
  by_day: StatDay[]
  engagement: Engagement_
}

export interface StatCategory {
  category_id: number | null
  name: string
  color: string
  hours: number
  pct: number
}

export interface MonthlyStats {
  year: number
  month: number
  total_hours: number
  record_days: number
  daily_avg_hours: number
  by_category: StatCategory[]
  engagement: Engagement_
}
