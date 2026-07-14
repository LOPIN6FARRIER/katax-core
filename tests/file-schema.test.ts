import { describe, it, expect } from 'vitest'
import { k } from '../src/k'

function makeMulterFile(overrides: Partial<{ originalname: string; mimetype: string; size: number; buffer: Buffer }> = {}) {
  return {
    fieldname: 'file',
    originalname: overrides.originalname ?? 'test.txt',
    encoding: '7bit',
    mimetype: overrides.mimetype ?? 'text/plain',
    size: overrides.size ?? 100,
    buffer: overrides.buffer ?? Buffer.from('test content'),
    destination: '/tmp',
    filename: 'test.txt',
    path: '/tmp/test.txt',
  }
}

describe('FileSchema', () => {
  it('accepts valid multer file object', () => {
    const s = k.file()
    const result = s.safeParse(makeMulterFile())
    expect(result.success).toBe(true)
  })

  it('rejects non-file inputs', () => {
    const s = k.file()
    expect(s.safeParse(null).success).toBe(false)
    expect(s.safeParse(undefined).success).toBe(false)
    expect(s.safeParse('string').success).toBe(false)
    expect(s.safeParse(123).success).toBe(false)
  })

  it('validates mimetype', () => {
    const s = k.file().type('image/png')
    expect(s.safeParse(makeMulterFile({ mimetype: 'image/png' })).success).toBe(true)
    expect(s.safeParse(makeMulterFile({ mimetype: 'text/plain' })).success).toBe(false)
  })

  it('validates maxSize', () => {
    const s = k.file().maxSize(200)
    expect(s.safeParse(makeMulterFile({ size: 100 })).success).toBe(true)
    expect(s.safeParse(makeMulterFile({ size: 300 })).success).toBe(false)
  })

  it('validates file extension', () => {
    const s = k.file().extension('.jpg')
    expect(s.safeParse(makeMulterFile({ originalname: 'photo.jpg' })).success).toBe(true)
    expect(s.safeParse(makeMulterFile({ originalname: 'photo.png' })).success).toBe(false)
  })

  it('validates multiple extensions', () => {
    const s = k.file().extensions(['.jpg', '.png'])
    expect(s.safeParse(makeMulterFile({ originalname: 'photo.jpg' })).success).toBe(true)
    expect(s.safeParse(makeMulterFile({ originalname: 'photo.png' })).success).toBe(true)
    expect(s.safeParse(makeMulterFile({ originalname: 'photo.gif' })).success).toBe(false)
  })

  it('toJsonSchema() returns empty object', () => {
    const result = k.file().toJsonSchema()
    expect(result).toEqual({})
  })

  it('toJsonSchema() with describe() includes description', () => {
    const result = k.file().describe('upload').toJsonSchema()
    expect(result).toEqual({ description: 'upload' })
  })
})
