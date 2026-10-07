import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Receipt, MapPin, Heart, HelpCircle, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import BottomNav from '../components/BottomNav'

export default function Profile() {
  const navigate = useNavigate()
  const { user, profile, signOut, isGuest, continueAsGuest } = useAuth()
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [saving, setSaving] = useState(false)

  if (isGuest || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-page-light px-4 dark:bg-page-dark">
        <h1 className="text-xl font-bold text-ink-light dark:text-ink-dark">Sign in to your account</h1>
        <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">Access your orders, saved addresses and favourites</p>
        <button
          onClick={() => navigate('/sign-in')}
          className="mt-6 w-full max-w-xs rounded-button bg-brand py-3.5 text-center text-sm font-bold text-white"
        >
          Sign in
        </button>
        <button
          onClick={continueAsGuest}
          className="mt-2 w-full max-w-xs rounded-button bg-fill-light py-3.5 text-center text-sm font-medium text-ink-light dark:bg-fill-dark dark:text-ink-dark"
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

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', user.id)
    setSaving(false)
    setEditing(false)
  }

  const menuItems = [
    { icon: User, label: 'Personal information', action: () => setEditing(true) },
    { icon: Receipt, label: 'My orders', action: () => navigate('/orders') },
    { icon: MapPin, label: 'Saved addresses', action: () => navigate('/profile/addresses') },
    { icon: Heart, label: 'Favourites', action: () => navigate('/profile/favourites') },
    { icon: HelpCircle, label: 'Help & support', action: () => {} },
    { icon: LogOut, label: 'Log out', action: handleSignOut },
  ]

  return (
    <div className="min-h-screen bg-page-light pb-28 dark:bg-page-dark">
      <div className="flex flex-col items-center pt-8">
        <div className="h-[62px] w-[62px] rounded-full bg-fill-light dark:bg-fill-dark" />
        <p className="mt-2 text-base font-bold text-ink-light dark:text-ink-dark">
          {profile?.full_name || 'Guest'}
        </p>
        <p className="text-sm text-muted-light dark:text-muted-dark">
          {user?.email || 'Not signed in'}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-1 px-4">
        {menuItems.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex items-center gap-3 py-2.5 text-left"
          >
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[12px] bg-fill-light text-ink-light dark:bg-fill-dark dark:text-ink-dark">
              <Icon size={18} strokeWidth={1.7} />
            </div>
            <span className="flex-1 text-sm text-ink-light dark:text-ink-dark">{label}</span>
            <ChevronRight size={16} className="text-muted-light dark:text-muted-dark" />
          </button>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-[28px] bg-card-light p-5 dark:bg-card-dark">
            <h2 className="text-lg font-bold text-ink-light dark:text-ink-dark">Edit profile</h2>
            <div className="mt-4 flex flex-col gap-2.5">
              <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
                <label className="text-xs text-muted-light dark:text-muted-dark">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
                />
              </div>
              <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
                <label className="text-xs text-muted-light dark:text-muted-dark">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-button bg-fill-light py-3 text-center text-sm font-medium text-ink-light dark:bg-fill-dark dark:text-ink-dark"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 rounded-button bg-brand py-3 text-center text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
