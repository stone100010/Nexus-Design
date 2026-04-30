import { describe, expect, it, vi } from 'vitest'

import {
  checkPasswordStrength,
  cn,
  debounce,
  deepMerge,
  formatDate,
  formatFileSize,
  formatRelativeTime,
  formatTime,
  generateId,
  isClient,
  isValidEmail,
  sleep,
  throttle,
} from '../utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('deduplicates Tailwind classes', () => {
    expect(cn('px-2 px-4')).toBe('px-4')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'end')).toBe('base end')
  })
})

describe('formatDate', () => {
  it('formats a date to Chinese locale', () => {
    const date = new Date('2025-01-15T10:30:00')
    const result = formatDate(date)
    expect(result).toContain('2025')
    expect(result).toContain('01')
    expect(result).toContain('15')
  })

  it('handles string input', () => {
    const result = formatDate('2025-06-20')
    expect(result).toContain('2025')
  })
})

describe('formatTime', () => {
  it('formats time to Chinese locale', () => {
    const date = new Date('2025-01-15T14:30:00')
    const result = formatTime(date)
    expect(result).toContain('30')
  })
})

describe('formatRelativeTime', () => {
  it('returns 刚刚 for recent time', () => {
    const now = new Date()
    expect(formatRelativeTime(now)).toBe('刚刚')
  })

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(fiveMinAgo)).toBe('5分钟前')
  })

  it('returns hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoHoursAgo)).toBe('2小时前')
  })

  it('returns days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(threeDaysAgo)).toBe('3天前')
  })
})

describe('formatFileSize', () => {
  it('formats 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB')
  })

  it('formats gigabytes', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
  })
})

describe('generateId', () => {
  it('generates id with default prefix', () => {
    const id = generateId()
    expect(id).toMatch(/^id_/)
  })

  it('generates id with custom prefix', () => {
    const id = generateId('element')
    expect(id).toMatch(/^element_/)
  })

  it('generates unique ids', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })
})

describe('debounce', () => {
  it('delays function execution', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })

  it('resets timer on subsequent calls', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })
})

describe('throttle', () => {
  it('calls function immediately on first call', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    expect(fn).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })

  it('throttles subsequent calls', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    throttled()
    throttled()
    expect(fn).toHaveBeenCalledOnce()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)

    vi.useRealTimers()
  })
})

describe('deepMerge', () => {
  it('merges flat objects', () => {
    const target: Record<string, unknown> = { a: 1, b: 2 }
    const source: Record<string, unknown> = { b: 3, c: 4 }
    expect(deepMerge(target, source)).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('merges nested objects', () => {
    const target: Record<string, unknown> = { a: { x: 1, y: 2 }, b: 1 }
    const source: Record<string, unknown> = { a: { y: 3, z: 4 } }
    expect(deepMerge(target, source)).toEqual({ a: { x: 1, y: 3, z: 4 }, b: 1 })
  })

  it('does not mutate target', () => {
    const target: Record<string, unknown> = { a: 1 }
    const source: Record<string, unknown> = { b: 2 }
    deepMerge(target, source)
    expect(target).toEqual({ a: 1 })
  })
})

describe('isValidEmail', () => {
  it('validates correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.co')).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('missing@')).toBe(false)
    expect(isValidEmail('@no-local.com')).toBe(false)
    expect(isValidEmail('spaces in@email.com')).toBe(false)
  })
})

describe('checkPasswordStrength', () => {
  it('gives score 4 for strong password', () => {
    const result = checkPasswordStrength('MyP@ss123')
    expect(result.score).toBe(4)
    expect(result.feedback).toHaveLength(0)
  })

  it('gives feedback for weak password', () => {
    const result = checkPasswordStrength('abc')
    expect(result.score).toBeLessThan(4)
    expect(result.feedback.length).toBeGreaterThan(0)
  })

  it('requires at least 8 characters', () => {
    const result = checkPasswordStrength('Ab1!')
    expect(result.feedback).toContain('至少8个字符')
  })

  it('requires mixed case', () => {
    const result = checkPasswordStrength('alllower123!')
    expect(result.feedback).toContain('包含大小写字母')
  })

  it('requires digits', () => {
    const result = checkPasswordStrength('NoDigitsHere!')
    expect(result.feedback).toContain('包含数字')
  })

  it('requires special characters', () => {
    const result = checkPasswordStrength('NoSpecial123')
    expect(result.feedback).toContain('包含特殊字符')
  })
})

describe('sleep', () => {
  it('resolves after specified time', async () => {
    const start = Date.now()
    await sleep(50)
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(40)
  })
})

describe('isClient', () => {
  it('returns true in jsdom environment', () => {
    expect(isClient()).toBe(true)
  })
})
