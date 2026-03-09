import type { Position } from 'geojson'
import type { Stop } from './station'

export interface ProjectionConfig {
  originLon: number
  originLat: number
  azimuth: number // degrees, 0=looking from south (north up), 90=from east
  elevation: number // degrees, 10–90
  floorHeight: number // meters per level_index unit
}

export interface ProjectedPoint {
  mx: number
  my: number
}

/**
 * Convert WGS84 lon/lat + z to isometric meter space.
 * Returns { mx, my } in meters relative to origin; caller maps to SVG pixels with d3-scale.
 */
export function projectPoint (lon: number, lat: number, z: number, cfg: ProjectionConfig): ProjectedPoint {
  const cosLat = Math.cos(cfg.originLat * Math.PI / 180)
  const x = (lon - cfg.originLon) * 111320 * cosLat // east, meters
  const y = (lat - cfg.originLat) * 111320 // north, meters

  const azRad = cfg.azimuth * Math.PI / 180
  const rx = x * Math.cos(azRad) - y * Math.sin(azRad)
  const ry = x * Math.sin(azRad) + y * Math.cos(azRad)

  const elRad = cfg.elevation * Math.PI / 180
  const mx = rx
  const my = ry * Math.cos(elRad) + z * Math.sin(elRad)

  return { mx, my }
}

/**
 * Project an array of [lon, lat] positions at a given z.
 */
export function projectRing (ring: Position[], z: number, cfg: ProjectionConfig): ProjectedPoint[] {
  return ring.map(pos => projectPoint(pos[0] as number, pos[1] as number, z, cfg))
}

/**
 * Project a point already in local meters (east=x, north=y) relative to the origin.
 * Skips the WGS84 → meters conversion step.
 */
export function projectLocalPoint (x: number, y: number, z: number, cfg: ProjectionConfig): ProjectedPoint {
  const azRad = cfg.azimuth * Math.PI / 180
  const rx = x * Math.cos(azRad) - y * Math.sin(azRad)
  const ry = x * Math.sin(azRad) + y * Math.cos(azRad)
  const elRad = cfg.elevation * Math.PI / 180
  return { mx: rx, my: ry * Math.cos(elRad) + z * Math.sin(elRad) }
}

/**
 * Compute the centroid (mean lon/lat) across all stops that have geometry.
 */
export function computeCentroid (stops: Pick<Stop, 'geometry'>[]): { lon: number, lat: number } {
  let sumLon = 0
  let sumLat = 0
  let count = 0
  for (const s of stops) {
    if (s.geometry) {
      sumLon += s.geometry.coordinates[0] as number
      sumLat += s.geometry.coordinates[1] as number
      count++
    }
  }
  if (count === 0) return { lon: 0, lat: 0 }
  return { lon: sumLon / count, lat: sumLat / count }
}

/**
 * Return z (meters) for a given level_index.
 * null/undefined index → -0.5 (renders slightly below ground as "unassigned" layer).
 */
export function levelZ (levelIndex: number | null | undefined, floorHeight: number): number {
  if (levelIndex == null) return -0.5 * floorHeight
  return levelIndex * floorHeight
}
