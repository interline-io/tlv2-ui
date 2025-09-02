import { useRuntimeConfig } from '#imports'
import { createMixpanel } from '../lib/mixpanel'
import { useUser } from '../auth/auth'

// Composable for use in components
export const useMixpanel = () => {
  const config = useRuntimeConfig()
  const mp = createMixpanel(config.public.mixpanelApikey, useUser())
  mp.identify()
  return mp
}
