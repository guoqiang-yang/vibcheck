export type EventType = 'actual' | 'planned' | 'inspiration'
export type Engagement = 'high' | 'mid' | 'low'

export interface Category {
  id: number
  user_id: number
  name: string
  color: string
  created_at: string
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
