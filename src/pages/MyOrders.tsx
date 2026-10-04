import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  order_items: { item_name: string; quantity: number }[]
}

export default function MyOrders() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(item_name, quantity)')
        .order('created_at', { ascending: false })

      const allOrders = data || []
      const active = allOrders.filter(o => ['new', 'preparing', 'ready'].includes(o.status))
      const past = allOrders.filter(o => ['completed', 'cancelled'].includes(o.status))

      setOrders(activeTab === 'active' ? active : past)
      setLoading(false)
    }
    loadOrders()
  }, [activeTab])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-light dark:bg-page-dark">
        <p className="text-muted-light dark:text-muted-dark">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-light pb-28 dark:bg-page-dark">
      <div className="flex items-center gap-3 px-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-fill-light text-ink-light dark:bg-fill-dark dark:text-ink-dark"
        >
          <ChevronLeft size={20} strokeWidth={1.7} />
        </button>
        <p className="text-[15px] font-bold text-ink-light dark:text-ink-dark">My orders</p>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-6 px-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-1 text-base font-bold ${
            activeTab === 'active'
              ? 'border-b-[2.5px] border-brand text-ink-light dark:text-ink-dark'
              : 'font-medium text-muted-light dark:text-muted-dark'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-1 text-base font-bold ${
            activeTab === 'past'
              ? 'border-b-[2.5px] border-brand text-ink-light dark:text-ink-dark'
              : 'font-medium text-muted-light dark:text-muted-dark'
          }`}
        >
          Past
        </button>
      </div>

      {/* Orders */}
      <div className="mt-4 flex flex-col gap-3 px-4">
        {orders.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-light dark:text-muted-dark">
            No orders here yet.
          </p>
        )}
        {orders.map(order => (
          <div key={order.id} className="rounded-card bg-fill-light p-3 dark:bg-fill-dark">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-ink-light dark:text-ink-dark">
                #{order.order_number}
              </span>
              <span
                className={`rounded-chip px-2 py-0.5 text-[10px] font-bold ${
                  ['new', 'preparing', 'ready'].includes(order.status)
                    ? 'bg-brand text-white'
                    : 'bg-fill-light text-muted-light dark:bg-fill-dark dark:text-muted-dark'
                }`}
              >
                {order.status === 'completed' ? 'Delivered' : order.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
              {order.order_items.map(i => `${i.quantity} × ${i.item_name}`).join(', ')}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-bold text-ink-light dark:text-ink-dark">
                Le {order.total}
              </span>
              {['new', 'preparing', 'ready'].includes(order.status) ? (
                <button
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="text-xs text-muted-light dark:text-muted-dark"
                >
                  Track
                </button>
              ) : (
                <button className="text-xs font-bold text-brand">Reorder</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
