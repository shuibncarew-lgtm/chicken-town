import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Branch } from '../types'

interface Settings {
  call_number: string
  whatsapp_number: string
  orange_money_number: string
  afrimoney_number: string
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, clearCart } = useCart()
  const { user } = useAuth()
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [branchId, setBranchId] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money'>('cash')
  const [paymentReference, setPaymentReference] = useState('')
  const [branches, setBranches] = useState<Branch[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [branchesRes, settingsRes] = await Promise.all([
          supabase.from('branches').select('*').eq('is_active', true),
          supabase.from('settings').select('*').single(),
        ])
        if (branchesRes.error) throw branchesRes.error
        if (settingsRes.error) throw settingsRes.error
        setBranches(branchesRes.data || [])
        if (branchesRes.data && branchesRes.data.length > 0) setBranchId(branchesRes.data[0].id)
        setSettings(settingsRes.data)
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load data. Please check your connection.')
      }
    }
    loadData()
  }, [])

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const branch = branches.find(b => b.id === branchId)
  const deliveryFee = orderType === 'delivery' ? (branch?.delivery_fee || 0) : 0
  const total = subtotal + deliveryFee

  const mobileMoneyNumbersSet = settings?.orange_money_number || settings?.afrimoney_number

  const handlePlaceOrder = async () => {
    if (!name || !phone || !branchId) return
    if (orderType === 'delivery' && !address) return
    if (paymentMethod === 'mobile_money' && !paymentReference) return

    setLoading(true)
    setError(null)
    try {
      const orderItems = items.map(i => ({
        menu_item_id: i.menu_item_id,
        quantity: i.quantity,
        option_id: i.option_id || null,
      }))

      const { data, error } = await supabase.rpc('create_order', {
        p_customer_name: name,
        p_phone: phone,
        p_order_type: orderType,
        p_address: orderType === 'delivery' ? address : '',
        p_branch_id: branchId,
        p_items: orderItems,
        p_note: note,
        p_payment_method: paymentMethod,
        p_user_id: user?.id || null,
      })

      if (error) throw error

      if (paymentMethod === 'mobile_money' && paymentReference) {
        await supabase.from('orders').update({
          payment_status: 'pending_verification',
          payment_reference: paymentReference,
        }).eq('id', data)
      }

      clearCart()
      navigate(`/order/${data}`)
    } catch (err: any) {
      console.error('Order failed:', err)
      setError(err?.message || err?.details || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
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
        <p className="text-[15px] font-bold text-ink-light dark:text-ink-dark">Checkout</p>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-2.5 px-4">
        <div className="flex rounded-field bg-fill-light p-1 dark:bg-fill-dark">
          <button
            onClick={() => setOrderType('delivery')}
            className={`flex-1 rounded-[11px] py-2 text-center text-sm ${
              orderType === 'delivery'
                ? 'bg-card-light font-bold text-ink-light shadow-sm dark:bg-card-dark dark:text-ink-dark'
                : 'text-muted-light dark:text-muted-dark'
            }`}
          >
            Delivery
          </button>
          <button
            onClick={() => setOrderType('pickup')}
            className={`flex-1 rounded-[11px] py-2 text-center text-sm ${
              orderType === 'pickup'
                ? 'bg-card-light font-bold text-ink-light shadow-sm dark:bg-card-dark dark:text-ink-dark'
                : 'text-muted-light dark:text-muted-dark'
            }`}
          >
            Pickup
          </button>
        </div>

        <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
          <label className="text-xs text-muted-light dark:text-muted-dark">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
          />
        </div>

        <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
          <label className="text-xs text-muted-light dark:text-muted-dark">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="070123456"
            className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
          />
        </div>

        {orderType === 'delivery' && (
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
        )}

        <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
          <label className="text-xs text-muted-light dark:text-muted-dark">Nearest branch</label>
          <select
            value={branchId}
            onChange={e => setBranchId(e.target.value)}
            className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
          <label className="text-xs text-muted-light dark:text-muted-dark">Note</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Optional"
            className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
          />
        </div>

        {/* Payment method */}
        <div className="mt-2 flex flex-col gap-2">
          <button
            onClick={() => setPaymentMethod('cash')}
            className={`flex items-center justify-between rounded-field px-3 py-2.5 ${
              paymentMethod === 'cash'
                ? 'bg-card-light shadow-sm dark:bg-card-dark'
                : 'bg-fill-light dark:bg-fill-dark'
            }`}
          >
            <span className="text-sm text-ink-light dark:text-ink-dark">Pay on delivery/pickup</span>
            <div className={`h-4 w-4 rounded-full border-2 ${
              paymentMethod === 'cash' ? 'border-brand bg-brand' : 'border-line-light dark:border-line-dark'
            }`} />
          </button>

          <button
            onClick={() => setPaymentMethod('mobile_money')}
            className={`flex items-center justify-between rounded-field px-3 py-2.5 ${
              paymentMethod === 'mobile_money'
                ? 'bg-card-light shadow-sm dark:bg-card-dark'
                : 'bg-fill-light dark:bg-fill-dark'
            }`}
          >
            <span className="text-sm text-ink-light dark:text-ink-dark">Mobile money</span>
            <div className={`h-4 w-4 rounded-full border-2 ${
              paymentMethod === 'mobile_money' ? 'border-brand bg-brand' : 'border-line-light dark:border-line-dark'
            }`} />
          </button>
        </div>

        {paymentMethod === 'mobile_money' && (
          <div className="flex flex-col gap-2.5">
            {mobileMoneyNumbersSet ? (
              <>
                <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
                  <p className="text-xs text-muted-light dark:text-muted-dark">Send Le {total} to one of these numbers, then enter your transaction reference.</p>
                  {settings?.orange_money_number && (
                    <p className="mt-1 text-sm text-ink-light dark:text-ink-dark">Orange Money: {settings.orange_money_number}</p>
                  )}
                  {settings?.afrimoney_number && (
                    <p className="text-sm text-ink-light dark:text-ink-dark">Afrimoney: {settings.afrimoney_number}</p>
                  )}
                </div>
                <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
                  <label className="text-xs text-muted-light dark:text-muted-dark">Transaction reference</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={e => setPaymentReference(e.target.value)}
                    placeholder="Enter reference"
                    className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-light dark:text-muted-dark">
                Mobile money numbers not set yet. Please pay on delivery or call {settings?.call_number || '392'}.
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-brand">{error}</p>
        )}
      </div>

      <div className="mt-auto px-4 pb-6 pt-4">
        <button
          onClick={handlePlaceOrder}
          disabled={loading || items.length === 0 || (paymentMethod === 'mobile_money' && (!paymentReference || !mobileMoneyNumbersSet))}
          className="w-full rounded-button bg-brand py-3.5 text-center text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? 'Placing order...' : `Place order · Le ${total}`}
        </button>
      </div>
    </div>
  )
}
