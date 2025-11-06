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
