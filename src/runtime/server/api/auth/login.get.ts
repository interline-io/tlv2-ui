import { defineEventHandler, getQuery, createError } from 'h3'
import { getAuth0Config, initiateLogin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const auth0 = getAuth0Config()
  if (!auth0) {
    throw createError({ statusCode: 500, statusMessage: 'Auth not configured' })
  }

  const query = getQuery(event)
  const returnTo = (query.returnTo as string) || '/'

  return initiateLogin(event, auth0, returnTo)
})
