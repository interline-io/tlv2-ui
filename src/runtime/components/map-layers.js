const headways = {
  high: 600,
  medium: 1200,
  low: 1800
}

const colors = {
  active: '#ffff66',
  busoutline: '#ffffff',
  buslow: '#8acaeb',
  busmedium: '#1c96d6',
  bushigh: '#0f6896',
  rail: '#999999',
  railoutline: '#ffffff',
  tram: '#ff9966',
  tramoutline: '#ffffff',
  metro: '#ff0000',
  metrooutline: '#ffffff',
  other: '#E6A615',
  stop: '#000000',
  stopNode: '#808080',          // Gray for location_type > 1
  stopEntrance: '#ffffff',      // White outline for entrances (type 2)
  stopGeneric: '#ff0000',       // Red outline for generic nodes (type 3)
  stopBoarding: '#00ff00'       // Green outline for boarding areas (type 4)
}

const LocationTypes = {
  STOP: 0,      // Stop/Platform
  STATION: 1,   // Station
  ENTRANCE: 2,  // Entrance/Exit
  NODE: 3,      // Generic Node
  BOARDING: 4   // Boarding Area
}

const stopLayers = [
  // Add hover/active layer first
  {
    name: 'stop-active',
    type: 'circle',
    source: 'stops',
    minzoom: 14,
    paint: {
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        8,
        6
      ],
      'circle-color': [
        'case',
        ['>', ['get', 'location_type'], 1],
        colors.stopNode,
        colors.stop
      ],
      'circle-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.8,
        0.0
      ],
      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        6,
        0
      ],
      'circle-stroke-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        colors.active,
        '#ffffff'
      ]
    },
    filter: [
      'any',
      ['==', ['get', 'location_type'], LocationTypes.STOP],
      ['==', ['get', 'location_type'], LocationTypes.STATION],
      ['==', ['get', 'location_type'], LocationTypes.ENTRANCE]
    ]
  },
  // Regular stops layer
  {
    name: 'stops',
    type: 'circle',
    source: 'stops',
    minzoom: 14,
    paint: {
      'circle-color': [
        'case',
        ['>', ['get', 'location_type'], 1],
        colors.stopNode,
        colors.stop
      ],
      'circle-radius': 4,
      'circle-opacity': 0.75,
      'circle-stroke-width': [
        'case',
        ['==', ['get', 'location_type'], 2],
        2,
        ['==', ['get', 'location_type'], 3],
        2,
        ['==', ['get', 'location_type'], 4],
        2,
        0
      ],
      'circle-stroke-color': [
        'case',
        ['==', ['get', 'location_type'], 2],
        colors.stopEntrance,
        ['==', ['get', 'location_type'], 3],
        colors.stopGeneric,
        ['==', ['get', 'location_type'], 4],
        colors.stopBoarding,
        '#ffffff'
      ]
    },
    filter: [
      'any',
      ['==', ['get', 'location_type'], LocationTypes.STOP],
      ['==', ['get', 'location_type'], LocationTypes.STATION], 
      ['==', ['get', 'location_type'], LocationTypes.ENTRANCE]
    ]
  }
]

const railRamp = ['interpolate', ['exponential', 0.5], ['zoom'],
  10, 4,
  12, 2.5
]

const headwayColorRamp = ['step', ['get', 'headway_secs'],
  '#000000', 1,
  '#b0004c', 600,
  '#1c96d6', 1200,
  '#8acaeb', 1800,
  '#8acaeb'
]

const headwayWidthRamp = ['step', ['get', 'headway_secs'],
  1.5, 1,
  2.5, 600,
  2, 1200,
  1.5, 1800,
  1
]

const routeLayers = [
  // hitbox / active
  {
    name: 'route-active',
    minzoom: 8,
    paint: {
      'line-color': colors.active,
      'line-width': 12,
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1.0,
        0.0
      ]
    }
  },
  // RAIL: ROUTE_TYPE 2
  {
    name: 'route-rail-outline',
    minzoom: 8,
    filter: ['all', ['==', 'route_type', 2]],
    paint: {
      'line-color': colors.railoutline,
      'line-width': railRamp,
      'line-gap-width': 1.0
    }
  },
  {
    name: 'route-rail',
    filter: ['all', ['<=', 'route_type', 2]],
    paint: {
      'line-color': colors.rail,
      'line-width': railRamp
    }
  },
  // BUS LOW AND UNKNOWN: ROUTE_TYPE 3
  {
    name: 'route-bus-unknown',
    // minzoom: 8,
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', 0]],
    paint: {
      'line-color': colors.buslow,
      'line-width': 1.5
    }
  },
  {
    name: 'route-bus-low',
    filter: ['all', ['==', 'route_type', 3], ['>', 'headway_secs', headways.medium]],
    paint: {
      'line-color': colors.buslow,
      'line-width': 1.5
      // 'line-color': ['coalesce', ['get', 'route_color'], colors.buslow]
    }
  },
  // BUS MEDIUM: ROUTE_TYPE 3
  {
    name: 'route-bus-medium-outline',
    minzoom: 8,
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', headways.medium], ['>', 'headway_secs', headways.high]],
    paint: {
      'line-color': colors.busoutline,
      'line-width': headwayWidthRamp,
      'line-gap-width': 1.0
    }
  },
  {
    name: 'route-bus-medium',
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', headways.medium], ['>', 'headway_secs', headways.high]],
    paint: {
      'line-color': colors.busmedium,
      // 'line-color': ['coalesce', ['get', 'route_color'], colors.high],
      'line-width': headwayWidthRamp

    }
  },
  // BUS HIGH: ROUTE_TYPE 3
  {
    name: 'route-bus-high-outline',
    minzoom: 8,
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', headways.high], ['>', 'headway_secs', 0]],
    paint: {
      'line-color': colors.busoutline,
      'line-width': headwayWidthRamp,
      'line-gap-width': 1.0,
      'line-opacity': 1.0
    }
  },
  {
    name: 'route-bus-high',
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', headways.high], ['>', 'headway_secs', 0]],
    paint: {
      'line-color': colors.bushigh,
      // 'line-color': ['coalesce', ['get', 'route_color'], colors.high],
      'line-width': headwayWidthRamp,
      // 'line-width': 1.0,
      'line-opacity': 1.0

    }
  },
  // TRAM: ROUTE_TYPE 0
  {
    name: 'route-tram-outline',
    minzoom: 8,
    filter: ['all', ['==', 'route_type', 0]],
    paint: {
      'line-color': colors.tramoutline,
      'line-width': railRamp,
      'line-gap-width': 1.0
    }
  },
  {
    name: 'route-tram',
    filter: ['all', ['==', 'route_type', 0]],
    paint: {
      'line-color': ['coalesce', ['get', 'route_color'], colors.tram],
      'line-width': railRamp
    }
  },
  // METRO: ROUTE_TYPE 1
  {
    name: 'route-metro-outline',
    minzoom: 8,
    filter: ['all', ['==', 'route_type', 1]],
    paint: {
      'line-color': colors.metrooutline,
      'line-width': railRamp,
      'line-gap-width': 1.0
    }
  },
  {
    name: 'route-metro',
    filter: ['all', ['==', 'route_type', 1]],
    paint: {
      'line-color': ['coalesce', ['get', 'route_color'], colors.metro],
      'line-width': railRamp
    }
  },
  // OTHER: ROUTE_TYPE > 3
  {
    name: 'route-other',
    filter: ['all', ['>', 'route_type', 3]],
    paint: {
      'line-color': colors.other,
      'line-width': headwayWidthRamp,
      'line-opacity': 1.0
    }
  }
]

// Add these new layer definitions
const otherLayers = {
  polygons: {
    id: 'polygons',
    type: 'fill',
    source: 'polygons',
    paint: {
      'fill-color': '#ccc',
      'fill-opacity': 0.2
    }
  },
  polygonsOutline: {
    id: 'polygons-outline',
    type: 'line',
    source: 'polygons',
    paint: {
      'line-width': 2,
      'line-color': '#000',
      'line-opacity': 0.2
    }
  },
  points: {
    id: 'points',
    type: 'circle',
    source: 'points',
    paint: {
      'circle-color': ['coalesce', ['get', 'marker-color'], '#f03b20'],
      'circle-radius': ['coalesce', ['get', 'marker-radius'], 1],
      'circle-opacity': 0.4
    }
  },
  lines: {
    id: 'lines',
    type: 'line',
    source: 'lines',
    paint: {
      'line-color': ['coalesce', ['get', 'stroke'], '#000'],
      'line-width': ['coalesce', ['get', 'stroke-width'], 2],
      'line-opacity': 1.0
    }
  }
}

// Add route layer defaults
const routeLayerDefaults = {
  type: 'line',
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  }
}

export default { 
  headways, 
  colors, 
  stopLayers, 
  routeLayers,
  otherLayers,
  routeLayerDefaults,
  LocationTypes
}
