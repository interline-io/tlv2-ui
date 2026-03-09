import type { PathwayModeIcon } from '../../lib/pathways/pathway-icons'

export const SWITCH_VIEW_ROUTE_KEYS = {
  'pathways-v2': 'apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways-v2',
  'diagram': 'apps-stations-feedKey-feedVersionKey-stations-stationKey-diagram',
  'isometric': 'apps-stations-feedKey-feedVersionKey-stations-stationKey-isometric',
} as const

export const PeliasIcons: Record<string, PathwayModeIcon> = {
  marker: {
    icon: 'marker',
    label: 'marker'
  }
}

export const LocationTypes = new Map<number, string>([
  [0, 'Platform'],
  [1, 'Station'],
  [2, 'Entrance/Exit'],
  [3, 'Node'],
  [4, 'Boarding area']
])
