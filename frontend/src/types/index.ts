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
}

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
