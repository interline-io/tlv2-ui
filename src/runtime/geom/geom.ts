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

interface Bbox {
  sw: LonLat
  ne: LonLat
}

interface LonLat {
  lon: number
  lat: number
}

interface BoundingBox {
  sw: LonLat
  ne: LonLat
}

interface MarkerFeature {
  onDragEnd: (newPosition: unknown) => void
  point: Position
  color: string
  draggable: boolean
  element?: HTMLElement // Optional HTML element for custom marker
}

interface PopupFeature {
  point: Position
  text: string
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
