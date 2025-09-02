import { useTransitlandApiBase as useTransitlandApiBaseServer } from '../libnuxt/api.client'
import { useTransitlandApiBase as useTransitlandApiBaseClient } from '../libnuxt/api.server'

export function useTransitlandApiBase () {
  if (process.server) {
    return useTransitlandApiBaseServer()
  }
  return useTransitlandApiBaseClient()
}
