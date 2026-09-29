export interface BillCategory {
  id: number
  user_id: number
  parent_id: number | null
  name: string
  is_deleted: boolean
  created_at: string
}

export interface BillCategoryUpsert {
  name: string
  parent_id?: number | null
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

export type BillUpdate = Partial<BillCreate>
