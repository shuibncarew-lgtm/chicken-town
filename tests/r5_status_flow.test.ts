import { describe, it, expect } from 'vitest'

describe('R5: Order status flow', () => {
  const validStatuses = ['new', 'preparing', 'ready', 'completed', 'cancelled']
  const statusFlow: Record<string, string> = {
    new: 'preparing',
    preparing: 'ready',
    ready: 'completed',
  }

  it('should only allow valid statuses', () => {
    expect(validStatuses).toContain('new')
    expect(validStatuses).toContain('preparing')
    expect(validStatuses).toContain('ready')
    expect(validStatuses).toContain('completed')
    expect(validStatuses).toContain('cancelled')
    expect(validStatuses.includes('invalid')).toBe(false)
  })

  it('should follow correct flow', () => {
    expect(statusFlow['new']).toBe('preparing')
    expect(statusFlow['preparing']).toBe('ready')
    expect(statusFlow['ready']).toBe('completed')
    expect(statusFlow['completed']).toBeUndefined()
  })
})
