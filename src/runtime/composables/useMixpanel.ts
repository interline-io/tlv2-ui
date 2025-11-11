import { useRuntimeConfig } from '#imports'
import { createMixpanel } from '../lib/mixpanel'
import { useUserSync } from './useUser'

// Composable for use in components
export const useMixpanel = () => {
  const config = useRuntimeConfig()
  const mp = createMixpanel(config.public.tlv2?.mixpanelApikey, useUserSync())
  mp.identify()
  return mp
}
