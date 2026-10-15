import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Tag, ShoppingBag, User } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { totalItems } = useCart()

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/offers', icon: Tag, label: 'Offers' },
    { path: '/cart', icon: ShoppingBag, label: 'Cart' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <nav className="mx-auto flex max-w-sm items-center justify-around rounded-pill bg-black px-2 py-2 shadow-lg">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-label={label}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                isActive ? 'bg-brand text-white' : 'text-cream/60 hover:text-cream'
              }`}
            >
              <Icon size={20} strokeWidth={1.7} />
              {path === '/cart' && totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-yellow text-[10px] font-bold text-black">
                  {totalItems}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
