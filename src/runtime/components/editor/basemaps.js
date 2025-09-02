import { useRuntimeConfig } from '#imports'

export function getBasemapLayers () {
  const config = useRuntimeConfig()
  return {
    carto: {
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
    near: {
      label: 'Nearmap aerial imagery',
      source: {
        type: 'raster',
        tiles: [
          `https://api.nearmap.com/tiles/v3/Vert/{z}/{x}/{y}.jpg?apikey=${config.public.nearmapsApikey}`
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
  }
}

export const PathwayModeIcons = {
  1: {
    icon: 'walkway',
    label: 'Walkway',
    altIcon: 'walkway-alt'
  },
  2: {
    icon: 'stairs',
    label: 'Stairs'
  },
  3: {
    icon: 'moving-sidewalk',
    label: 'Moving sidewalk'
  },
  4: {
    icon: 'escalator',
    label: 'Escalator'
  },
  5: {
    icon: 'elevator',
    label: 'Elevator'
  },
  6: {
    icon: 'fare-gate',
    label: 'Fare gate'
  },
  7: {
    icon: 'exit-gate',
    label: 'Exit gate'
  }
}

export const PeliasIcons = {
  marker: {
    icon: 'marker',
    label: 'marker'
  }
}

export const PathwayModes = new Map([
  [1, 'Walkway'],
  [2, 'Stairs'],
  [3, 'Moving sidewalk'],
  [4, 'Escalator'],
  [5, 'Elevator'],
  [6, 'Fare gate'],
  [7, 'Exit gate']
])

export const LocationTypes = new Map([
  [0, 'Platform'],
  [1, 'Station'],
  [2, 'Entrance/Exit'],
  [3, 'Node'],
  [4, 'Boarding area']
])
