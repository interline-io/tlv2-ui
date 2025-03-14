import mixpanel from 'mixpanel-browser'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useUser } from './auth'

interface User {
  id: string
  email: string
  name: string
}

interface MixpanelInstance {
  track: (msg: string, args: any) => void
  identify: (properties?: Record<string, any>) => void
  reset: () => void
}

// Mixpanel init
let init = false
let hasUser = false

const createMixpanel = (): MixpanelInstance => {
  if (process.server) {
    return { 
      track: (msg: string, args: any) => { },
      identify: () => {},
      reset: () => {}
    }
  }
  
  const config = useRuntimeConfig()
  if (!config.public.mixpanelApikey) {
    return { 
      track: (msg: string, args: any) => { console.log('mixpanel dummy track (no API key):', msg, args) },
      identify: () => {},
      reset: () => {}
    }
  }

  if (!init) {
    console.log('mixpanel: init')
    mixpanel.init(config.public.mixpanelApikey, {
      debug: true,
      persistence: 'localStorage',
      ignore_dnt: true
    })
    init = true
  }

  return {
    track: (msg: string, args: any) => {
      console.log('mixpanel track:', msg, args)
      mixpanel.track(msg, args)
    },
    identify: (properties?: Record<string, any>) => {
      if (hasUser) return
      const user = useUser() as User
      if (user && user.id) {
        const mpUser: any = {
          $email: user.email,
          $name: user.name,
          ...properties
        }
        console.log('mixpanel: identify', mpUser)
        mixpanel.identify(user.id)
        mixpanel.people.set(mpUser)
        hasUser = true
      }
    },
    reset: () => {
      console.log('mixpanel: reset')
      hasUser = false
      mixpanel.reset()
    }
  }
}

export default defineNuxtPlugin(() => {
  const mp = createMixpanel()
  return {
    provide: {
      mixpanel: mp
    }
  }
})

// Composable for use in components
export const useMixpanel = (): MixpanelInstance => {
  const mp = createMixpanel()
  mp.identify()
  return mp
} 