import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Image } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Category, MenuItem } from '../types'
import BottomNav from '../components/BottomNav'

export default function AdminMenu() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [catsRes, itemsRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*').order('sort_order'),
      ])
      setCategories(catsRes.data || [])
      setMenuItems(itemsRes.data || [])
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(i => i.category_id === selectedCategory)

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from('menu_items').update({ is_available: !current }).eq('id', id)
    setMenuItems(prev => prev.map(i => i.id === id ? { ...i, is_available: !current } : i))
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
      <div className="flex items-center justify-between px-4 pt-6">
        <h1 className="text-[22px] font-bold text-ink-light dark:text-ink-dark">Menu</h1>
        <button
          onClick={() => navigate('/admin/menu/new')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white"
        >
          <Plus size={20} strokeWidth={2.2} />
        </button>
      </div>

      <div className="mt-4 flex gap-1.5 overflow-x-auto px-4 pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`whitespace-nowrap rounded-chip px-3 py-1.5 text-sm ${
            selectedCategory === 'all'
              ? 'bg-ink-light text-page-light dark:bg-ink-dark dark:text-page-dark'
              : 'bg-fill-light text-muted-light dark:bg-fill-dark dark:text-muted-dark'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap rounded-chip px-3 py-1.5 text-sm ${
              selectedCategory === cat.id
                ? 'bg-ink-light text-page-light dark:bg-ink-dark dark:text-page-dark'
                : 'bg-fill-light text-muted-light dark:bg-fill-dark dark:text-muted-dark'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-col gap-2 px-4">
        {filteredItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(`/admin/menu/${item.id}`)}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[12px] bg-fill-light text-muted-light dark:bg-fill-dark dark:text-muted-dark">
              <Image size={18} strokeWidth={1.7} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-ink-light dark:text-ink-dark">{item.name}</p>
                {item.is_offer && (
                  <span className="rounded-chip bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                    Offer
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-light dark:text-muted-dark">
                Le {item.price}{!item.is_available && ' · sold out'}
              </p>
            </div>
            <button
              onClick={e => {
                e.stopPropagation()
                toggleAvailability(item.id, item.is_available)
              }}
              className={`relative h-5 w-[34px] flex-none rounded-full transition-colors ${
                item.is_available ? 'bg-brand' : 'bg-line-light dark:bg-line-dark'
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                  item.is_available ? 'left-[16px]' : 'left-0.5'
                }`}
              />
            </button>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
