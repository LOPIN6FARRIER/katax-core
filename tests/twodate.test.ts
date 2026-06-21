import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('TwoDatesSchema', () => {
  it('parses string with default separator into [Date, Date]', () => {
    const result = k.twoDates().safeParse('2024-01-15|2024-01-20')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toBeInstanceOf(Date)
      expect(result.data[1]).toBeInstanceOf(Date)
    }
  })

  it('rejects invalid input types', () => {
    expect(k.twoDates().safeParse(123).success).toBe(false)
    expect(k.twoDates().safeParse(null).success).toBe(false)
    expect(k.twoDates().safeParse(undefined).success).toBe(false)
    expect(k.twoDates().safeParse({}).success).toBe(false)
  })

  it('rejects string without exactly two dates', () => {
    expect(k.twoDates().safeParse('').success).toBe(false)
    expect(k.twoDates().safeParse('2024-01-15').success).toBe(false)
    expect(k.twoDates().safeParse('2024-01-15|2024-01-20|2024-01-25').success).toBe(false)
  })

  it('maxDifference validates day range', () => {
    const schema = k.twoDates().maxDifference(7)
    expect(schema.safeParse('2024-01-15|2024-01-20').success).toBe(true)
    expect(schema.safeParse('2024-01-15|2024-01-22').success).toBe(true)
    expect(schema.safeParse('2024-01-15|2024-01-30').success).toBe(false)
  })

  it('minDifference validates day range', () => {
    const schema = k.twoDates().minDifference(7)
    expect(schema.safeParse('2024-01-15|2024-01-30').success).toBe(true)
    expect(schema.safeParse('2024-01-15|2024-01-22').success).toBe(true)
    expect(schema.safeParse('2024-01-15|2024-01-18').success).toBe(false)
  })

  it('maxDifferenceHours validates hour range', () => {
    const schema = k.twoDates().maxDifferenceHours(24)
    expect(schema.safeParse('2024-01-15T10:00:00Z|2024-01-15T20:00:00Z').success).toBe(true)
    expect(schema.safeParse('2024-01-15T10:00:00Z|2024-01-16T10:00:00Z').success).toBe(true)
    expect(schema.safeParse('2024-01-15T10:00:00Z|2024-01-17T10:00:00Z').success).toBe(false)
  })

  it('minDifferenceHours validates hour range', () => {
    const schema = k.twoDates().minDifferenceHours(12)
    expect(schema.safeParse('2024-01-15T10:00:00Z|2024-01-16T10:00:00Z').success).toBe(true)
    expect(schema.safeParse('2024-01-15T10:00:00Z|2024-01-15T22:00:00Z').success).toBe(true)
    expect(schema.safeParse('2024-01-15T10:00:00Z|2024-01-15T15:00:00Z').success).toBe(false)
  })

  it('order ascending/descending', () => {
    const asc = k.twoDates().order(true)
    expect(asc.safeParse('2024-01-15|2024-01-20').success).toBe(true)
    expect(asc.safeParse('2024-01-15|2024-01-15').success).toBe(true)
    expect(asc.safeParse('2024-01-20|2024-01-15').success).toBe(false)

    const desc = k.twoDates().order(false)
    expect(desc.safeParse('2024-01-20|2024-01-15').success).toBe(true)
    expect(desc.safeParse('2024-01-15|2024-01-15').success).toBe(true)
    expect(desc.safeParse('2024-01-15|2024-01-20').success).toBe(false)
  })
})
