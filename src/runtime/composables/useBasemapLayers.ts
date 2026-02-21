/**
 * Basemap configurations composable
 */

import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'

/**
 * Layer configuration for map display
 */
export type LayerConfig = Record<string, any>

/**
 * Source configuration for map tiles
 */
export type SourceConfig = Record<string, any>

/**
 * Basemap layer definition
 */
export interface BasemapLayer {
  label: string
  source: SourceConfig
  layer: LayerConfig
}

/**
 * Collection of available basemap layers
 */
export interface BasemapLayers {
  carto: BasemapLayer
  near: BasemapLayer
  none: BasemapLayer
  [key: string]: BasemapLayer
}

/**
 * Composable for accessing basemap layer configurations
 *
 * @returns An object containing basemap layers computed property
 *
 * @example
 * ```ts
 * const { basemapLayers } = useBasemapLayers()
 *
 * // Access layers
 * for (const [key, layer] of Object.entries(basemapLayers.value)) {
 *   console.log(layer.label)
 * }
 * ```
 */
export function useBasemapLayers () {
  const config = useRuntimeConfig()

  const basemapLayers = computed<BasemapLayers>(() => ({
    carto: {
      label: 'Carto street map',
      source: {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: 'Transitland | Interline | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
      },
      layer: {
        type: 'raster',
        minzoom: 0,
        maxzoom: 22
      }
    },
    near: {
      label: 'Nearmap aerial imagery',
      source: {
        type: 'raster',
        tiles: [
          `https://api.nearmap.com/tiles/v3/Vert/{z}/{x}/{y}.jpg?apikey=${config.public.tlv2?.nearmapsApikey}`
        ],
        tileSize: 256,
        attribution: 'Transitland | Interline | &copy; Nearmap'
      },
      layer: {
        type: 'raster',
        minzoom: 17,
        maxzoom: 22,
        layout: {
          visibility: 'none'
        }
      }
    },
    none: {
      label: 'No basemap',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]]
          },
          properties: {}
        }
      },
      layer: {
        type: 'fill',
        paint: {
          'fill-color': '#f5f5f5'
        },
        layout: {
          visibility: 'none'
        }
      }
    }
  }))

  return {
    basemapLayers
  }
}
