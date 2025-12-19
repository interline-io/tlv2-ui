import { useRuntimeConfig } from '#imports'
import { createMixpanel } from '../lib/analytics/mixpanel'
import { useUser } from '../lib/auth'

// Composable for use in components
export const useMixpanel = () => {
  const config = useRuntimeConfig()
  const mp = createMixpanel(config.public.tlv2?.mixpanelApikey, useUser())
  mp.identify()
  return mp
}
