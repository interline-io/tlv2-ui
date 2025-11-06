import { defineNuxtPlugin } from 'nuxt/app'
import { destr } from 'destr'
import { ApolloClients, provideApolloClients } from '@vue/apollo-composable'
import { createApolloProvider } from '@vue/apollo-option'
import { initApolloClient } from '../auth'
import { useRuntimeConfig, useAuthHeaders } from '#imports'

// We have to inline the useApiEndpoint here... nuxt blows up and I can't figure out why.
const useApiEndpoint = (path: string, clientName: string) => {
  const config = useRuntimeConfig()
  if (import.meta.server) {
    const proxyBases: Record<string, string> = config.tlv2?.proxyBase || {}
    return (proxyBases[clientName] || '') + (path || '')
  }
  const clientApiBases: Record<string, string> = config.public.tlv2?.apiBase || {}
  return (clientApiBases[clientName] || window?.location?.origin + '/api/v2') + (path || '')
}

export default defineNuxtPlugin(
  async (nuxtApp) => {
    const apolloClients = {
      default: initApolloClient(useApiEndpoint('/query', 'default'), useAuthHeaders),
      transitland: initApolloClient(useApiEndpoint('/query', 'default'), useAuthHeaders),
      stationEditor: initApolloClient(useApiEndpoint('/query', 'stationEditor'), useAuthHeaders),
      feedManagement: initApolloClient(useApiEndpoint('/query', 'feedManagement'), useAuthHeaders),
    }
    const defaultApolloClient = apolloClients['default']

    // options api
    const apolloProvider = createApolloProvider({
      defaultClient: defaultApolloClient,
      clients: {
        ...apolloClients
      }
    })
    nuxtApp.vueApp.use(apolloProvider)

    // composition api
    nuxtApp.vueApp.provide(ApolloClients, { ...apolloClients })
    provideApolloClients({ ...apolloClients })

    // handle cache
    const cacheKey = '_apollo:transitland'
    nuxtApp.hook('app:rendered', () => {
      nuxtApp.payload.data[cacheKey] = defaultApolloClient.cache.extract()
    })
    if (import.meta.client && nuxtApp.payload.data[cacheKey]) {
      defaultApolloClient.cache.restore(destr(JSON.stringify(nuxtApp.payload.data[cacheKey])))
    }
  }

)
