export const TLV2_ROUTE_KEYS = [
  // Transfers
  'analyst-transit-transfers',
  'analyst-transit-transfers-stationKey-maps',
  'analyst-transit-transfers-stationKey-routes',
  'analyst-transit-transfers-stationKey-transfers',
  'analyst-transit-transfers-stationKey-transfersummary',
  'analyst-transit-transfers-stationKey-transferscomparison',

  // Editor
  'editor',
  'editor-feedKey-feedVersionKey-stations',
  'editor-feedKey-feedVersionKey-stations-new',
  'editor-feedKey-feedVersionKey-stations-stop-associations',
  'editor-feedKey-feedVersionKey-export',
  'editor-feedKey-feedVersionKey-stations-stationKey',
  'editor-feedKey-feedVersionKey-stations-stationKey-edit',
  'editor-feedKey-feedVersionKey-stations-stationKey-stops',
  'editor-feedKey-feedVersionKey-stations-stationKey-pathways',
  'editor-feedKey-feedVersionKey-stations-stationKey-diagram',
  'editor-feedKey-feedVersionKey-stations-stationKey-levels-new',
  'editor-feedKey-feedVersionKey-stations-stationKey-levels-levelKey-edit'
] as const

export type Tlv2RouteKey = typeof TLV2_ROUTE_KEYS[number]
