import { useRuntimeConfig, useAuthHeaders } from '#imports'
import { defineNuxtPlugin } from 'nuxt/app'
import { destr } from 'destr'
import { ApolloClients, provideApolloClients } from '@vue/apollo-composable'
import { createApolloProvider } from '@vue/apollo-option'
import { initApolloClient } from '../auth/apollo'

// We have to inline the useApiEndpoint here... nuxt blows up and I can't figure out why.
const useApiEndpoint = (path: string, clientName: string) => {
  const config = useRuntimeConfig()
  const proxyBases: Record<string, string> = config.tlv2?.proxyBase || {}
  const clientApiBases: Record<string, string> = config.public.tlv2?.apiBase || {}
  console.log('proxyBases:', proxyBases, 'clientApiBases:', clientApiBases)
  const apiBase = import.meta.server
    ? (proxyBases[clientName] || '')
    : (clientApiBases[clientName] || window?.location?.origin + '/api/v2') || ''
  return apiBase + (path || '')
}

export default defineNuxtPlugin(
  async (nuxtApp) => {
    console.log('apollo plugin: start')
    const headers = await useAuthHeaders()
    console.log('apollo plugin: headers', headers)

    const apolloClients = {
      default: initApolloClient(useApiEndpoint('/query', 'default'), headers),
      transitland: initApolloClient(useApiEndpoint('/query', 'default'), headers),
      stationEditor: initApolloClient(useApiEndpoint('/query', 'stationEditor'), headers),
      feedManagement: initApolloClient(useApiEndpoint('/query', 'feedManagement'), headers),
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
    if (process.client && nuxtApp.payload.data[cacheKey]) {
      defaultApolloClient.cache.restore(destr(JSON.stringify(nuxtApp.payload.data[cacheKey])))
    }
  }

)
