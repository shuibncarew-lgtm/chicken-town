import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronDown, Search, Check, Phone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Branch, Category, MenuItem } from '../types'
import { useCart } from '../context/CartContext'
import BottomNav from '../components/BottomNav'

export default function Home() {
  const navigate = useNavigate()
  const { addItem, items: cartItems, updateQuantity } = useCart()
  const [branches, setBranches] = useState<Branch[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showBranchPicker, setShowBranchPicker] = useState(false)
  const [callNumber, setCallNumber] = useState('392')
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    async function loadData() {
      try {
        const [branchesRes, categoriesRes, itemsRes, settingsRes] = await Promise.all([
          supabase.from('branches').select('*').eq('is_active', true),
          supabase.from('categories').select('*').order('sort_order'),
          supabase.from('menu_items').select('*').eq('is_available', true).order('sort_order'),
          supabase.from('settings').select('call_number').single(),
        ])
        setBranches(branchesRes.data || [])
        setCategories(categoriesRes.data || [])
        setMenuItems(itemsRes.data || [])
        if (branchesRes.data && branchesRes.data.length > 0) {
          setSelectedBranch(branchesRes.data[0])
        }
        if (settingsRes.data) {
          setCallNumber(settingsRes.data.call_number)
        }
        setError(false)
      } catch (err) {
        console.error('Failed to load menu:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(i => i.category_id === selectedCategory)

  const offerItems = menuItems.filter(i => i.is_offer && i.original_price).slice(0, 3)

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

  const handleChipClick = (catId: string) => {
    setSelectedCategory(catId)
    if (catId !== 'all') {
      sectionRefs.current[catId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleRetry = () => {
    setLoading(true)
    setError(false)
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page-light page-padding dark:bg-page-dark">
        <div className="flex items-center justify-between px-4 pt-6">
          <div className="h-4 w-24 animate-pulse rounded bg-fill-light dark:bg-fill-dark" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-fill-light dark:bg-fill-dark" />
        </div>
        <div className="mt-4 px-4">
          <div className="h-6 w-48 animate-pulse rounded bg-fill-light dark:bg-fill-dark" />
          <div className="mt-2 h-6 w-32 animate-pulse rounded bg-fill-light dark:bg-fill-dark" />
        </div>
        <div className="mt-4 flex gap-1.5 px-4 pb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-16 animate-pulse rounded-chip bg-fill-light dark:bg-fill-dark" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 px-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-2xl bg-fill-light dark:bg-fill-dark" />
              <div className="mt-2 h-4 w-3/4 rounded bg-fill-light dark:bg-fill-dark" />
              <div className="mt-1 h-3 w-full rounded bg-fill-light dark:bg-fill-dark" />
              <div className="mt-1 h-4 w-1/2 rounded bg-fill-light dark:bg-fill-dark" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-page-light px-4 dark:bg-page-dark">
        <p className="text-base font-bold text-ink-light dark:text-ink-dark">Could not load the menu</p>
        <p className="mt-1 text-sm text-muted-light dark:text-muted-dark">Try again</p>
        <button
          onClick={handleRetry}
          className="mt-4 rounded-button bg-brand px-6 py-3 text-sm font-bold text-white"
        >
          Retry
        </button>
      </div>
    )
  }

  const renderCard = (item: MenuItem) => {
    const qty = getCartQuantity(item.id)
    return (
      <div key={item.id} className="relative">
        <button
          onClick={() => navigate(`/item/${item.id}`)}
          className="w-full text-left"
        >
          <div className="relative flex aspect-square items-center justify-center rounded-2xl bg-fill-light dark:bg-fill-dark">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="h-full w-full rounded-2xl object-cover" loading="lazy" />
            ) : (
              <span className="text-xs font-bold text-muted-light/15 dark:text-muted-dark/15">CT</span>
            )}
            {item.is_offer && (
              <span className="absolute left-2 top-2 rounded-chip bg-white px-2 py-0.5 text-[10px] font-medium text-brand">
                Offer
              </span>
            )}
          </div>
          <p className="mt-2 truncate text-[15px] font-semibold text-ink-light dark:text-ink-dark">{item.name}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-light dark:text-muted-dark">{item.description}</p>
          <p className="mt-1 text-[15px] font-bold text-brand">
            Le {item.price}
            {item.original_price && (
              <span className="ml-1 text-xs font-normal text-muted-light line-through dark:text-muted-dark">
                {item.original_price}
              </span>
            )}
          </p>
        </button>
        <div className="absolute -bottom-2 right-2">
          {qty === 0 ? (
            <button
              onClick={() => handleAddToCart(item)}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-brand text-white shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
              aria-label={`Add ${item.name} to cart`}
            >
              <span className="text-xl font-bold">+</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 rounded-full border-2 border-white bg-brand p-1 text-white shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
              <button
                onClick={() => handleUpdateQuantity(item.id, qty - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                aria-label="Decrease quantity"
              >
                <span className="text-base font-bold">−</span>
              </button>
              <span className="text-sm font-bold text-white">{qty}</span>
              <button
                onClick={() => handleUpdateQuantity(item.id, qty + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                aria-label="Increase quantity"
              >
                <span className="text-base font-bold">+</span>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-light page-padding dark:bg-page-dark">
      <div className="flex items-center justify-between px-4 pt-6">
        <p className="text-xs font-bold tracking-wide text-brand">CHICKEN TOWN</p>
        <div className="flex items-center gap-2">
          <a
            href={`tel:${callNumber}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-fill-light text-ink-light dark:bg-fill-dark dark:text-ink-dark"
            aria-label="Call us"
          >
            <Phone size={18} strokeWidth={1.7} />
          </a>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-fill-light text-ink-light dark:bg-fill-dark dark:text-ink-dark" aria-label="Search">
            <Search size={18} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-4">
        <button
          onClick={() => setShowBranchPicker(true)}
          className="flex items-center gap-1 text-sm font-medium text-ink-light dark:text-ink-dark"
        >
          <MapPin size={16} strokeWidth={1.7} />
          {selectedBranch?.name || 'Select branch'}
          <ChevronDown size={14} strokeWidth={1.7} />
        </button>
      </div>

      {selectedBranch && (
        <div className="mx-4 mt-2 rounded-chip bg-fill-light px-3 py-1.5 text-xs text-muted-light dark:bg-fill-dark dark:text-muted-dark">
          Delivery from Le {selectedBranch.delivery_fee} · about 25 min
        </div>
      )}

      <h1 className="mt-3 px-4 text-[19px] font-bold leading-tight text-ink-light dark:text-ink-dark">
        What are you<br />eating today?
      </h1>

      {offerItems.length > 0 && (
        <div className="mx-4 mt-4 flex gap-3 overflow-x-auto">
          {offerItems.map(offerItem => (
            <button
              key={offerItem.id}
              onClick={() => navigate(`/item/${offerItem.id}`)}
              className="flex h-[92px] w-[260px] flex-none items-center justify-between rounded-card bg-brand px-4 text-left"
            >
              <div>
                <p className="text-base font-semibold text-white">{offerItem.name}</p>
                <p className="text-lg font-semibold text-white">Le {offerItem.price}</p>
                <span className="mt-1.5 inline-block rounded-chip bg-white px-3 py-1 text-xs font-bold text-brand">
                  Order now
                </span>
              </div>
              <div className="flex h-[68px] w-[70px] flex-none items-center justify-center rounded-card bg-white/20">
                {offerItem.image_url ? (
                  <img src={offerItem.image_url} alt="" className="h-full w-full rounded-card object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white/80">CT</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-1.5 overflow-x-auto px-4 pb-4" style={{ scrollbarWidth: 'none' }}>
        <style>{`::-webkit-scrollbar { display: none; }`}</style>
        <button
          onClick={() => handleChipClick('all')}
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
            onClick={() => handleChipClick(cat.id)}
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

      {selectedCategory === 'all' ? (
        <div className="px-4 pb-[100px]">
          {categories.map(cat => {
            const catItems = menuItems.filter(i => i.category_id === cat.id)
            if (catItems.length === 0) return null
            return (
              <div key={cat.id} ref={el => { sectionRefs.current[cat.id] = el }} className="mt-5 mb-3">
                <h2 className="text-lg font-bold text-ink-light dark:text-ink-dark">{cat.name}</h2>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {catItems.map(item => renderCard(item))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pb-[100px]">
          {filteredItems.map(item => renderCard(item))}
        </div>
      )}

      {showBranchPicker && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-[28px] bg-card-light p-5 dark:bg-card-dark">
            <h2 className="text-lg font-bold text-ink-light dark:text-ink-dark">Select branch</h2>
            <div className="mt-4 flex flex-col gap-2">
              {branches.map(branch => (
                <button
                  key={branch.id}
                  onClick={() => {
                    setSelectedBranch(branch)
                    setShowBranchPicker(false)
                  }}
                  className="flex items-center justify-between rounded-field bg-fill-light px-4 py-3 text-left dark:bg-fill-dark"
                >
                  <div>
                    <p className="text-sm font-bold text-ink-light dark:text-ink-dark">{branch.name}</p>
                    <p className="text-xs text-muted-light dark:text-muted-dark">{branch.address}</p>
                  </div>
                  {selectedBranch?.id === branch.id && (
                    <Check size={18} className="text-brand" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowBranchPicker(false)}
              className="mt-4 w-full rounded-button bg-fill-light py-3 text-center text-sm font-medium text-ink-light dark:bg-fill-dark dark:text-ink-dark"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
