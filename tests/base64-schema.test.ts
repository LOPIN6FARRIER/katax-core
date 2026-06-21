import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('Base64Schema', () => {
  it('accepts valid base64 strings', () => {
    const s = k.base64()
    expect(s.safeParse('SGVsbG8=').success).toBe(true)
    expect(s.safeParse('').success).toBe(false)
  })

  it('rejects invalid base64', () => {
    const s = k.base64()
    expect(s.safeParse('invalid!!!').success).toBe(false)
    expect(s.safeParse('SGVsbG8@').success).toBe(false)
    expect(s.safeParse('SGVsbG8===').success).toBe(false)
  })

  it('validates data URL format', () => {
    const s = k.base64().dataUrl()
    expect(s.safeParse('data:image/png;base64,SGVsbG8=').success).toBe(true)
    expect(s.safeParse('SGVsbG8=').success).toBe(false)
  })

  it('validates image MIME type with data URL', () => {
    const s = k.base64().image().dataUrl()
    expect(s.safeParse('data:image/png;base64,SGVsbG8=').success).toBe(true)
    expect(s.safeParse('data:image/jpeg;base64,SGVsbG8=').success).toBe(true)
    expect(s.safeParse('data:text/plain;base64,SGVsbG8=').success).toBe(false)
  })

  it('enforces minDecodedSize constraint', () => {
    const s = k.base64().minDecodedSize(5)
    expect(s.safeParse('SGVsbG8gV29ybGQ=').success).toBe(true)
    expect(s.safeParse('SGk=').success).toBe(false)
  })

  it('accepts base64 without size constraint', () => {
    const s = k.base64()
    expect(s.safeParse('U29vbSByYWluIGluIFNwYWlu').success).toBe(true)
  })
})
