export type DeliveryType = 'delivery' | 'pickup'
export type RentalStatus = 'pending' | 'confirmed' | 'active' | 'returned' | 'cancelled'
export type DurationUnit = 'daily' | 'weekly' | 'monthly'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  avatar_url: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  icon: string | null
  created_at: string
}

export interface Item {
  id: string
  category_id: string | null
  name: string
  description: string | null
  image_url: string | null
  daily_rate: number
  weekly_rate: number | null
  monthly_rate: number | null
  stock_quantity: number
  specs: Record<string, string | number> | null
  is_available: boolean
  created_at: string
  category?: Category
}

export interface RentalItem {
  id: string
  rental_id: string
  item_id: string
  quantity: number
  unit_price: number
  duration_days: number
  item?: Item
}

export interface Rental {
  id: string
  user_id: string
  status: RentalStatus
  delivery_type: DeliveryType | null
  delivery_address: string | null
  start_date: string
  end_date: string
  total_amount: number | null
  damage_protection: boolean
  notes: string | null
  created_at: string
  rental_items?: RentalItem[]
}

export interface Review {
  id: string
  user_id: string
  item_id: string
  rental_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface BuilderItem {
  item: Item
  quantity: number
  position: { x: number, y: number}
}

export interface RentalDuration {
  startDate: Date | null
  endDate: Date | null
  unit: DurationUnit
  days: number
}

export interface DragData {
  type: 'catalog-item' |  'desk-item'
  itemId: string
}