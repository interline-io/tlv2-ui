import { checkLogin, handleRedirectCallback } from '~/src/plugins/auth'

export default defineNuxtRouteMiddleware(async (to, _) => {
  const query = to?.query
  if (query && query.code && query.state) {
    await handleRedirectCallback()
  }

  await checkLogin()
})
