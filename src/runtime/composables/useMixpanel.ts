import { useRuntimeConfig } from '#imports'

// Composable for use in components
export const useMixpanel = async () => {
  const config = useRuntimeConfig()
  const mp = config.public.tlv2?.mixpanelInstance
  return mp
}
