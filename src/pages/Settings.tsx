import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const navigate = useNavigate()
  const [callNumber, setCallNumber] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [orangeMoneyNumber, setOrangeMoneyNumber] = useState('')
  const [afrimoneyNumber, setAfrimoneyNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      setLoading(true)
      const { data } = await supabase.from('settings').select('*').single()
      if (data) {
        setCallNumber(data.call_number)
        setWhatsappNumber(data.whatsapp_number)
        setOrangeMoneyNumber(data.orange_money_number)
        setAfrimoneyNumber(data.afrimoney_number)
      }
      setLoading(false)
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase.from('settings').update({
        call_number: callNumber,
        whatsapp_number: whatsappNumber,
        orange_money_number: orangeMoneyNumber,
        afrimoney_number: afrimoneyNumber,
      }).eq('id', 1)
      navigate(-1)
    } catch (err) {
      console.error('Save failed:', err)
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-light dark:bg-page-dark">
        <p className="text-muted-light dark:text-muted-dark">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-page-light dark:bg-page-dark">
      <div className="flex items-center gap-3 px-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-fill-light text-ink-light dark:bg-fill-dark dark:text-ink-dark"
        >
          <ChevronLeft size={20} strokeWidth={1.7} />
        </button>
        <p className="text-[15px] font-bold text-ink-light dark:text-ink-dark">Settings</p>
      </div>

      <div className="mt-4 flex flex-col gap-2.5 px-4">
        <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
          <label className="text-xs text-muted-light dark:text-muted-dark">Call number</label>
          <input
            type="text"
            value={callNumber}
            onChange={e => setCallNumber(e.target.value)}
            placeholder="392"
            className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
          />
        </div>

        <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
          <label className="text-xs text-muted-light dark:text-muted-dark">WhatsApp number</label>
          <input
            type="text"
            value={whatsappNumber}
            onChange={e => setWhatsappNumber(e.target.value)}
            placeholder="+232 80 600 700"
            className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
          />
        </div>

        <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
          <label className="text-xs text-muted-light dark:text-muted-dark">Orange Money number</label>
          <input
            type="text"
            value={orangeMoneyNumber}
            onChange={e => setOrangeMoneyNumber(e.target.value)}
            placeholder="e.g. 070123456"
            className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
          />
        </div>

        <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
          <label className="text-xs text-muted-light dark:text-muted-dark">Afrimoney number</label>
          <input
            type="text"
            value={afrimoneyNumber}
            onChange={e => setAfrimoneyNumber(e.target.value)}
            placeholder="e.g. 070123456"
            className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
          />
        </div>
      </div>

      <div className="mt-auto px-4 pb-6 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-button bg-brand py-3.5 text-center text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
