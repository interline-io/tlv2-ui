import type { PathwayModeIcon } from '../../lib/pathways/pathway-icons'

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
