import { describe, it, expect } from 'vitest'
import { haversineDistance, calculateDeliveryFee, formatDistance } from '@/lib/distance'

describe('haversineDistance', () => {
  it('should return 0 for same coordinates', () => {
    const distance = haversineDistance(4.711, -74.072, 4.711, -74.072)
    expect(distance).toBe(0)
  })

  it('should calculate distance between Bogotá and Medellín', () => {
    // Bogotá: 4.711, -74.072
    // Medellín: 6.244, -75.581
    const distance = haversineDistance(4.711, -74.072, 6.244, -75.581)
    expect(distance).toBeGreaterThan(200)
    expect(distance).toBeLessThan(300)
  })

  it('should calculate distance between two close points', () => {
    // Two points ~1km apart
    const distance = haversineDistance(4.711, -74.072, 4.720, -74.072)
    expect(distance).toBeGreaterThan(0.9)
    expect(distance).toBeLessThan(1.1)
  })

  it('should handle negative coordinates', () => {
    const distance = haversineDistance(-33.8688, 151.2093, -37.8136, 144.9631)
    expect(distance).toBeGreaterThan(700)
    expect(distance).toBeLessThan(800)
  })
})

describe('calculateDeliveryFee', () => {
  it('should calculate fee with base only', () => {
    const fee = calculateDeliveryFee(0, 5000, 1500)
    expect(fee).toBe(5000)
  })

  it('should calculate fee with distance', () => {
    const fee = calculateDeliveryFee(5, 5000, 1500)
    expect(fee).toBe(12500) // 5000 + (5 * 1500)
  })

  it('should round the result', () => {
    const fee = calculateDeliveryFee(3.333, 5000, 1500)
    expect(fee).toBe(10000) // 5000 + (3.333 * 1500) = 9999.5 → 10000
  })

  it('should handle zero base fee', () => {
    const fee = calculateDeliveryFee(10, 0, 1500)
    expect(fee).toBe(15000)
  })

  it('should handle zero price per km', () => {
    const fee = calculateDeliveryFee(10, 5000, 0)
    expect(fee).toBe(5000)
  })
})

describe('formatDistance', () => {
  it('should format distance in meters when less than 1km', () => {
    expect(formatDistance(0.5)).toBe('500 m')
    expect(formatDistance(0.1)).toBe('100 m')
    expect(formatDistance(0.01)).toBe('10 m')
  })

  it('should format distance in km when 1km or more', () => {
    expect(formatDistance(1)).toBe('1.0 km')
    expect(formatDistance(5.5)).toBe('5.5 km')
    expect(formatDistance(12.345)).toBe('12.3 km')
  })

  it('should handle zero distance', () => {
    expect(formatDistance(0)).toBe('0 m')
  })
})
