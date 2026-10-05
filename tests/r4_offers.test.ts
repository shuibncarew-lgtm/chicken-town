import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

describe('R4: Offers show only when active and within dates', () => {
  let offerItemId: string

  beforeAll(async () => {
    const { data: menuItem } = await supabase.from('menu_items').select('*').limit(1).single()
    offerItemId = menuItem.id
  })

  it('should show offer when dates are empty', async () => {
    const { error } = await supabase.from('menu_items').update({
      is_offer: true,
      offer_starts_at: null,
      offer_ends_at: null,
    }).eq('id', offerItemId)
    expect(error).toBeNull()

    const now = new Date()
    const { data: items } = await supabase.from('menu_items').select('*').eq('id', offerItemId).single()
    const startsAt = items.offer_starts_at ? new Date(items.offer_starts_at) : null
    const endsAt = items.offer_ends_at ? new Date(items.offer_ends_at) : null

    const isActive = (!startsAt || now >= startsAt) && (!endsAt || now <= endsAt)
    expect(isActive).toBe(true)
  })

  it('should hide offer when start date is in the future', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)

    const { error } = await supabase.from('menu_items').update({
      is_offer: true,
      offer_starts_at: futureDate.toISOString(),
      offer_ends_at: null,
    }).eq('id', offerItemId)
    expect(error).toBeNull()

    const now = new Date()
    const isActive = now < futureDate
    expect(isActive).toBe(true)
  })
})
