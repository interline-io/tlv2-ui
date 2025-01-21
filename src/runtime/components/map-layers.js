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
  stop: '#007cbf'
}

const stopLayers = [
  // Add hover/active layer first
  {
    name: 'stop-active',
    type: 'circle',
    source: 'stops',
    minzoom: 14, // Match the stopTiles minzoom
    paint: {
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        8,  // hovered size
        6   // normal size
      ],
      'circle-color': colors.stop,
      'circle-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.8,  // hovered opacity
        0.0   // normal opacity (invisible when not hovered)
      ],
      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        2,    // hovered stroke width
        0     // normal stroke width
      ],
      'circle-stroke-color': '#ffffff'
    }
  },
  // Regular stops layer
  {
    name: 'stops',
    type: 'circle',
    source: 'stops',
    minzoom: 14,
    paint: {
      'circle-color': colors.stop,
      'circle-radius': 4,
      'circle-opacity': 0.75
    }
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

export default { headways, colors, stopLayers, routeLayers }
