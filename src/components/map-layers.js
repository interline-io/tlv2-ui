
const headways = {
  high: 300,
  medium: 900,
  low: 1800
}

const colors = {
  active: '#ffff66',
  busoutline: '#ffffff',
  buslow: '#8acaeb',
  busmedium: '#1c96d6',
  bushigh: '#ff0000',
  rail: '#aaaaaa',
  railoutline: '#ffffff',
  tram: '#ff9966',
  tramoutline: '#ffffff',
  metro: '#ff0000',
  metrooutline: '#ffffff',
  other: '#E6A615',
  stop: '#007cbf'
}

const stopLayers = [
  {
    name: 'stops',
    type: 'circle',
    source: 'stops',
    paint: {
      'circle-color': '#000',
      'circle-radius': 4,
      'circle-opacity': 0.75
    }
  }
]

const routeLayers = [
  // hitbox / active
  {
    name: 'route-active',
    minzoom: 8,
    paint: {
      'line-color': colors.active,
      'line-width': 8,
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1.0,
        0.0
      ]
    }
  },
  // RAIL
  {
    name: 'route-rail-outline',
    minzoom: 8,
    filter: ['all', ['==', 'route_type', 2]],
    paint: { 'line-width': 3.0, 'line-gap-width': 1.0, 'line-color': colors.railoutline }
  },
  {
    name: 'route-rail',
    filter: ['all', ['<=', 'route_type', 2]],
    paint: { 'line-width': 3.0, 'line-color': '#666' }
  },
  // BUS LOW AND UNKNOWN
  {
    name: 'route-bus-unknown',
    // minzoom: 8,
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', 0]],
    paint: { 'line-width': 1.5, 'line-color': colors.buslow }
  },
  {
    name: 'route-bus-low',
    filter: ['all', ['==', 'route_type', 3], ['>', 'headway_secs', headways.medium]],
    paint: { 'line-width': 1.5, 'line-color': colors.buslow }
  },
  // BUS MEDIUM/HIGH
  {
    name: 'route-bus-medium-outline',
    minzoom: 8,
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', headways.medium], ['>', 'headway_secs', 0]],
    paint: { 'line-width': 2.0, 'line-gap-width': 1.0, 'line-color': colors.busoutline }
  },
  {
    name: 'route-bus-medium',
    filter: ['all', ['==', 'route_type', 3], ['<=', 'headway_secs', headways.medium], ['>', 'headway_secs', 0]],
    paint: { 'line-width': 2.0, 'line-color': colors.busmedium }
  },
  // TRAM
  {
    name: 'route-tram-outline',
    minzoom: 8,
    filter: ['all', ['==', 'route_type', 0]],
    paint: { 'line-width': 3.0, 'line-gap-width': 1.0, 'line-color': colors.tramoutline }
  },
  {
    name: 'route-tram',
    filter: ['all', ['==', 'route_type', 0]],
    paint: { 'line-width': 3.0, 'line-color': ['coalesce', ['get', 'route_color'], colors.tram] }
  },
  // METRO
  {
    name: 'route-metro-outline',
    minzoom: 8,
    filter: ['all', ['==', 'route_type', 1]],
    paint: { 'line-width': 3.0, 'line-gap-width': 1.0, 'line-color': colors.metrooutline }
  },
  {
    name: 'route-metro',
    filter: ['all', ['==', 'route_type', 1]],
    paint: { 'line-width': 3.0, 'line-color': ['coalesce', ['get', 'route_color'], colors.metro] }
  },
  // OTHER
  {
    name: 'route-other',
    filter: ['all', ['>', 'route_type', 3]],
    paint: {
      'line-opacity': 1.0,
      'line-width': [
        'step',
        ['get', 'headway_secs'],
        1, 1,
        2, 600,
        1, 1200,
        1
      ],
      'line-color': colors.other
    }
  }
]

export default { headways, colors, stopLayers, routeLayers }
