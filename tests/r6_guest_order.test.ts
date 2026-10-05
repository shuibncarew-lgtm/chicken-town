import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

describe('R6: Guest order works with nullable user_id', () => {
  let orderId: string
  let branchId: string
  let menuItemId: string

  beforeAll(async () => {
    const { data: branch } = await supabase.from('branches').select('*').limit(1).single()
    branchId = branch.id

    const { data: menuItem } = await supabase.from('menu_items').select('*').limit(1).single()
    menuItemId = menuItem.id
  })

  it('should create order without user_id', async () => {
    const { data, error } = await supabase.rpc('create_order', {
      p_customer_name: 'Guest User',
      p_phone: '070000000',
      p_order_type: 'delivery',
      p_address: 'Guest St',
      p_branch_id: branchId,
      p_items: [{ menu_item_id: menuItemId, quantity: 1 }],
      p_user_id: null,
    })
    expect(error).toBeNull()
    orderId = data
  })

  it('should read order via get_order function', async () => {
    const { data, error } = await supabase.rpc('get_order', { p_order_id: orderId })
    expect(error).toBeNull()
    expect(data[0].order_number).toBeDefined()
    expect(data[0].customer_name).toBe('Guest User')
  }, 30000)

  afterAll(async () => {
    await supabase.from('orders').delete().eq('id', orderId)
  })
})
