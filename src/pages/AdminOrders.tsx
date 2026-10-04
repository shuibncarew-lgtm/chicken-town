import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  order_type: string
  payment_status: string
  payment_method: string
  payment_reference: string
  order_items: { item_name: string; quantity: number }[]
}

const statusFlow: Record<string, string> = {
  new: 'preparing',
  preparing: 'ready',
  ready: 'completed',
}

const statusLabels: Record<string, string> = {
  new: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedChip, setSelectedChip] = useState<string>('new')
  const [newCount, setNewCount] = useState(0)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    loadOrders()

    channelRef.current = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        const newOrder = payload.new as Order
        setOrders(prev => [newOrder, ...prev])
        setNewCount(prev => prev + 1)
        playSound()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, payload => {
        const updated = payload.new as Order
        setOrders(prev => prev.map(o => o.id === updated.id ? { ...updated, order_items: o.order_items || [] } : o))
      })
      .subscribe()

    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [])

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(item_name, quantity)')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setNewCount((data || []).filter(o => o.status === 'new').length)
  }

  function playSound() {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.value = 0.3
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
  }

  const filteredOrders = orders.filter(o => o.status === selectedChip)

  const advanceStatus = async (order: Order) => {
    const next = statusFlow[order.status]
    if (!next) return
    await supabase.from('orders').update({ status: next }).eq('id', order.id)
  }

  const markPaid = async (order: Order) => {
    await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', order.id)
  }

  return (
    <div className="min-h-screen bg-page-light pb-28 dark:bg-page-dark">
      <div className="flex items-center justify-between px-4 pt-6">
        <h1 className="text-[22px] font-bold text-ink-light dark:text-ink-dark">Orders</h1>
        {newCount > 0 && (
          <span className="rounded-chip bg-brand px-2.5 py-1 text-xs font-bold text-white">
            {newCount} new
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-1.5 px-4">
        {['new', 'preparing', 'ready'].map(chip => (
          <button
            key={chip}
            onClick={() => setSelectedChip(chip)}
            className={`rounded-chip px-4 py-2 text-sm ${
              selectedChip === chip
                ? 'bg-ink-light text-page-light dark:bg-ink-dark dark:text-page-dark'
                : 'bg-fill-light text-muted-light dark:bg-fill-dark dark:text-muted-dark'
            }`}
          >
            {statusLabels[chip]}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 px-4">
        {filteredOrders.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-light dark:text-muted-dark">
            No orders here.
          </p>
        )}
        {filteredOrders.map(order => (
          <div key={order.id} className="rounded-card bg-fill-light p-3 dark:bg-fill-dark">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-ink-light dark:text-ink-dark">
                #{order.order_number}
              </span>
              <span className="text-xs text-muted-light dark:text-muted-dark">
                {order.order_type === 'delivery' ? 'Delivery' : 'Pickup'}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
              {order.order_items?.map(i => `${i.quantity} × ${i.item_name}`).join(', ')}
            </p>
            <div className="mt-1 text-xs text-muted-light dark:text-muted-dark">
              {order.payment_method === 'mobile_money' ? 'Mobile money' : 'Pay on delivery'} · {order.payment_status === 'paid' ? 'Paid' : order.payment_status === 'pending_verification' ? 'Pending verification' : 'Unpaid'}
              {order.payment_reference && ` · Ref: ${order.payment_reference}`}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-bold text-ink-light dark:text-ink-dark">
                Le {order.total}
              </span>
              <div className="flex items-center gap-2">
                {order.payment_status === 'pending_verification' && (
                  <button
                    onClick={() => markPaid(order)}
                    className="rounded-chip bg-brand px-3 py-1.5 text-xs font-bold text-white"
                  >
                    Mark paid
                  </button>
                )}
                {statusFlow[order.status] && (
                  <button
                    onClick={() => advanceStatus(order)}
                    className="rounded-chip bg-brand px-3 py-1.5 text-xs font-bold text-white"
                  >
                    {order.status === 'new' ? 'Start preparing' : order.status === 'preparing' ? 'Mark ready' : 'Complete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
