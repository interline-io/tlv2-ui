import { describe, it, expect } from 'vitest'
import { formatDate, parseDate, isSameDay } from './datepicker-utils'

describe('datepicker-utils', () => {
  describe('formatDate', () => {
    it('formats a date as YYYY-MM-DD', () => {
      expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05')
      expect(formatDate(new Date(2024, 11, 31))).toBe('2024-12-31')
    })

    it('zero-pads single-digit months and days', () => {
      expect(formatDate(new Date(2026, 1, 3))).toBe('2026-02-03')
    })
  })

  describe('parseDate', () => {
    it('returns null for empty string', () => {
      expect(parseDate('')).toBeNull()
    })

    it('parses YYYY-MM-DD as local date', () => {
      const date = parseDate('2026-02-27')!
      expect(date).not.toBeNull()
      expect(date.getFullYear()).toBe(2026)
      expect(date.getMonth()).toBe(1) // February
      expect(date.getDate()).toBe(27)
    })

    it('avoids UTC timezone shift for YYYY-MM-DD strings', () => {
      // new Date('2026-01-01') parses as UTC midnight, which shifts
      // to the previous day in negative UTC offsets. parseDate should not.
      const date = parseDate('2026-01-01')!
      expect(date.getFullYear()).toBe(2026)
      expect(date.getMonth()).toBe(0)
      expect(date.getDate()).toBe(1)
    })

    it('falls back to Date constructor for other formats', () => {
      const date = parseDate('February 27, 2026')!
      expect(date).not.toBeNull()
      expect(date.getFullYear()).toBe(2026)
      expect(date.getMonth()).toBe(1)
      expect(date.getDate()).toBe(27)
    })

    it('returns null for invalid date strings', () => {
      expect(parseDate('not-a-date')).toBeNull()
    })
  })

  describe('isSameDay', () => {
    it('returns true for same calendar day', () => {
      const a = new Date(2026, 1, 27, 10, 30)
      const b = new Date(2026, 1, 27, 23, 59)
      expect(isSameDay(a, b)).toBe(true)
    })

    it('returns false for different days', () => {
      const a = new Date(2026, 1, 27)
      const b = new Date(2026, 1, 28)
      expect(isSameDay(a, b)).toBe(false)
    })

    it('returns false for same day in different months', () => {
      const a = new Date(2026, 0, 15)
      const b = new Date(2026, 1, 15)
      expect(isSameDay(a, b)).toBe(false)
    })

    it('returns false for same day in different years', () => {
      const a = new Date(2025, 1, 27)
      const b = new Date(2026, 1, 27)
      expect(isSameDay(a, b)).toBe(false)
    })
  })

  describe('roundtrip', () => {
    it('formatDate -> parseDate produces the same calendar day', () => {
      const original = new Date(2026, 5, 15)
      const str = formatDate(original)
      const parsed = parseDate(str)!
      expect(isSameDay(original, parsed)).toBe(true)
    })
  })
})
