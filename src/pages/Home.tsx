import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronDown, Search, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Branch, Category, MenuItem } from '../types'
import { useCart } from '../context/CartContext'
import BottomNav from '../components/BottomNav'

export default function Home() {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [, setBranches] = useState<Branch[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [branchesRes, categoriesRes, itemsRes] = await Promise.all([
        supabase.from('branches').select('*').eq('is_active', true),
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*').eq('is_available', true).order('sort_order'),
      ])
      setBranches(branchesRes.data || [])
      setCategories(categoriesRes.data || [])
      setMenuItems(itemsRes.data || [])
      if (branchesRes.data && branchesRes.data.length > 0) {
        setSelectedBranch(branchesRes.data[0])
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(i => i.category_id === selectedCategory)

  const offerItem = menuItems.find(i => i.is_offer && i.original_price)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-light dark:bg-page-dark">
        <p className="text-muted-light dark:text-muted-dark">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-light pb-28 dark:bg-page-dark">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6">
        <button className="flex items-center gap-1 text-sm font-medium text-ink-light dark:text-ink-dark">
          <MapPin size={16} strokeWidth={1.7} />
          {selectedBranch?.name || 'Select branch'}
          <ChevronDown size={14} strokeWidth={1.7} />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-fill-light text-ink-light dark:bg-fill-dark dark:text-ink-dark">
          <Search size={18} strokeWidth={1.7} />
        </button>
      </div>

      {/* Headline */}
      <h1 className="mt-4 px-4 text-[22px] font-bold leading-tight text-ink-light dark:text-ink-dark">
        What are you<br />eating today?
      </h1>

      {/* Offers Banner */}
      {offerItem && (
        <div className="mx-4 mt-4 flex h-[92px] items-center justify-between rounded-card bg-brand px-4">
          <div>
            <p className="text-base font-bold text-white">{offerItem.name}</p>
            <p className="text-sm text-white/90">Le {offerItem.price}</p>
            <span className="mt-1.5 inline-block rounded-chip bg-white px-3 py-1 text-xs font-bold text-brand">
              Order
            </span>
          </div>
          <div className="flex h-[68px] w-[70px] items-center justify-center rounded-card bg-white/20 text-white">
            <Plus size={24} />
          </div>
        </div>
      )}

      {/* Category Chips */}
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

      {/* Menu Grid */}
      <div className="mt-2 grid grid-cols-2 gap-2.5 px-4">
        {filteredItems.map(item => (
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

      <BottomNav />
    </div>
  )
}
