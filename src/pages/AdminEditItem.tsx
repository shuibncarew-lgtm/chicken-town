import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Image } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Category } from '../types'

export default function AdminEditItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isOffer, setIsOffer] = useState(false)
  const [offerStartsAt, setOfferStartsAt] = useState('')
  const [offerEndsAt, setOfferEndsAt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [catsRes, itemRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        isNew ? { data: null } : supabase.from('menu_items').select('*').eq('id', id).single(),
      ])
      setCategories(catsRes.data || [])
      if (catsRes.data && catsRes.data.length > 0) setCategoryId(catsRes.data[0].id)

      if (itemRes.data) {
        const item = itemRes.data
        setName(item.name)
        setDescription(item.description)
        setPrice(item.price.toString())
        setOriginalPrice(item.original_price?.toString() || '')
        setCategoryId(item.category_id)
        setIsOffer(item.is_offer)
        setOfferStartsAt(item.offer_starts_at?.split('T')[0] || '')
        setOfferEndsAt(item.offer_ends_at?.split('T')[0] || '')
        setImageUrl(item.image_url)
      }
      setLoading(false)
    }
    loadData()
  }, [id, isNew])

  const handleSave = async () => {
    if (!name || !price || !categoryId) return

    setSaving(true)
    try {
      const data = {
        name,
        description,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        category_id: categoryId,
        is_offer: isOffer,
        offer_starts_at: isOffer && offerStartsAt ? new Date(offerStartsAt).toISOString() : null,
        offer_ends_at: isOffer && offerEndsAt ? new Date(offerEndsAt).toISOString() : null,
        image_url: imageUrl,
      }

      if (isNew) {
        await supabase.from('menu_items').insert(data)
      } else {
        await supabase.from('menu_items').update(data).eq('id', id)
      }

      navigate('/admin/menu')
    } catch (err) {
      console.error('Save failed:', err)
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const compressImage = (file: File): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const img = new window.Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img

          if (width > 1200) {
            height = (height * 1200) / width
            width = 1200
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) { reject(new Error('Canvas not supported')); return }
          ctx.drawImage(img, 0, 0, width, height)
          URL.revokeObjectURL(url)
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Compression failed'))
            },
            'image/webp',
            0.85
          )
        }
        img.onerror = reject
        img.src = url
      })
    }

    try {
      const blob = await compressImage(file)
      const fileName = `${Date.now()}.webp`

      const { error } = await supabase.storage
        .from('menu-images')
        .upload(fileName, blob)

      if (error) {
        alert('Failed to upload image. Please try again.')
        return
      }

      const { data: urlData } = supabase.storage
        .from('menu-images')
        .getPublicUrl(fileName)

      setImageUrl(urlData.publicUrl)
    } catch (err) {
      alert('Failed to process image. Please try another one.')
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
        <p className="text-[15px] font-bold text-ink-light dark:text-ink-dark">Edit item</p>
      </div>

      <div className="mt-4 flex flex-col gap-2.5 px-4">
        {/* Upload photo */}
        <label className="flex h-[84px] cursor-pointer items-center justify-center gap-2 rounded-card bg-fill-light text-muted-light dark:bg-fill-dark dark:text-muted-dark">
          <Image size={20} strokeWidth={1.7} />
          <span className="text-sm">Upload photo</span>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>

        {/* Name */}
        <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
          <label className="text-xs text-muted-light dark:text-muted-dark">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Item name"
            className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
          />
        </div>

        {/* Price + Old price */}
        <div className="flex gap-2">
          <div className="flex-1 rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
            <label className="text-xs text-muted-light dark:text-muted-dark">Price (Le)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
            />
          </div>
          <div className="flex-1 rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
            <label className="text-xs text-muted-light dark:text-muted-dark">Old price</label>
            <input
              type="number"
              value={originalPrice}
              onChange={e => setOriginalPrice(e.target.value)}
              placeholder="Optional"
              className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
            />
          </div>
        </div>

        {/* Category */}
        <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
          <label className="text-xs text-muted-light dark:text-muted-dark">Category</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Offer toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-light dark:text-ink-dark">Run as an offer</span>
          <button
            onClick={() => setIsOffer(!isOffer)}
            className={`relative h-5 w-[34px] rounded-full transition-colors ${
              isOffer ? 'bg-brand' : 'bg-line-light dark:bg-line-dark'
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                isOffer ? 'left-[16px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Offer dates */}
        {isOffer && (
          <div className="flex gap-2">
            <div className="flex-1 rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
              <label className="text-xs text-muted-light dark:text-muted-dark">Starts</label>
              <input
                type="date"
                value={offerStartsAt}
                onChange={e => setOfferStartsAt(e.target.value)}
                className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
              />
            </div>
            <div className="flex-1 rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
              <label className="text-xs text-muted-light dark:text-muted-dark">Ends</label>
              <input
                type="date"
                value={offerEndsAt}
                onChange={e => setOfferEndsAt(e.target.value)}
                className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto px-4 pb-6 pt-4">
        <button
          onClick={handleSave}
          disabled={saving || !name || !price}
          className="w-full rounded-button bg-brand py-3.5 text-center text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
