import { useRuntimeConfig } from '#imports'
import { createMixpanel } from '../lib/mixpanel'
import { useUser } from '../auth'

const config = useRuntimeConfig()

// Composable for use in components
export const useMixpanel = () => {
  const mp = createMixpanel(config.public.tlv2?.mixpanelApikey, useUser())
  mp.identify()
  return mp
}
