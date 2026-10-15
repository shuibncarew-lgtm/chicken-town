import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { formatLe } from '../lib/currency'
import { useState, useEffect } from 'react'
import { Branch } from '../types'

export default function Cart() {
  const navigate = useNavigate()
  const { items, updateQuantity } = useCart()
  const { user } = useAuth()
  const [branch, setBranch] = useState<Branch | null>(null)
  const [address, setAddress] = useState('')

  useEffect(() => {
    async function loadBranch() {
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('branch_id').eq('id', user.id).single()
      if (profile?.branch_id) {
        const { data: branchData } = await supabase.from('branches').select('*').eq('id', profile.branch_id).single()
        setBranch(branchData)
      }
      const { data: addr } = await supabase.from('saved_addresses').select('address').eq('user_id', user.id).limit(1).single()
      if (addr) setAddress(addr.address)
    }
    loadBranch()
  }, [user])

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const deliveryFee = branch?.delivery_fee || 0
  const total = subtotal + deliveryFee

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-cream">
        <div className="flex items-center gap-3 px-4 pt-6">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-transparent text-black"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <h1 className="font-display text-2xl uppercase tracking-wide text-black">Your cart</h1>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <p className="font-display text-lg uppercase text-black">Your cart is empty</p>
          <p className="mt-1 text-sm text-secondary">Add something delicious</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 rounded-pill bg-brand px-6 py-3 font-display text-sm uppercase tracking-wide text-white"
          >
            Browse menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream pb-32">
      <div className="flex items-center gap-3 px-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-transparent text-black"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
        <h1 className="font-display text-2xl uppercase tracking-wide text-black">Your cart</h1>
      </div>

      <div className="mt-4 flex flex-col gap-3 px-4">
        {items.map(item => {
          const lineTotal = item.price * item.quantity
          return (
            <div key={`${item.menu_item_id}-${item.option_id || ''}`} className="flex gap-3 rounded-card bg-white p-3 shadow-sm">
              <div className="flex h-16 w-16 flex-none items-center justify-center rounded-xl bg-surface">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <span className="font-display text-xs text-black/15">CT</span>
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <p className="font-display text-sm uppercase leading-tight text-black">{item.name}</p>
                  <p className="font-display text-sm uppercase text-black">{formatLe(lineTotal)}</p>
                </div>
                {item.option_label && (
                  <p className="mt-0.5 text-xs text-secondary">{item.option_label}</p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-secondary">{formatLe(item.price)} each</p>
                  <div className="inline-flex items-center gap-1 rounded-full bg-surface p-1">
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1, item.option_id)}
                      aria-label="Decrease quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <span className="text-sm font-bold">−</span>
                    </button>
                    <span className="min-w-[20px] text-center text-xs font-bold text-black">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1, item.option_id)}
                      aria-label="Increase quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <span className="text-sm font-bold">+</span>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => updateQuantity(item.menu_item_id, 0, item.option_id)}
                  className="mt-1 self-start text-xs text-brand underline underline-offset-2"
                >
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 px-4">
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <p className="text-sm text-black">
            Deliver to <span className="font-bold">{address || branch?.name || 'your address'}</span>
          </p>
          <button className="text-sm font-medium text-black underline underline-offset-2">
            Change
          </button>
        </div>
        <div className="flex items-center justify-between border-b border-black/10 py-3">
          <p className="text-sm text-secondary">Delivery</p>
          <p className="text-sm text-black">{deliveryFee === 0 ? 'Free' : formatLe(deliveryFee)}</p>
        </div>
        <div className="flex items-center justify-between py-4">
          <p className="font-display text-xl uppercase text-black">Total</p>
          <p className="font-display text-xl uppercase text-black">{formatLe(total)}</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-sm p-4">
          <button
            onClick={() => navigate('/checkout')}
            className="flex h-14 w-full items-center justify-center rounded-pill bg-brand font-display text-lg uppercase tracking-wide text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
