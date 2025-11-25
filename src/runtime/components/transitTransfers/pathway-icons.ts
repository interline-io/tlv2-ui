/**
 * GTFS pathway mode icon configuration
 */
export interface PathwayModeIcon {
  icon: string
  label: string
  altIcon?: string
}

/**
 * Mapping of GTFS pathway modes to icon configurations
 * @see https://gtfs.org/schedule/reference/#pathwaystxt
 */
export const PathwayModeIcons: Record<number, PathwayModeIcon> = {
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
