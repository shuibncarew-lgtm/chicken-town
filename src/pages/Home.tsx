import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronDown, Search, Phone, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Branch, Category, MenuItem } from '../types'
import { useCart } from '../context/CartContext'
import { formatLe } from '../lib/currency'
import BottomNav from '../components/BottomNav'
import Chip from '../components/Chip'
import IconButton from '../components/IconButton'

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
      <div className="min-h-screen bg-cream page-padding">
        <div className="flex items-center justify-between px-4 pt-6">
          <div className="h-5 w-32 animate-pulse rounded bg-surface" />
          <div className="h-11 w-11 animate-pulse rounded-full border border-black/10" />
        </div>
        <div className="mt-4 px-4">
          <div className="h-11 w-full animate-pulse rounded-pill bg-surface" />
        </div>
        <div className="mt-6 px-4">
          <div className="h-8 w-48 animate-pulse rounded bg-surface" />
        </div>
        <div className="mt-4 px-4">
          <div className="h-32 w-full animate-pulse rounded-card bg-brand/20" />
        </div>
        <div className="mt-4 flex gap-2 px-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-9 w-20 animate-pulse rounded-pill bg-surface" />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 px-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-xl bg-surface" />
              <div className="mt-2 h-4 w-3/4 rounded bg-surface" />
              <div className="mt-1 h-4 w-1/2 rounded bg-surface" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
        <p className="text-base font-bold text-black">Could not load the menu</p>
        <p className="mt-1 text-sm text-secondary">Try again</p>
        <button
          onClick={handleRetry}
          className="mt-4 rounded-pill bg-brand px-6 py-3 font-display text-sm uppercase tracking-wide text-white"
        >
          Retry
        </button>
      </div>
    )
  }

  const renderCard = (item: MenuItem) => {
    const qty = getCartQuantity(item.id)
    return (
      <div key={item.id} className="rounded-card bg-white p-3 shadow-sm">
        <button
          onClick={() => navigate(`/item/${item.id}`)}
          className="block w-full text-left"
        >
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-surface">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <span className="font-display text-lg text-black/15">CT</span>
            )}
          </div>
          <p className="mt-2 font-display text-[15px] uppercase leading-tight tracking-wide text-black">
            {item.name}
          </p>
          <div className="mt-1 flex items-end justify-between">
            <p className="font-display text-[15px] uppercase text-black">
              {formatLe(item.price)}
            </p>
          </div>
        </button>
        <div className="mt-2 flex justify-end">
          {qty === 0 ? (
            <button
              onClick={() => handleAddToCart(item)}
              aria-label={`Add ${item.name} to cart`}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <span className="text-xl font-bold">+</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 rounded-full bg-surface p-1">
              <button
                onClick={() => handleUpdateQuantity(item.id, qty - 1)}
                aria-label="Decrease quantity"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <span className="text-base font-bold">−</span>
              </button>
              <span className="min-w-[24px] text-center text-sm font-bold text-black">{qty}</span>
              <button
                onClick={() => handleUpdateQuantity(item.id, qty + 1)}
                aria-label="Increase quantity"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
    <div className="min-h-screen bg-cream page-padding">
      <div className="flex items-center justify-between px-4 pt-6">
        <button
          onClick={() => setShowBranchPicker(true)}
          className="flex items-center gap-1 text-sm font-medium text-black"
        >
          <MapPin size={16} strokeWidth={1.7} />
          {selectedBranch?.name || 'Select branch'}
          <ChevronDown size={14} strokeWidth={1.7} />
        </button>
        <IconButton
          label="Call us"
          onClick={() => window.location.href = `tel:${callNumber}`}
          className="border border-black/10 bg-transparent text-black"
        >
          <Phone size={18} strokeWidth={1.7} />
        </IconButton>
      </div>

      <div className="mx-4 mt-4 flex items-center gap-2 rounded-pill bg-surface px-4 py-3">
        <Search size={18} strokeWidth={1.7} className="text-secondary" />
        <input
          type="text"
          placeholder="Search the menu"
          className="w-full bg-transparent text-sm text-black placeholder:text-secondary/60 focus:outline-none"
        />
      </div>

      <h1 className="mt-6 px-4 font-display text-[36px] uppercase leading-none tracking-tight text-black">
        What's cooking?
      </h1>

      {offerItems.length > 0 && (
        <div className="mx-4 mt-4 flex gap-3 overflow-x-auto">
          {offerItems.map(offerItem => (
            <button
              key={offerItem.id}
              onClick={() => navigate(`/item/${offerItem.id}`)}
              className="flex h-[120px] w-[280px] flex-none items-center justify-between rounded-card bg-brand p-4 text-left"
            >
              <div className="flex-1">
                <span className="inline-block rounded-pill bg-yellow px-2.5 py-1 text-[10px] font-bold uppercase text-black">
                  Save {formatLe(offerItem.original_price! - offerItem.price)}
                </span>
                <p className="mt-2 font-display text-lg uppercase leading-tight text-white">
                  {offerItem.name}
                </p>
                <p className="mt-1 font-display text-lg uppercase text-white">
                  {formatLe(offerItem.price)}
                  <span className="ml-1 text-sm line-through opacity-70">
                    {formatLe(offerItem.original_price!)}
                  </span>
                </p>
              </div>
              <div className="ml-3 flex h-[72px] w-[72px] flex-none items-center justify-center rounded-xl bg-white/20">
                {offerItem.image_url ? (
                  <img src={offerItem.image_url} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white/80">CT</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex gap-2 overflow-x-auto px-4 pb-4" style={{ scrollbarWidth: 'none' }}>
        <style>{`::-webkit-scrollbar { display: none; }`}</style>
        <Chip active={selectedCategory === 'all'} onClick={() => handleChipClick('all')}>
          All
        </Chip>
        {categories.map(cat => (
          <Chip key={cat.id} active={selectedCategory === cat.id} onClick={() => handleChipClick(cat.id)}>
            {cat.name}
          </Chip>
        ))}
      </div>

      {selectedCategory === 'all' ? (
        <div className="px-4 pb-[100px]">
          {categories.map(cat => {
            const catItems = menuItems.filter(i => i.category_id === cat.id)
            if (catItems.length === 0) return null
            return (
              <div key={cat.id} ref={el => { sectionRefs.current[cat.id] = el }} className="mt-6 mb-3">
                <h2 className="font-display text-xl uppercase tracking-wide text-black">{cat.name}</h2>
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
          <div className="w-full rounded-t-[28px] bg-cream p-5">
            <h2 className="font-display text-lg uppercase tracking-wide text-black">Select branch</h2>
            <div className="mt-4 flex flex-col gap-2">
              {branches.map(branch => (
                <button
                  key={branch.id}
                  onClick={() => {
                    setSelectedBranch(branch)
                    setShowBranchPicker(false)
                  }}
                  className="flex items-center justify-between rounded-pill bg-surface px-4 py-3 text-left"
                >
                  <div>
                    <p className="text-sm font-bold text-black">{branch.name}</p>
                    <p className="text-xs text-secondary">{branch.address}</p>
                  </div>
                  {selectedBranch?.id === branch.id && (
                    <Check size={18} className="text-brand" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowBranchPicker(false)}
              className="mt-4 w-full rounded-pill bg-surface py-3 text-center text-sm font-medium text-black"
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
