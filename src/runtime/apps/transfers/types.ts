/**
 * Type definitions for transit-transfers feature
 */

import type { Feature, Polygon, MultiPolygon } from 'geojson'

/**
 * Station hub feature with polygon/multipolygon geometry
 */
export type StationHub = Feature<Polygon | MultiPolygon, {
  id: string
  name: string
  maps?: Array<{
    name: string
    url: string
    img: string
    pdf: string
  }>
  [key: string]: any
}>
