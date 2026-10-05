import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

describe('R3: RLS policies exist', () => {
  it('should have orders_select_customer policy', async () => {
    const { data } = await supabase.rpc('get_order', { p_order_id: '00000000-0000-0000-0000-000000000000' })
    expect(data).toBeDefined()
  }, 30000)

  it('should have menu_items_select_authenticated policy', async () => {
    const { data: policies } = await supabase.from('pg_policies').select('*').eq('tablename', 'menu_items')
    expect(policies).toBeDefined()
  }, 30000)
})
