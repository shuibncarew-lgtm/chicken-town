import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import { MenuItem } from '../types'
import { useCart } from '../context/CartContext'
import BottomNav from '../components/BottomNav'

export default function Offers() {
  const navigate = useNavigate()
  const { addItem, items: cartItems, updateQuantity } = useCart()
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

  const getCartQuantity = (itemId: string) => {
    const cartItem = cartItems.find(i => i.menu_item_id === itemId)
    return cartItem?.quantity || 0
  }

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image_url: item.image_url,
    })
  }

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    updateQuantity(itemId, quantity)
  }

  const renderCard = (item: MenuItem, isLarge = false) => {
    const qty = getCartQuantity(item.id)
    const savings = item.original_price ? item.original_price - item.price : 0

    return (
      <div key={item.id} className={`relative ${isLarge ? 'col-span-2' : ''}`}>
        <button
          onClick={() => navigate(`/item/${item.id}`)}
          className="w-full text-left"
        >
          <div className={`flex items-center justify-center rounded-card bg-fill-light dark:bg-fill-dark ${isLarge ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="h-full w-full rounded-card object-cover" loading="lazy" />
            ) : (
              <span className="text-xs font-bold text-muted-light/15 dark:text-muted-dark/15">CT</span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <p className="text-sm font-medium text-ink-light dark:text-ink-dark">{item.name}</p>
            {savings > 0 && (
              <span className="rounded-chip bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                Save Le {savings}
              </span>
            )}
            {!item.original_price && (
              <span className="rounded-chip bg-fill-light px-2 py-0.5 text-[10px] font-bold text-muted-light dark:bg-fill-dark dark:text-muted-dark">
                Bundle
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted-light dark:text-muted-dark">{item.description}</p>
          <p className="text-sm font-bold text-ink-light dark:text-ink-dark">
            Le {item.price}
            {item.original_price && (
              <>
                <span className="ml-1 text-sm font-normal text-muted-light line-through dark:text-muted-dark">
                  {item.original_price}
                </span>
                {item.offer_ends_at && (
                  <span className="ml-1 text-xs font-normal text-muted-light dark:text-muted-dark">
                    Ends {new Date(item.offer_ends_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </>
            )}
          </p>
        </button>
        <div className="absolute bottom-8 right-0">
          {qty === 0 ? (
            <button
              onClick={() => handleAddToCart(item)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-md"
              style={{ marginRight: '-4px', marginBottom: '-4px' }}
            >
              <span className="text-lg font-bold">+</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-chip bg-fill-light p-1 dark:bg-fill-dark">
              <button
                onClick={() => handleUpdateQuantity(item.id, qty - 1)}
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-card-light text-ink-light dark:bg-card-dark dark:text-ink-dark"
              >
                <span className="text-sm font-bold">−</span>
              </button>
              <span className="text-sm font-bold text-ink-light dark:text-ink-dark">{qty}</span>
              <button
                onClick={() => handleUpdateQuantity(item.id, qty + 1)}
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-card-light text-ink-light dark:bg-card-dark dark:text-ink-dark"
              >
                <span className="text-sm font-bold">+</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-light dark:bg-page-dark">
        <p className="text-muted-light dark:text-muted-dark">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-light page-padding dark:bg-page-dark">
      <h1 className="px-4 pt-6 text-[22px] font-bold text-ink-light dark:text-ink-dark">Offers</h1>

      {offers.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-light dark:text-muted-dark">
          New deals soon
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-6 px-4">
          {deals.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-bold text-ink-light dark:text-ink-dark">Deals</h2>
              <div className="grid grid-cols-2 gap-2.5">
                {deals.map(item => renderCard(item, deals.length === 1))}
              </div>
            </div>
          )}
          {superPromos.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-bold text-ink-light dark:text-ink-dark">Super Promo</h2>
              <div className="grid grid-cols-2 gap-2.5">
                {superPromos.map(item => renderCard(item))}
              </div>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
