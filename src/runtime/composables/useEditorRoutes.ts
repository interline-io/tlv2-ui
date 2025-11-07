import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()

export function useEditorRoutes () {
  // Build route names with the configured prefix
  const prefix = config.public.tlv2?.editorRoutePrefix || 'editor'
  return {
    index: `${prefix}`,
    stations: `${prefix}-feedKey-feedVersionKey-stations`,
    stationsNew: `${prefix}-feedKey-feedVersionKey-stations-new`,
    stationsStopAssociations: `${prefix}-feedKey-feedVersionKey-stations-stop-associations`,
    export: `${prefix}-feedKey-feedVersionKey-export`,
    stationIndex: `${prefix}-feedKey-feedVersionKey-stations-stationKey`,
    stationEdit: `${prefix}-feedKey-feedVersionKey-stations-stationKey-edit`,
    stationStops: `${prefix}-feedKey-feedVersionKey-stations-stationKey-stops`,
    stationPathways: `${prefix}-feedKey-feedVersionKey-stations-stationKey-pathways`,
    stationDiagram: `${prefix}-feedKey-feedVersionKey-stations-stationKey-diagram`,
    levelNew: `${prefix}-feedKey-feedVersionKey-stations-stationKey-levels-new`,
    levelEdit: `${prefix}-feedKey-feedVersionKey-stations-stationKey-levels-levelKey-edit`
  }
}
