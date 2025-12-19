/**
 * Time parsing and formatting utilities
 */

/**
 * Time string in HH:MM:SS format (e.g., "09:30:00", "25:15:00" for times after midnight)
 */
export type TimeString = string

/**
 * Time window string in HH:MM:SS-HH:MM:SS format (e.g., "06:00:00-09:00:00")
 */
export type WindowString = string

/**
 * Split a window string into start and end time strings
 * @param value - Window string like "06:00:00-09:00:00" or "all"
 * @returns Tuple of [startTime, endTime]
 */
export function splitWindow (value?: WindowString | 'all' | null): [TimeString, TimeString] {
  if (!value || value === 'all') {
    return ['00:00:00', '48:00:00']
  }
  const a = value.split('-')
  if (a.length < 2 || !a[0] || !a[1]) {
    return ['00:00:00', '48:00:00']
  }
  return [a[0], a[1]]
}

/**
 * Convert a window string to seconds
 * @param value - Window string like "06:00:00-09:00:00" or "all"
 * @returns Tuple of [startSeconds, endSeconds]
 */
export function windowToSeconds (value?: WindowString | 'all' | null): [number, number] {
  if (!value || value === 'all') {
    return [0, 48 * 60 * 60]
  }
  const a = (value || '').split('-')
  if (a.length !== 2) {
    return [0, 0]
  }
  return [toSeconds(a[0]), toSeconds(a[1])]
}

/**
 * Convert time string to seconds
 * @param v - Time string in HH:MM:SS or HH:MM format
 * @returns Time in seconds
 */
export function toSeconds (v?: TimeString | null): number {
  if (!v) {
    return 0
  }
  const a = v.split(':').map(i => Number(i))
  if (a.length === 3 && a[0] !== undefined && a[1] !== undefined && a[2] !== undefined) {
    return (a[0] * 3600) + (a[1] * 60) + a[2]
  } else if (a.length === 2 && a[0] !== undefined && a[1] !== undefined) {
    return (a[0] * 3600) + (a[1] * 60)
  }
  return 0
}

/**
 * Convert seconds to duration string (HH:MM:SS or MM:SS format)
 * Negative values are shown in parentheses
 */
export function secondsToDuration (seconds: number | null): string {
  if (seconds === null || Number.isNaN(seconds)) {
    return ''
  }
  let neg = false
  if (seconds < 0) {
    neg = true
    seconds *= -1
  }
  const hours = Math.floor((seconds / 3600)) || 0
  const minutes = Math.floor((seconds % 3600) / 60) || 0
  const secs = Math.floor((seconds % 3600) % 60) || 0
  const s = []
  if (hours > 0) {
    s.push(String(hours))
    s.push(String(minutes).padStart(2, '0'))
    s.push(String(secs).padStart(2, '0'))
  } else if (minutes > 0) {
    s.push(String(minutes))
    s.push(String(secs).padStart(2, '0'))
  } else {
    s.push('0')
    s.push(String(secs).padStart(2, '0'))
  }
  if (neg) {
    return '(' + s.join(':') + ')'
  } else {
    return s.join(':')
  }
}

/**
 * Convert seconds to time string with AM/PM
 * Handles times past midnight (>24h)
 */
export function secondsToString (seconds: number | null): string {
  if (seconds === null) {
    return ''
  }
  const modsec = seconds % (24 * 60 * 60)
  let ampm = ''
  let hours = Math.floor((modsec / 3600)) || 0
  const minutes = Math.floor((modsec % 3600) / 60) || 0
  const secs = Math.floor((modsec % 3600) % 60) || 0
  if (hours === 0) {
    hours = 12
    ampm = 'am'
  } else if (hours < 12) {
    ampm = 'am'
  } else if (hours === 12) {
    ampm = 'pm'
  } else if (hours > 12) {
    hours -= 12
    ampm = 'pm'
  }
  if (seconds > (24 * 60 * 60)) {
    ampm = ampm + ' (next day)'
  }
  const s = []
  s.push(String(hours))
  s.push(String(minutes).padStart(2, '0'))
  s.push(String(secs).padStart(2, '0'))
  return s.join(':') + ' ' + ampm
}
