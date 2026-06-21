import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('DateSchema', () => {
  it('accepts ISO 8601 string', () => {
    const schema = k.date()
    expect(schema.safeParse('2024-01-15').success).toBe(true)
    expect(schema.safeParse('2024-01-15T10:30:00Z').success).toBe(true)
  })

  it('accepts Date object', () => {
    const schema = k.date()
    expect(schema.safeParse(new Date('2024-01-15')).success).toBe(true)
  })

  it('rejects invalid date strings', () => {
    const schema = k.date()
    expect(schema.safeParse('not-a-date').success).toBe(false)
    expect(schema.safeParse('2024-13-01').success).toBe(false)
  })

  it('rejects invalid Date objects', () => {
    const schema = k.date()
    expect(schema.safeParse(new Date('invalid')).success).toBe(false)
  })

  it('rejects non-date, non-string input', () => {
    const schema = k.date()
    expect(schema.safeParse(123).success).toBe(false)
    expect(schema.safeParse(null).success).toBe(false)
    expect(schema.safeParse({}).success).toBe(false)
  })

  it('min()', () => {
    const schema = k.date().min('2024-06-01')
    expect(schema.safeParse('2024-06-15').success).toBe(true)
    expect(schema.safeParse('2024-05-31').success).toBe(false)
    expect(schema.safeParse('2024-06-01').success).toBe(true)
  })

  it('max()', () => {
    const schema = k.date().max('2024-06-30')
    expect(schema.safeParse('2024-06-15').success).toBe(true)
    expect(schema.safeParse('2024-07-01').success).toBe(false)
    expect(schema.safeParse('2024-06-30').success).toBe(true)
  })

  it('between()', () => {
    const schema = k.date().between('2024-01-01', '2024-12-31')
    expect(schema.safeParse('2024-06-15').success).toBe(true)
    expect(schema.safeParse('2023-12-31').success).toBe(false)
    expect(schema.safeParse('2025-01-01').success).toBe(false)
    expect(schema.safeParse('2024-01-01').success).toBe(true)
    expect(schema.safeParse('2024-12-31').success).toBe(true)
  })

  it('isFuture()', () => {
    const schema = k.date().isFuture()
    expect(schema.safeParse('2099-01-01').success).toBe(true)
    expect(schema.safeParse('2020-01-01').success).toBe(false)
  })

  it('isPast()', () => {
    const schema = k.date().isPast()
    expect(schema.safeParse('2020-01-01').success).toBe(true)
    expect(schema.safeParse('2099-01-01').success).toBe(false)
  })

  it('format() validates date format', () => {
    const schema = k.date().format('yyyy-MM-dd')
    expect(schema.safeParse('2024-01-15').success).toBe(true)
    expect(schema.safeParse('2024-01-15T10:00:00Z').success).toBe(false)
  })

  it('isDateOnly() rejects strings with time', () => {
    const schema = k.date().isDateOnly()
    expect(schema.safeParse('2024-01-15').success).toBe(true)
    expect(schema.safeParse('2024-01-15T10:00:00Z').success).toBe(false)
  })

  it('hasTime() requires time component', () => {
    const schema = k.date().hasTime()
    expect(schema.safeParse('2024-01-15T10:00:00Z').success).toBe(true)
    expect(schema.safeParse('2024-01-15').success).toBe(false)
  })

  it('formatOutput() transforms date to formatted string', () => {
    const schema = k.date().formatOutput('yyyy-MM-dd')
    const result = schema.safeParse('2024-01-15')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(typeof result.data).toBe('string')
      expect(result.data).toBe('2024-01-15')
    }
  })
})
