export const TLV2_ROUTE_KEYS = [
  // Transfers
  'apps-transfers',
  'apps-transfers-stationKey-maps',
  'apps-transfers-stationKey-routes',
  'apps-transfers-stationKey-transfers',
  'apps-transfers-stationKey-transfersummary',
  'apps-transfers-stationKey-transferscomparison',

  // Editor
  'apps-stations',
  'apps-stations-feedKey-feedVersionKey-stations',
  'apps-stations-feedKey-feedVersionKey-stations-new',
  'apps-stations-feedKey-feedVersionKey-stations-stop-associations',
  'apps-stations-feedKey-feedVersionKey-export',
  'apps-stations-feedKey-feedVersionKey-stations-stationKey',
  'apps-stations-feedKey-feedVersionKey-stations-stationKey-edit',
  'apps-stations-feedKey-feedVersionKey-stations-stationKey-stops',
  'apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways',
  'apps-stations-feedKey-feedVersionKey-stations-stationKey-diagram',
  'apps-stations-feedKey-feedVersionKey-stations-stationKey-levels-new',
  'apps-stations-feedKey-feedVersionKey-stations-stationKey-levels-levelKey-edit',

  // Admin
  'apps-admin-groups',
  'apps-admin-groups-groupKey',
  'apps-admin-tenants',
  'apps-admin-tenants-tenantKey',
  'feeds-feedKey',
  'feeds-feedKey-upload'
] as const

export type Tlv2RouteKey = typeof TLV2_ROUTE_KEYS[number]
