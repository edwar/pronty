import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('should handle conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra')
    expect(result).toContain('base')
    expect(result).toContain('extra')
    expect(result).not.toContain('hidden')
  })

  it('should handle undefined and null', () => {
    const result = cn('base', undefined, null, 'extra')
    expect(result).toContain('base')
    expect(result).toContain('extra')
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should merge tailwind classes correctly', () => {
    const result = cn('px-4 py-2', 'px-8')
    expect(result).toBe('py-2 px-8')
  })
})
