import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

describe('async validation', () => {
  it('basic async validation with asyncRefine passes', async () => {
    const schema = k.string().asyncRefine(async (val) => {
      if (val === 'blocked') return [{ path: [], message: 'blocked' }]
      return []
    })
    const result = await schema.safeParseAsync('hello')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toBe('hello')
  })

  it('basic async validation with asyncRefine fails', async () => {
    const schema = k.string().asyncRefine(async (val) => {
      if (val === 'blocked') return [{ path: [], message: 'blocked' }]
      return []
    })
    const result = await schema.safeParseAsync('blocked')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.issues[0].message).toBe('blocked')
  })

  it('parseAsync returns data on success', async () => {
    const schema = k.string().asyncRefine(async () => [])
    const data = await schema.parseAsync('ok')
    expect(data).toBe('ok')
  })

  it('parseAsync throws on failure', async () => {
    const schema = k.string().asyncRefine(async (val) => {
      if (val === 'bad') return [{ path: [], message: 'invalid' }]
      return []
    })
    await expect(schema.parseAsync('bad')).rejects.toThrow()
  })

  it('isValidAsync returns valid=true when passes', async () => {
    const schema = k.string().asyncRefine(async () => [])
    const result = await schema.isValidAsync('ok')
    expect(result.valid).toBe(true)
  })

  it('isValidAsync returns valid=false when fails', async () => {
    const schema = k.string().asyncRefine(async (val) => {
      if (val === 'bad') return [{ path: [], message: 'invalid' }]
      return []
    })
    const result = await schema.isValidAsync('bad')
    expect(result.valid).toBe(false)
  })

  it('object with async nested validation', async () => {
    const schema = k.object({
      email: k.string().asyncRefine(async (val) => {
        if (val === 'taken@example.com') return [{ path: [], message: 'Email taken' }]
        return []
      })
    })
    const valid = await schema.safeParseAsync({ email: 'new@example.com' })
    expect(valid.success).toBe(true)

    const invalid = await schema.safeParseAsync({ email: 'taken@example.com' })
    expect(invalid.success).toBe(false)
  })

  it('sync error returns immediately before async validation runs', async () => {
    let asyncRan = false
    const schema = k.string().minLength(10).asyncRefine(async () => {
      asyncRan = true
      return []
    })
    const result = await schema.safeParseAsync('short')
    expect(result.success).toBe(false)
    expect(asyncRan).toBe(false)
  })
})
