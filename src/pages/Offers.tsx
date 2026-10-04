import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { MenuItem } from '../types'
import { useCart } from '../context/CartContext'
import BottomNav from '../components/BottomNav'

export default function Offers() {
  const navigate = useNavigate()
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-light dark:bg-page-dark">
        <p className="text-muted-light dark:text-muted-dark">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-light pb-28 dark:bg-page-dark">
      <h1 className="px-4 pt-6 text-[22px] font-bold text-ink-light dark:text-ink-dark">Offers</h1>

      {offers.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-light dark:text-muted-dark">
          No offers right now.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2.5 px-4">
          {offers.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(`/item/${item.id}`)}
              className="text-left"
            >
              <div className="flex h-[78px] items-center justify-center rounded-card bg-fill-light text-muted-light dark:bg-fill-dark dark:text-muted-dark">
                <Plus size={24} />
              </div>
              <p className="mt-1.5 text-sm font-medium text-ink-light dark:text-ink-dark">{item.name}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink-light dark:text-ink-dark">
                  Le {item.price}
                  {item.original_price && (
                    <span className="ml-1 text-xs font-normal text-muted-light line-through dark:text-muted-dark">
                      {item.original_price}
                    </span>
                  )}
                </p>
                <span
                  onClick={e => {
                    e.stopPropagation()
                    addItem({
                      menu_item_id: item.id,
                      name: item.name,
                      price: item.price,
                      quantity: 1,
                      image_url: item.image_url,
                    })
                  }}
                  className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-brand text-white"
                >
                  <Plus size={15} strokeWidth={2.2} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
