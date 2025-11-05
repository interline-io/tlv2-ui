import haversine from 'haversine'

import type { LonLat, Point } from './geom'

export function lonLatStr (v: LonLat | null): string {
  if (!v) return ''
  return [v.lon.toFixed(6), v.lat.toFixed(6)].join(',')
}

// Methods
export function haversinePoint (fromPoint: Point, toPoint: Point): number {
  const d = haversine({
    latitude: fromPoint.coordinates[1] ?? 0,
    longitude: fromPoint.coordinates[0] ?? 0
  }, {
    latitude: toPoint.coordinates[1] ?? 0,
    longitude: toPoint.coordinates[0] ?? 0
  }, { unit: 'meter' })
  return d
}

export function haversineLonLat (from: LonLat, to: LonLat): number {
  const d = haversine({
    latitude: from.lat,
    longitude: from.lon
  }, {
    latitude: to.lat,
    longitude: to.lon
  }, { unit: 'meter' })
  return d
}
