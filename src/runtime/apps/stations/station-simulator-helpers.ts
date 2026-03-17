/**
 * Pure helper functions for the station simulator.
 * Extracted here to be independently testable without Vue/MapLibre setup.
 */

/**
 * Compute a quadratic bezier arc between two [lon, lat] points.
 * The control point is offset perpendicular to the straight-line segment
 * so the arc curves away from the direct path.
 *
 * Returns `steps + 1` evenly-spaced points along the curve,
 * with the first equal to p0 and the last equal to p2.
 * Degenerate case (p0 === p2): returns [p0, p2] directly.
 */
export function computeArc (p0: [number, number], p2: [number, number], steps = 32): [number, number][] {
  const dLon = p2[0] - p0[0]
  const dLat = p2[1] - p0[1]
  const len = Math.sqrt(dLon * dLon + dLat * dLat)
  if (len === 0) { return [p0, p2] }
  // Control point: midpoint shifted perpendicular to the segment
  const offset = len * 0.35
  const p1: [number, number] = [
    (p0[0] + p2[0]) / 2 - (dLat / len) * offset,
    (p0[1] + p2[1]) / 2 + (dLon / len) * offset
  ]
  const pts: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    pts.push([
      (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
      (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
    ])
  }
  return pts
}

/**
 * Bearing in degrees clockwise from north, derived from the last two points
 * of an arc (i.e. the terminal direction of travel).
 * Returns 0 for arrays with fewer than two points.
 */
export function terminalBearing (pts: [number, number][]): number {
  if (pts.length < 2) { return 0 }
  const a = pts[pts.length - 2]!
  const b = pts[pts.length - 1]!
  return Math.atan2(b[0] - a[0], b[1] - a[1]) * 180 / Math.PI
}
