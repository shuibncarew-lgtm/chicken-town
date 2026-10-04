import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Minus, Plus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import BottomNav from '../components/BottomNav'

export default function Cart() {
  const navigate = useNavigate()
  const { items, updateQuantity } = useCart()

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const deliveryFee = 0
  const total = subtotal + deliveryFee

  return (
    <div className="min-h-screen bg-page-light pb-28 dark:bg-page-dark">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-fill-light text-ink-light dark:bg-fill-dark dark:text-ink-dark"
        >
          <ChevronLeft size={20} strokeWidth={1.7} />
        </button>
        <p className="text-[15px] font-bold text-ink-light dark:text-ink-dark">Cart</p>
      </div>

      {/* Cart Items */}
      <div className="mt-4 flex flex-col gap-3 px-4">
        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-light dark:text-muted-dark">
            Your cart is empty
          </p>
        )}
        {items.map(item => (
          <div key={`${item.menu_item_id}-${item.option_id || ''}`} className="flex items-center gap-3">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-fill-light text-muted-light dark:bg-fill-dark dark:text-muted-dark">
              <Plus size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-ink-light dark:text-ink-dark">{item.name}</p>
              <p className="text-xs text-muted-light dark:text-muted-dark">Le {item.price}</p>
            </div>
            <div className="inline-flex items-center gap-2.5 rounded-chip bg-fill-light p-1 dark:bg-fill-dark">
              <button
                onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1, item.option_id)}
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-card-light text-ink-light dark:bg-card-dark dark:text-ink-dark"
              >
                <Minus size={14} strokeWidth={1.7} />
              </button>
              <span className="text-sm font-bold text-ink-light dark:text-ink-dark">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1, item.option_id)}
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-card-light text-ink-light dark:bg-card-dark dark:text-ink-dark"
              >
                <Plus size={14} strokeWidth={1.7} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="mt-auto flex flex-col gap-2 px-4 pb-6 pt-8">
          <div className="flex items-center justify-between text-sm text-muted-light dark:text-muted-dark">
            <span>Subtotal</span>
            <span>Le {subtotal}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-light dark:text-muted-dark">
            <span>Delivery</span>
            <span>{deliveryFee === 0 ? 'Free delivery' : `Le ${deliveryFee}`}</span>
          </div>
          <div className="flex items-center justify-between text-[15px] font-bold text-ink-light dark:text-ink-dark">
            <span>Total</span>
            <span>Le {total}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="mt-2 w-full rounded-button bg-brand py-3.5 text-center text-sm font-bold text-white"
          >
            Checkout
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
