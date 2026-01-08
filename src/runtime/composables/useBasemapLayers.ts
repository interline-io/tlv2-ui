/**
 * Basemap configurations composable
 */

import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import { LIGHT, DARK, WHITE, GRAYSCALE, BLACK } from '@protomaps/basemaps'

// Re-export Protomaps utilities for use in consuming applications
export { layers, LIGHT, DARK, WHITE, GRAYSCALE, BLACK } from '@protomaps/basemaps'

/**
 * Protomaps glyphs URL template for MapLibre styles
 */
export const PROTOMAPS_GLYPHS_URL = 'https://cdn.protomaps.com/fonts/{fontstack}/{range}.pbf'

/**
 * Protomaps sprite URL base for MapLibre styles (append flavor name, e.g. /light)
 */
export const PROTOMAPS_SPRITE_URL = 'https://cdn.protomaps.com/sprites/v4'

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
        type: 'vector',
        tiles: [`https://api.protomaps.com/tiles/v4/{z}/{x}/{y}.pbf?key=${protomapsApikey}`],
        maxzoom: 14,
        attribution: '<a href="https://www.transit.land/terms">Transitland</a> | <a href="https://protomaps.com">Protomaps</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      },
      layer: {
        // For vector sources, we need to add multiple layers, not just one
        // This will be handled specially in the map initialization
        isVector: true,
        flavor: LIGHT
      }
    },
    'protomaps-dark': {
      label: 'Protomaps (dark)',
      source: {
        type: 'vector',
        tiles: [`https://api.protomaps.com/tiles/v4/{z}/{x}/{y}.pbf?key=${protomapsApikey}`],
        maxzoom: 14,
        attribution: '<a href="https://www.transit.land/terms">Transitland</a> | <a href="https://protomaps.com">Protomaps</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      },
      layer: {
        isVector: true,
        flavor: DARK
      }
    },
    'protomaps-white': {
      label: 'Protomaps (white)',
      source: {
        type: 'vector',
        tiles: [`https://api.protomaps.com/tiles/v4/{z}/{x}/{y}.pbf?key=${protomapsApikey}`],
        maxzoom: 14,
        attribution: '<a href="https://www.transit.land/terms">Transitland</a> | <a href="https://protomaps.com">Protomaps</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      },
      layer: {
        isVector: true,
        flavor: WHITE
      }
    },
    'protomaps-grayscale': {
      label: 'Protomaps (grayscale)',
      source: {
        type: 'vector',
        tiles: [`https://api.protomaps.com/tiles/v4/{z}/{x}/{y}.pbf?key=${protomapsApikey}`],
        maxzoom: 14,
        attribution: '<a href="https://www.transit.land/terms">Transitland</a> | <a href="https://protomaps.com">Protomaps</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      },
      layer: {
        isVector: true,
        flavor: GRAYSCALE
      }
    },
    'protomaps-black': {
      label: 'Protomaps (black)',
      source: {
        type: 'vector',
        tiles: [`https://api.protomaps.com/tiles/v4/{z}/{x}/{y}.pbf?key=${protomapsApikey}`],
        maxzoom: 14,
        attribution: '<a href="https://www.transit.land/terms">Transitland</a> | <a href="https://protomaps.com">Protomaps</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      },
      layer: {
        isVector: true,
        flavor: BLACK
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
