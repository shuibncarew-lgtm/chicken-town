import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { MenuItem, ItemOption } from '../types'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatLe } from '../lib/currency'
import IconButton from '../components/IconButton'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { user } = useAuth()
  const [item, setItem] = useState<MenuItem | null>(null)
  const [options, setOptions] = useState<ItemOption[]>([])
  const [selectedOption, setSelectedOption] = useState<ItemOption | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isFavourite, setIsFavourite] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadItem() {
      const [itemRes, optionsRes] = await Promise.all([
        supabase.from('menu_items').select('*').eq('id', id).single(),
        supabase.from('item_options').select('*').eq('menu_item_id', id),
      ])
      setItem(itemRes.data)
      setOptions(optionsRes.data || [])
      if (optionsRes.data && optionsRes.data.length > 0) {
        setSelectedOption(optionsRes.data[0])
      }

      if (user) {
        const { data: favData } = await supabase
          .from('favourites')
          .select('menu_item_id')
          .eq('user_id', user.id)
          .eq('menu_item_id', id)
          .single()
        setIsFavourite(!!favData)
      }

      setLoading(false)
    }
    loadItem()
  }, [id, user])

  const toggleFavourite = async () => {
    if (!user || !item) return
    if (isFavourite) {
      await supabase
        .from('favourites')
        .delete()
        .eq('user_id', user.id)
        .eq('menu_item_id', item.id)
      setIsFavourite(false)
    } else {
      await supabase
        .from('favourites')
        .insert({ user_id: user.id, menu_item_id: item.id })
      setIsFavourite(true)
    }
  }

  if (loading || !item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-secondary">Loading...</p>
      </div>
    )
  }

  const optionExtra = selectedOption?.extra_price || 0
  const unitPrice = item.price + optionExtra
  const total = unitPrice * quantity

  const handleAddToCart = () => {
    addItem({
      menu_item_id: item.id,
      name: item.name,
      price: unitPrice,
      quantity,
      option_id: selectedOption?.id,
      option_label: selectedOption?.label,
      image_url: item.image_url,
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <div className="relative bg-brand">
        <div className="flex items-center justify-between px-4 pt-6">
          <IconButton
            label="Go back"
            onClick={() => navigate(-1)}
            className="bg-cream text-black"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </IconButton>
          <IconButton
            label="Favourite"
            onClick={toggleFavourite}
            className={`bg-cream ${isFavourite ? 'text-brand' : 'text-black'}`}
          >
            <Heart size={20} strokeWidth={2} className={isFavourite ? 'fill-brand' : ''} />
          </IconButton>
        </div>

        <div className="mx-4 mb-0 mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-t-[22px] bg-brand/80">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-sm uppercase tracking-widest text-white/40">
              Photo
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pt-4">
        <h1 className="font-display text-2xl uppercase leading-tight tracking-wide text-black">
          {item.name}
        </h1>

        <p className="mt-1 text-sm leading-relaxed text-secondary">
          {item.description}
        </p>

        <p className="mt-3 font-display text-xl uppercase text-black">
          {formatLe(item.price)}
        </p>

        {options.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-black">Choose a drink</p>
              <span className="rounded-pill bg-yellow px-2.5 py-1 text-[10px] font-bold uppercase text-black">
                Required
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(opt)}
                  className={`min-h-[44px] rounded-pill px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    selectedOption?.id === opt.id
                      ? 'bg-black text-cream'
                      : 'border border-black/20 bg-transparent text-secondary hover:border-black/40'
                  }`}
                >
                  {opt.label}
                  {opt.extra_price > 0 && (
                    <span className="ml-1 text-xs">+{formatLe(opt.extra_price)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-auto flex max-w-sm items-center gap-3 rounded-t-[28px] bg-black p-4">
          <div className="inline-flex items-center gap-1 rounded-full bg-cream p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              aria-label="Decrease quantity"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span className="text-base font-bold">−</span>
            </button>
            <span className="min-w-[24px] text-center text-sm font-bold text-black">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              aria-label="Increase quantity"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span className="text-base font-bold">+</span>
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex h-12 flex-1 items-center justify-center rounded-pill bg-brand font-display text-base uppercase tracking-wide text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Add to cart · {formatLe(total)}
          </button>
        </div>
      </div>
    </div>
  )
}
