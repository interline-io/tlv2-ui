import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { createMixpanel } from '../libnuxt/useMixpanel.client'

export default defineNuxtPlugin(() => {
  const mp = createMixpanel()
  return {
    provide: {
      mixpanel: mp
    }
  }
})
