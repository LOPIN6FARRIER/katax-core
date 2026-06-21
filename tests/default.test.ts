import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('default values', () => {
  it('uses default for undefined string', () => {
    const s = k.string().default('hello')
    const r = s.safeParse(undefined)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('hello')
  })

  it('passes through provided value', () => {
    const s = k.string().default('hello')
    const r = s.safeParse('world')
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('world')
  })

  it('uses default for undefined number', () => {
    const s = k.number().default(42)
    const r = s.safeParse(undefined)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe(42)
  })
})

describe('default with validation', () => {
  it('respects validations after providing value', () => {
    const s = k.number().min(0).max(120).default(18)
    expect(s.safeParse(25).success).toBe(true)
    expect(s.safeParse(150).success).toBe(false)
  })

  it('uses default when undefined with validations', () => {
    const s = k.number().min(0).max(120).default(18)
    const r = s.safeParse(undefined)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe(18)
  })
})

describe('default in objects', () => {
  it('applies defaults to missing fields', () => {
    const s = k.object({
      name: k.string(),
      age: k.number().default(18),
      country: k.string().default('Unknown'),
    })
    const r = s.safeParse({ name: 'Ana' })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.name).toBe('Ana')
      expect(r.data.age).toBe(18)
      expect(r.data.country).toBe('Unknown')
    }
  })

  it('uses provided values when present', () => {
    const s = k.object({
      name: k.string(),
      age: k.number().default(18),
    })
    const r = s.safeParse({ name: 'Bob', age: 30 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.age).toBe(30)
  })
})

describe('default with optional', () => {
  it('uses default even when optional and undefined', () => {
    const s = k.string().optional().default('fallback')
    const r = s.safeParse(undefined)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('fallback')
  })

  it('passes through provided value', () => {
    const s = k.string().optional().default('fallback')
    const r = s.safeParse('hello')
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe('hello')
  })
})

describe('chaining: default after validations', () => {
  it('applies default only to undefined, not to invalid values', () => {
    const s = k.number().integer().min(1).max(65535).default(3000)
    expect(s.safeParse(undefined).success).toBe(true)
    expect(s.safeParse(70000).success).toBe(false)
    expect(s.safeParse(8080).success).toBe(true)
  })
})
