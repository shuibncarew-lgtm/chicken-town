import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { MenuItem } from '../types'
import { useCart } from '../context/CartContext'
import { formatLe } from '../lib/currency'
import BottomNav from '../components/BottomNav'

export default function Offers() {
  const { addItem } = useCart()
  const [offers, setOffers] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOffers() {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_offer', true)
        .eq('is_available', true)

      const now = new Date()
      const activeOffers = (data || []).filter(item => {
        const startsAt = item.offer_starts_at ? new Date(item.offer_starts_at) : null
        const endsAt = item.offer_ends_at ? new Date(item.offer_ends_at) : null
        if (startsAt && now < startsAt) return false
        if (endsAt && now > endsAt) return false
        return true
      })

      setOffers(activeOffers)
      setLoading(false)
    }
    loadOffers()
  }, [])

  const deals = offers.filter(o => o.original_price)
  const superPromos = offers.filter(o => !o.original_price)

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image_url: item.image_url,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream page-padding">
        <div className="px-4 pt-6">
          <div className="h-8 w-24 animate-pulse rounded bg-surface" />
        </div>
        <div className="mt-4 px-4">
          <div className="h-40 w-full animate-pulse rounded-card bg-brand/20" />
        </div>
        <div className="mt-6 px-4">
          <div className="h-6 w-32 animate-pulse rounded bg-surface" />
        </div>
        <div className="mt-4 flex flex-col gap-3 px-4">
          {[1, 2].map(i => (
            <div key={i} className="h-24 w-full animate-pulse rounded-card bg-white" />
          ))}
        </div>
      </div>
    )
  }

  if (offers.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-cream">
        <div className="px-4 pt-6">
          <h1 className="font-display text-2xl uppercase tracking-wide text-black">Offers</h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-secondary">New deals soon</p>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream page-padding">
      <div className="px-4 pt-6">
        <h1 className="font-display text-2xl uppercase tracking-wide text-black">Offers</h1>
      </div>

      {deals.length > 0 && (
        <div className="mt-4 px-4">
          {deals.map(deal => (
            <div key={deal.id} className="rounded-card bg-brand p-4">
              <div className="flex items-center justify-between">
                <span className="inline-block rounded-pill bg-yellow px-2.5 py-1 text-[10px] font-bold uppercase text-black">
                  Save {formatLe(deal.original_price! - deal.price)}
                </span>
                {deal.offer_ends_at && (
                  <span className="text-xs text-white/80">
                    Ends {new Date(deal.offer_ends_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-display text-xl uppercase leading-tight text-white">
                    {deal.name}
                  </p>
                  <p className="mt-1 font-display text-xl uppercase text-white">
                    {formatLe(deal.price)}
                    <span className="ml-2 text-sm line-through opacity-70">
                      {formatLe(deal.original_price!)}
                    </span>
                  </p>
                  <button
                    onClick={() => handleAddToCart(deal)}
                    className="mt-3 rounded-pill bg-cream px-5 py-2.5 font-display text-sm uppercase tracking-wide text-black transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
                  >
                    Add to cart
                  </button>
                </div>
                <div className="ml-3 flex h-[80px] w-[80px] flex-none items-center justify-center rounded-xl bg-white/20">
                  {deal.image_url ? (
                    <img src={deal.image_url} alt={deal.name} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-white/60">CT</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {superPromos.length > 0 && (
        <div className="mt-6 px-4">
          <h2 className="font-display text-xl uppercase tracking-wide text-black">Super promo</h2>
          <div className="mt-3 flex flex-col gap-3">
            {superPromos.map(item => (
              <div key={item.id} className="flex items-center gap-3 rounded-card bg-white p-3 shadow-sm">
                <div className="flex h-16 w-16 flex-none items-center justify-center rounded-xl bg-surface">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <span className="font-display text-xs text-black/15">CT</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="inline-block w-fit rounded-pill bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-cream">
                    Bundle
                  </span>
                  <p className="mt-1 font-display text-sm uppercase leading-tight text-black">
                    {item.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-secondary">
                    {item.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-display text-sm uppercase text-black">{formatLe(item.price)}</p>
                  <button
                    onClick={() => handleAddToCart(item)}
                    aria-label={`Add ${item.name} to cart`}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
