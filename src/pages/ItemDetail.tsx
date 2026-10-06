import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Heart, Minus, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { MenuItem, ItemOption } from '../types'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

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
      <div className="flex min-h-screen items-center justify-center bg-page-light dark:bg-page-dark">
        <p className="text-muted-light dark:text-muted-dark">Loading...</p>
      </div>
    )
  }

  const total = item.price * quantity

  const handleAddToCart = () => {
    addItem({
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      option_id: selectedOption?.id,
      option_label: selectedOption?.label,
      image_url: item.image_url,
    })
  }

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark">
      <div className="relative h-[230px] rounded-b-[30px] bg-fill-light dark:bg-fill-dark">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="h-full w-full rounded-b-[30px] object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-b-[30px] bg-fill-light dark:bg-fill-dark">
            <span className="text-2xl font-bold text-muted-light/15 dark:text-muted-dark/15">CT</span>
          </div>
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-card-light text-ink-light dark:bg-card-dark dark:text-ink-dark"
        >
          <ChevronLeft size={20} strokeWidth={1.7} />
        </button>
        <button
          onClick={toggleFavourite}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-card-light text-ink-light dark:bg-card-dark dark:text-ink-dark"
        >
          <Heart size={20} strokeWidth={1.7} className={isFavourite ? 'fill-brand text-brand' : ''} />
        </button>
      </div>

      <div className="flex flex-col gap-2.5 px-4 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[19px] font-bold text-ink-light dark:text-ink-dark">{item.name}</h1>
          <p className="text-[19px] font-bold text-brand">Le {item.price}</p>
        </div>

        <p className="text-sm leading-relaxed text-muted-light dark:text-muted-dark">
          {item.description}
        </p>

        {options.length > 0 && (
          <div className="mt-2 flex rounded-field bg-fill-light p-1 dark:bg-fill-dark">
            {options.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedOption(opt)}
                className={`flex-1 rounded-[11px] px-2 py-2 text-center text-sm ${
                  selectedOption?.id === opt.id
                    ? 'bg-card-light font-bold text-ink-light shadow-sm dark:bg-card-dark dark:text-ink-dark'
                    : 'text-muted-light dark:text-muted-dark'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2.5 pb-6 pt-8">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2.5 rounded-chip bg-fill-light p-1 dark:bg-fill-dark">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-card-light text-ink-light dark:bg-card-dark dark:text-ink-dark"
              >
                <Minus size={14} strokeWidth={1.7} />
              </button>
              <span className="text-sm font-bold text-ink-light dark:text-ink-dark">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-card-light text-ink-light dark:bg-card-dark dark:text-ink-dark"
              >
                <Plus size={14} strokeWidth={1.7} />
              </button>
            </div>
            <p className="text-base font-bold text-ink-light dark:text-ink-dark">Le {total}</p>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full rounded-button bg-brand py-3.5 text-center text-sm font-bold text-white"
          >
            Add to cart · Le {total}
          </button>
        </div>
      </div>
    </div>
  )
}
