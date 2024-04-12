import { mixpanel } from 'mixpanel-browser'

import { useUser } from './auth'

// Mixpanel init
let init = false
let hasUser = false

export const useMixpanel = () => {
  if (process.server) {
    return
  }
  const config = useRuntimeConfig()
  if (!config.public.mixpanelApikey) {
    // console.log('mixpanel: no config')
    return { track: (msg: string, args: any) => { console.log('mixpanel dummy track:', msg, args) } }
  }
  if (!init) {
    console.log('mixpanel: init')
    mixpanel.init(config.public.mixpanelApikey, {
      debug: true,
      persistence: 'localStorage',
      ignore_dnt: true // to also log Drew's reports
    })
    init = true
  }
  if (!hasUser) {
    const user = useUser()
    if (user && user.id) {
      const mpUser = {
        $email: user.email,
        $name: user.name
        // $groups: (user.groups || []).map((s) => { return s.name })
      }
      console.log('mixpanel: identify', mpUser)
      mixpanel.identify(user.id)
      mixpanel.people.set(mpUser)
      hasUser = true
    }
  }
  return {
    track: (msg: string, args: any) => {
      console.log('mixpanel track:', msg, args)
      mixpanel.track(msg, args)
    }
  }
}
