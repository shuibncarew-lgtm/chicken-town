import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Phone, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  subtotal: number
  delivery_fee: number
}

interface OrderItem {
  item_name: string
  quantity: number
  unit_price: number
}

export default function OrderConfirmation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrder() {
      const [orderRes, itemsRes] = await Promise.all([
        supabase.rpc('get_order', { p_order_id: id }),
        supabase.rpc('get_order_items', { p_order_id: id }),
      ])
      if (orderRes.data && orderRes.data.length > 0) {
        setOrder(orderRes.data[0])
      }
      setItems(itemsRes.data || [])
      setLoading(false)
    }
    loadOrder()
  }, [id])

  if (loading || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-light dark:bg-page-dark">
        <p className="text-muted-light dark:text-muted-dark">Loading...</p>
      </div>
    )
  }

  const steps = ['Received', 'Preparing', 'Ready', 'Delivered']
  const statusMap: Record<string, number> = { new: 0, preparing: 1, ready: 2, completed: 3, cancelled: 0 }
  const currentStep = statusMap[order.status] ?? 0

  return (
    <div className="flex min-h-screen flex-col bg-page-light dark:bg-page-dark">
      <div className="flex flex-col items-center pt-8">
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-brand text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5 9-10" />
          </svg>
        </div>
        <h1 className="mt-3 text-[19px] font-bold text-ink-light dark:text-ink-dark">Order received</h1>
        <p className="mt-1 text-sm text-muted-light dark:text-muted-dark">#{order.order_number}</p>
      </div>

      <div className="mt-4 flex justify-between px-8">
        {steps.map((step, i) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`h-3 w-3 rounded-full ${
                i <= currentStep ? 'bg-brand' : 'bg-line-light dark:bg-line-dark'
              }`}
            />
            <span
              className={`mt-1 text-[10px] ${
                i <= currentStep
                  ? 'font-bold text-ink-light dark:text-ink-dark'
                  : 'text-muted-light dark:text-muted-dark'
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      <div className="mx-4 mt-4 rounded-card bg-fill-light p-3 dark:bg-fill-dark">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between py-1">
            <span className="text-sm text-ink-light dark:text-ink-dark">
              {item.quantity} × {item.item_name}
            </span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-line-light pt-2 dark:border-line-dark">
          <span className="text-sm font-bold text-ink-light dark:text-ink-dark">Total</span>
          <span className="text-sm font-bold text-ink-light dark:text-ink-dark">Le {order.total}</span>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-3 px-4 pb-6 pt-4">
        <a
          href="tel:392"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-fill-light text-ink-light dark:bg-fill-dark dark:text-ink-dark"
        >
          <Phone size={20} strokeWidth={1.7} />
        </a>
        <a
          href="https://wa.me/23280600700"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-fill-light text-ink-light dark:bg-fill-dark dark:text-ink-dark"
        >
          <MessageCircle size={20} strokeWidth={1.7} />
        </a>
        <button
          onClick={() => navigate('/orders')}
          className="flex-1 rounded-button bg-brand py-3 text-center text-sm font-bold text-white"
        >
          Track order
        </button>
      </div>
    </div>
  )
}
