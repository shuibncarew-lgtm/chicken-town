import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartBar() {
  const navigate = useNavigate()
  const { items, totalItems } = useCart()

  if (totalItems === 0) return null

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-sm">
      <button
        onClick={() => navigate('/cart')}
        className="flex w-full items-center justify-between rounded-button bg-brand px-4 py-3 text-white shadow-floating"
      >
        <span className="text-sm font-bold">{totalItems} item{totalItems > 1 ? 's' : ''} · Le {total}</span>
        <span className="text-sm font-bold">View cart</span>
      </button>
    </div>
  )
}
