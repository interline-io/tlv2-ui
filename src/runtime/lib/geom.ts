export type {
  GeoJSON,
  GeoJsonObject,
  Geometry,
  GeometryObject,
  Point,
  LineString,
  Polygon,
  MultiPoint,
  MultiLineString,
  MultiPolygon,
  GeometryCollection,
  Feature,
  FeatureCollection,
  Position,
  BBox,
  GeoJsonProperties
} from 'geojson'

import type { Point } from 'geojson'

import haversine from 'haversine'

export interface LonLat {
  lon: number
  lat: number
}

export interface Bbox {
  sw: LonLat
  ne: LonLat
}

export function lonLatStr (v: LonLat | null): string {
  if (!v) return ''
  return [v.lon.toFixed(6), v.lat.toFixed(6)].join(',')
}

// Methods
export function haversinePoint (fromPoint: Point, toPoint: Point): number {
  const d = haversine({
    latitude: fromPoint.coordinates[1],
    longitude: fromPoint.coordinates[0]
  }, {
    latitude: toPoint.coordinates[1],
    longitude: toPoint.coordinates[0]
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
