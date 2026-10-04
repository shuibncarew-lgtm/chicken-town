export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  delivery_fee: number
  is_active: boolean
}

export interface Category {
  id: string
  name: string
  sort_order: number
}

export interface MenuItem {
  id: string
  category_id: string
  name: string
  description: string
  price: number
  original_price: number | null
  image_url: string
  is_available: boolean
  is_offer: boolean
  offer_starts_at: string | null
  offer_ends_at: string | null
  sort_order: number
}

export interface ItemOption {
  id: string
  menu_item_id: string
  label: string
  extra_price: number
}

export interface CartItem {
  menu_item_id: string
  name: string
  price: number
  quantity: number
  option_id?: string
  option_label?: string
  image_url?: string
}
