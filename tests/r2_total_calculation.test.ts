import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

describe('R2: Order totals calculated in database', () => {
  let orderId: string
  let branchId: string
  let menuItemId: string
  let itemPrice: number

  beforeAll(async () => {
    const { data: branch } = await supabase.from('branches').select('*').limit(1).single()
    branchId = branch.id

    const { data: menuItem } = await supabase.from('menu_items').select('*').limit(1).single()
    menuItemId = menuItem.id
    itemPrice = menuItem.price

    const { data, error } = await supabase.rpc('create_order', {
      p_customer_name: 'R2 Test',
      p_phone: '070000000',
      p_order_type: 'delivery',
      p_address: 'Test St',
      p_branch_id: branchId,
      p_items: [{ menu_item_id: menuItemId, quantity: 2 }],
    })
    if (error) throw error
    orderId = data
  })

  it('should calculate subtotal correctly', async () => {
    const { data: order } = await supabase.rpc('get_order', { p_order_id: orderId })
    const expectedSubtotal = itemPrice * 2
    expect(order[0].subtotal).toBe(expectedSubtotal)
    expect(order[0].total).toBe(expectedSubtotal + order[0].delivery_fee)
  })

  afterAll(async () => {
    await supabase.from('orders').delete().eq('id', orderId)
  })
})
