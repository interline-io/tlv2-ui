/**
 * Pure utility functions for the datepicker component.
 * Extracted for testability.
 */

export function formatDate (date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDate (dateString: string): Date | null {
  if (!dateString) return null
  // Parse YYYY-MM-DD as local date to avoid UTC timezone shift
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  }
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? null : date
}

export function isSameDay (date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear()
    && date1.getMonth() === date2.getMonth()
    && date1.getDate() === date2.getDate()
}
