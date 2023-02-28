import { proxyRequest } from 'h3'
const config = useRuntimeConfig()

export default defineEventHandler(async (event) => {
    const proxyPath = event.context.params.path
    return proxyRequest(
        event,
        config.apiBase + "/" + proxyPath, 
        {
            headers: {
                apikey: config.ssrGraphqlApikey
            }
        } )
})
