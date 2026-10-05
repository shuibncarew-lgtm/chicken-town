import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface SavedAddress {
  id: string
  label: string
  address: string
}

export default function SavedAddresses() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadAddresses()
  }, [])

  async function loadAddresses() {
    if (!user) return
    const { data } = await supabase
      .from('saved_addresses')
      .select('*')
      .eq('user_id', user.id)
    setAddresses(data || [])
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!label || !address || !user) return
    setSaving(true)
    const { error } = await supabase
      .from('saved_addresses')
      .insert({ user_id: user.id, label, address })
    if (!error) {
      setLabel('')
      setAddress('')
      setShowForm(false)
      loadAddresses()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('saved_addresses').delete().eq('id', id)
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-light dark:bg-page-dark">
        <p className="text-muted-light dark:text-muted-dark">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-light pb-28 dark:bg-page-dark">
      <div className="flex items-center justify-between px-4 pt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-fill-light text-ink-light dark:bg-fill-dark dark:text-ink-dark"
          >
            <ChevronLeft size={20} strokeWidth={1.7} />
          </button>
          <p className="text-[15px] font-bold text-ink-light dark:text-ink-dark">Saved addresses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white"
        >
          <Plus size={20} strokeWidth={2.2} />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2 px-4">
        {addresses.length === 0 && !showForm && (
          <p className="py-8 text-center text-sm text-muted-light dark:text-muted-dark">
            No saved addresses yet.
          </p>
        )}
        {addresses.map(addr => (
          <div key={addr.id} className="flex items-center gap-3 rounded-card bg-fill-light p-3 dark:bg-fill-dark">
            <div className="flex-1">
              <p className="text-sm font-bold text-ink-light dark:text-ink-dark">{addr.label}</p>
              <p className="text-xs text-muted-light dark:text-muted-dark">{addr.address}</p>
            </div>
            <button
              onClick={() => handleDelete(addr.id)}
              className="text-muted-light dark:text-muted-dark"
            >
              <Trash2 size={18} strokeWidth={1.7} />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-[28px] bg-card-light p-5 dark:bg-card-dark">
            <h2 className="text-lg font-bold text-ink-light dark:text-ink-dark">Add address</h2>
            <div className="mt-4 flex flex-col gap-2.5">
              <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
                <label className="text-xs text-muted-light dark:text-muted-dark">Label</label>
                <input
                  type="text"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="Home, Work, etc."
                  className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
                />
              </div>
              <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
                <label className="text-xs text-muted-light dark:text-muted-dark">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street, landmark"
                  className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-button bg-fill-light py-3 text-center text-sm font-medium text-ink-light dark:bg-fill-dark dark:text-ink-dark"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !label || !address}
                className="flex-1 rounded-button bg-brand py-3 text-center text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
