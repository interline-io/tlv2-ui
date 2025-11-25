export const TLV2_ROUTE_KEYS = [
  // Transfers
  'transitTransfers',
  'transitTransfers-stationKey-maps',
  'transitTransfers-stationKey-routes',
  'transitTransfers-stationKey-transfers',
  'transitTransfers-stationKey-transfersummary',
  'transitTransfers-stationKey-transferscomparison',

  // Editor
  'stationEditor',
  'stationEditor-feedKey-feedVersionKey-stations',
  'stationEditor-feedKey-feedVersionKey-stations-new',
  'stationEditor-feedKey-feedVersionKey-stations-stop-associations',
  'stationEditor-feedVersionKey-export',
  'stationEditor-feedKey-feedVersionKey-stations-stationKey',
  'stationEditor-feedKey-feedVersionKey-stations-stationKey-edit',
  'stationEditor-feedKey-feedVersionKey-stations-stationKey-stops',
  'stationEditor-feedKey-feedVersionKey-stations-stationKey-pathways',
  'stationEditor-feedKey-feedVersionKey-stations-stationKey-diagram',
  'stationEditor-feedKey-feedVersionKey-stations-stationKey-levels-new',
  'stationEditor-feedKey-feedVersionKey-stations-stationKey-levels-levelKey-edit'
] as const

export type Tlv2RouteKey = typeof TLV2_ROUTE_KEYS[number]
