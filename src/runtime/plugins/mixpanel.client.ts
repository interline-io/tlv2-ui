import { useRuntimeConfig } from '#imports'
import { defineNuxtPlugin } from 'nuxt/app'
import { createMixpanel } from '../lib/analytics/mixpanel'
import { useUser } from '../lib/auth'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const mp = createMixpanel(config.public.tlv2?.mixpanelApikey, useUser())
  return {
    provide: {
      mixpanel: mp
    }
  }
})
