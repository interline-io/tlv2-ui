import { initApolloClient } from '../auth/apollo'
import { useAuthHeaders } from '../auth/auth'
import { useStationEditorApiEndpoint } from './useStationEditorApiEndpoint'
import { debugLog } from '../lib/log'

export async function useStationEditorApolloClient () {
  const endpoint = useStationEditorApiEndpoint('/query')
  const headers = await useAuthHeaders()
  const apolloClient = initApolloClient(endpoint, headers)
  debugLog('useStationEditorApolloClient', endpoint)
  return apolloClient
}
