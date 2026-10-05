import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface FavouriteItem {
  menu_item_id: string
  name: string
  price: number
  image_url: string
}

export default function Favourites() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [favourites, setFavourites] = useState<FavouriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavourites()
  }, [])

  async function loadFavourites() {
    if (!user) return
    const { data } = await supabase
      .from('favourites')
      .select('menu_item_id, menu_items(name, price, image_url)')
      .eq('user_id', user.id)

    const items = (data || []).map((f: any) => ({
      menu_item_id: f.menu_item_id,
      name: f.menu_items?.name || '',
      price: f.menu_items?.price || 0,
      image_url: f.menu_items?.image_url || '',
    }))
    setFavourites(items)
    setLoading(false)
  }

  const handleRemove = async (menuItemId: string) => {
    if (!user) return
    await supabase
      .from('favourites')
      .delete()
      .eq('user_id', user.id)
      .eq('menu_item_id', menuItemId)
    setFavourites(prev => prev.filter(f => f.menu_item_id !== menuItemId))
  }

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
        <p className="text-[15px] font-bold text-ink-light dark:text-ink-dark">Favourites</p>
      </div>

      <div className="mt-4 flex flex-col gap-2 px-4">
        {favourites.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-light dark:text-muted-dark">
            No favourites yet. Tap the heart on any item to save it here.
          </p>
        )}
        {favourites.map(item => (
          <div
            key={item.menu_item_id}
            className="flex items-center gap-3 rounded-card bg-fill-light p-3 dark:bg-fill-dark"
          >
            <button
              onClick={() => navigate(`/item/${item.menu_item_id}`)}
              className="flex flex-1 items-center gap-3 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-fill-light text-muted-light dark:bg-fill-dark dark:text-muted-dark">
                <Heart size={18} strokeWidth={1.7} />
              </div>
              <div>
                <p className="text-sm font-bold text-ink-light dark:text-ink-dark">{item.name}</p>
                <p className="text-xs text-muted-light dark:text-muted-dark">Le {item.price}</p>
              </div>
            </button>
            <button
              onClick={() => handleRemove(item.menu_item_id)}
              className="text-muted-light dark:text-muted-dark"
            >
              <Heart size={18} strokeWidth={1.7} className="fill-brand text-brand" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
