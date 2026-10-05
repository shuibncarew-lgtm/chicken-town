import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

describe('R1: Prices are saved at order time', () => {
  let orderId: string
  let menuItemId: string
  let branchId: string
  let originalPrice: number

  beforeAll(async () => {
    const { data: menuItem } = await supabase.from('menu_items').select('*').limit(1).single()
    menuItemId = menuItem.id
    originalPrice = menuItem.price

    const { data: branch } = await supabase.from('branches').select('*').limit(1).single()
    branchId = branch.id

    const { data, error } = await supabase.rpc('create_order', {
      p_customer_name: 'R1 Test',
      p_phone: '070000000',
      p_order_type: 'delivery',
      p_address: 'Test St',
      p_branch_id: branchId,
      p_items: [{ menu_item_id: menuItemId, quantity: 1 }],
    })
    if (error) throw error
    orderId = data
  })

  it('should store the original price in order_items', async () => {
    const { data: order } = await supabase.rpc('get_order', { p_order_id: orderId })
    const { data: items } = await supabase.rpc('get_order_items', { p_order_id: orderId })
    expect(items[0].unit_price).toBe(originalPrice)
  })

  it('should NOT change old order when menu price changes', async () => {
    const newPrice = originalPrice + 100
    await supabase.from('menu_items').update({ price: newPrice }).eq('id', menuItemId)

    const { data: items } = await supabase.rpc('get_order_items', { p_order_id: orderId })
    expect(items[0].unit_price).toBe(originalPrice)

    await supabase.from('menu_items').update({ price: originalPrice }).eq('id', menuItemId)
  })

  afterAll(async () => {
    await supabase.from('orders').delete().eq('id', orderId)
  })
})
