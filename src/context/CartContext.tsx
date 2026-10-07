import { createContext, useContext, useState, ReactNode } from 'react'
import { CartItem } from '../types'

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (menu_item_id: string, option_id?: string) => void
  updateQuantity: (menu_item_id: string, quantity: number, option_id?: string) => void
  clearCart: () => void
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('guest_cart')
    return saved ? JSON.parse(saved) : []
  })

  const persistCart = (newItems: CartItem[]) => {
    setItems(newItems)
    localStorage.setItem('guest_cart', JSON.stringify(newItems))
  }

  const addItem = (item: CartItem) => {
    const newItems = (() => {
      const existing = items.find(
        i => i.menu_item_id === item.menu_item_id && i.option_id === item.option_id
      )
      if (existing) {
        return items.map(i =>
          i.menu_item_id === item.menu_item_id && i.option_id === item.option_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...items, item]
    })()
    persistCart(newItems)
  }

  const removeItem = (menu_item_id: string, option_id?: string) => {
    const newItems = items.filter(i => !(i.menu_item_id === menu_item_id && i.option_id === option_id))
    persistCart(newItems)
  }

  const updateQuantity = (menu_item_id: string, quantity: number, option_id?: string) => {
    if (quantity <= 0) {
      removeItem(menu_item_id, option_id)
      return
    }
    const newItems = items.map(i =>
      i.menu_item_id === menu_item_id && i.option_id === option_id
        ? { ...i, quantity }
        : i
    )
    persistCart(newItems)
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('guest_cart')
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
