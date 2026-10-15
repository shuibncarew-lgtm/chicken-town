import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Receipt, MapPin, CreditCard, HelpCircle, LogOut, ChevronRight, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

export default function Profile() {
  const navigate = useNavigate()
  const { user, profile, signOut, isGuest, continueAsGuest } = useAuth()
  const [showInstall, setShowInstall] = useState(true)

  if (isGuest || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
        <h1 className="font-display text-xl uppercase text-black">Sign in to your account</h1>
        <p className="mt-2 text-sm text-secondary">Access your orders, saved addresses and favourites</p>
        <button
          onClick={() => navigate('/sign-in')}
          className="mt-6 w-full max-w-xs rounded-pill bg-brand py-3.5 font-display text-sm uppercase tracking-wide text-white"
        >
          Sign in
        </button>
        <button
          onClick={continueAsGuest}
          className="mt-2 w-full max-w-xs rounded-pill bg-surface py-3.5 font-display text-sm uppercase tracking-wide text-black"
        >
          Continue as guest
        </button>
        <BottomNav />
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/welcome')
  }

  const menuItems = [
    { icon: User, label: 'Personal information', action: () => {} },
    { icon: Receipt, label: 'My orders', action: () => navigate('/orders') },
    { icon: MapPin, label: 'Saved addresses', action: () => navigate('/profile/addresses') },
    { icon: CreditCard, label: 'Payment methods', action: () => {} },
    { icon: HelpCircle, label: 'Help & support', action: () => {} },
  ]

  return (
    <div className="min-h-screen bg-cream page-padding">
      <div className="mx-4 mt-6 rounded-card bg-black p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-brand">
            <span className="font-display text-xl uppercase text-white">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'C'}
            </span>
          </div>
          <div>
            <p className="font-display text-lg uppercase text-cream">{profile?.full_name || 'Customer'}</p>
            <p className="text-sm text-cream/60">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 px-4">
        {menuItems.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex items-center gap-3 rounded-card bg-white p-4 text-left shadow-sm transition-colors hover:bg-cream"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-cream">
              <Icon size={18} strokeWidth={1.7} />
            </div>
            <span className="flex-1 text-sm font-medium text-black">{label}</span>
            <ChevronRight size={16} className="text-secondary" />
          </button>
        ))}

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-card bg-white p-4 text-left shadow-sm transition-colors hover:bg-cream"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
            <LogOut size={18} strokeWidth={1.7} />
          </div>
          <span className="flex-1 text-sm font-medium text-brand">Sign out</span>
          <ChevronRight size={16} className="text-secondary" />
        </button>
      </div>

      {showInstall && (
        <div className="mx-4 mt-4 flex items-center justify-between rounded-card border-2 border-dashed border-black/20 bg-transparent p-4">
          <div className="flex-1">
            <p className="text-sm font-bold text-black">Install the app</p>
            <p className="text-xs text-secondary">Add to home screen</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInstall(false)}
              aria-label="Dismiss install prompt"
              className="flex h-9 w-9 items-center justify-center rounded-full text-secondary hover:bg-surface"
            >
              <X size={16} />
            </button>
            <button
              onClick={() => setShowInstall(false)}
              className="rounded-pill bg-black px-4 py-2 text-xs font-bold text-cream"
            >
              Install
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
