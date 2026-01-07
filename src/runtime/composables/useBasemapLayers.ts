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
      label: 'OpenStreetMap rendered by CARTO',
      source: {
        type: 'raster',
        tiles: [
          'https://0.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{scale}.png'
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
      label: 'Aerial imagery from Nearmap',
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
    }
  }))

  return {
    basemapLayers
  }
}
