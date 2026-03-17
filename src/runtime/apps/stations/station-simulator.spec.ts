import { describe, test, expect } from 'vitest'
import { computeArc, terminalBearing } from './station-simulator-helpers'

describe('computeArc', () => {
  test('first point equals p0 and last point equals p2', () => {
    const p0: [number, number] = [-122.4, 37.8]
    const p2: [number, number] = [-122.41, 37.81]
    const pts = computeArc(p0, p2)
    expect(pts[0]).toEqual(p0)
    expect(pts[pts.length - 1]).toEqual(p2)
  })

  test('returns steps + 1 points', () => {
    expect(computeArc([0, 0], [1, 1], 16)).toHaveLength(17)
    expect(computeArc([0, 0], [1, 1], 32)).toHaveLength(33)
  })

  test('degenerate case: same start and end returns two-element array', () => {
    const p: [number, number] = [-122.4, 37.8]
    const pts = computeArc(p, p)
    expect(pts).toHaveLength(2)
    expect(pts[0]).toEqual(p)
    expect(pts[1]).toEqual(p)
  })

  test('arc curves away from the straight line (control point offset)', () => {
    // Horizontal segment due east: midpoint of arc should be north of the midline
    const p0: [number, number] = [0, 0]
    const p2: [number, number] = [1, 0]
    const pts = computeArc(p0, p2, 32)
    const mid = pts[16]!
    // The perpendicular offset pushes control point north (+lat),
    // so the arc midpoint should have positive latitude
    expect(mid[1]).toBeGreaterThan(0)
    // Longitude at midpoint is close to 0.5
    expect(mid[0]).toBeCloseTo(0.5, 1)
  })
})

describe('terminalBearing', () => {
  test('returns 0 for empty or single-point arrays', () => {
    expect(terminalBearing([])).toBe(0)
    expect(terminalBearing([[0, 0]])).toBe(0)
  })

  test('due north (increasing lat) → 0°', () => {
    const bearing = terminalBearing([[0, 0], [0, 1]])
    expect(bearing).toBeCloseTo(0, 5)
  })

  test('due east (increasing lon) → 90°', () => {
    const bearing = terminalBearing([[0, 0], [1, 0]])
    expect(bearing).toBeCloseTo(90, 5)
  })

  test('due south (decreasing lat) → 180°', () => {
    const bearing = terminalBearing([[0, 1], [0, 0]])
    expect(bearing).toBeCloseTo(180, 5)
  })

  test('due west (decreasing lon) → -90°', () => {
    const bearing = terminalBearing([[1, 0], [0, 0]])
    expect(bearing).toBeCloseTo(-90, 5)
  })
})
