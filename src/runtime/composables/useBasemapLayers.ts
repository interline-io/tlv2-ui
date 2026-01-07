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
  'protomaps-light': BasemapLayer
  'protomaps-dark': BasemapLayer
  'protomaps-white': BasemapLayer
  'protomaps-grayscale': BasemapLayer
  'protomaps-black': BasemapLayer
  'carto': BasemapLayer
  'near': BasemapLayer
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
  const protomapsApikey = config.public.tlv2?.protomapsApikey

  const basemapLayers = computed<BasemapLayers>(() => ({
    'protomaps-light': {
      label: 'Protomaps (light)',
      source: {
        type: 'raster',
        tiles: [
          `https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.png?key=${protomapsApikey}&style=light`
        ],
        tileSize: 256,
        attribution: '<a href="https://www.transit.land/terms">Transitland</a> | <a href="https://protomaps.com">Protomaps</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      },
      layer: {
        type: 'raster',
        minzoom: 0,
        maxzoom: 22
      }
    },
    'protomaps-dark': {
      label: 'Protomaps (dark)',
      source: {
        type: 'raster',
        tiles: [
          `https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.png?key=${protomapsApikey}&style=dark`
        ],
        tileSize: 256,
        attribution: '<a href="https://www.transit.land/terms">Transitland</a> | <a href="https://protomaps.com">Protomaps</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      },
      layer: {
        type: 'raster',
        minzoom: 0,
        maxzoom: 22
      }
    },
    'protomaps-white': {
      label: 'Protomaps (white)',
      source: {
        type: 'raster',
        tiles: [
          `https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.png?key=${protomapsApikey}&style=white`
        ],
        tileSize: 256,
        attribution: '<a href="https://www.transit.land/terms">Transitland</a> | <a href="https://protomaps.com">Protomaps</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      },
      layer: {
        type: 'raster',
        minzoom: 0,
        maxzoom: 22
      }
    },
    'protomaps-grayscale': {
      label: 'Protomaps (grayscale)',
      source: {
        type: 'raster',
        tiles: [
          `https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.png?key=${protomapsApikey}&style=grayscale`
        ],
        tileSize: 256,
        attribution: '<a href="https://www.transit.land/terms">Transitland</a> | <a href="https://protomaps.com">Protomaps</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      },
      layer: {
        type: 'raster',
        minzoom: 0,
        maxzoom: 22
      }
    },
    'protomaps-black': {
      label: 'Protomaps (black)',
      source: {
        type: 'raster',
        tiles: [
          `https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.png?key=${protomapsApikey}&style=black`
        ],
        tileSize: 256,
        attribution: '<a href="https://www.transit.land/terms">Transitland</a> | <a href="https://protomaps.com">Protomaps</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      },
      layer: {
        type: 'raster',
        minzoom: 0,
        maxzoom: 22
      }
    },
    'carto': {
      label: 'Carto street map',
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
    'near': {
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
    }
  }))

  return {
    basemapLayers
  }
}
