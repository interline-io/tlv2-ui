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
