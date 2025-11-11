import type { LonLat, Point } from './geom'

// Inlined haversine distance calculation in meters
// Based on https://github.com/njj/haversine
const EARTH_RADIUS_METERS = 6371000

function toRad (num: number): number {
  return num * Math.PI / 180
}

function haversine (
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number {
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const radLat1 = toRad(lat1)
  const radLat2 = toRad(lat2)

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_METERS * c
}

export function lonLatStr (v: LonLat | null): string {
  if (!v) return ''
  return [v.lon.toFixed(6), v.lat.toFixed(6)].join(',')
}

// Methods
export function haversinePosition (start: number[], end: number[]): number {
  return haversine(
    start[0] ?? 0,
    start[1] ?? 0,
    end[0] ?? 0,
    end[1] ?? 0
  )
}

export function haversinePoint (fromPoint: Point, toPoint: Point): number {
  return haversine(
    fromPoint.coordinates[0] ?? 0,
    fromPoint.coordinates[1] ?? 0,
    toPoint.coordinates[0] ?? 0,
    toPoint.coordinates[1] ?? 0
  )
}

export function haversineLonLat (from: LonLat, to: LonLat): number {
  return haversine(from.lon, from.lat, to.lon, to.lat)
}
