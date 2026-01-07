import type {
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
  GeoJsonProperties,
  BBox,
} from 'geojson'

interface LonLat {
  lon: number
  lat: number
}

interface BoundingBox {
  sw: LonLat
  ne: LonLat
}

export function positionToLonLat (p: Position): LonLat {
  return {
    lon: p[0] || 0,
    lat: p[1] || 0,
  }
}

export type {
  LonLat,
  BoundingBox,
  // Re-export
  BBox as GeoJSONBbox, // geojson style
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
  GeoJsonProperties,
}
