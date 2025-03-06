import { mixpanel } from 'mixpanel-browser'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useUser } from './auth'

interface User {
  id: string
  email: string
  name: string
  groups?: Array<{ name: string }>
}

// Mixpanel init
let init = false
let hasUser = false

const createMixpanel = () => {
  if (process.server) {
    return {
      track: (msg: string, args: any) => { console.log('mixpanel server-side dummy track:', msg, args) }
    }
  }

  const config = useRuntimeConfig()
  if (!config.public.mixpanelApikey) {
    return { 
      track: (msg: string, args: any) => { console.log('mixpanel dummy track (no API key):', msg, args) }
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
    identify: () => {
      if (hasUser) return
      const user = useUser() as User
      if (user && user.id) {
        const mpUser: any = {
          $email: user.email,
          $name: user.name
        }
        if (user.groups?.length) {
          mpUser.$groups = user.groups.map(s => s.name)
        }
        console.log('mixpanel: identify', mpUser)
        mixpanel.identify(user.id)
        mixpanel.people.set(mpUser)
        hasUser = true
      }
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
export const useMixpanel = () => {
  if (process.server) {
    return {
      track: (msg: string, args: any) => { console.log('mixpanel server-side dummy track:', msg, args) }
    }
  }
  const mp = createMixpanel()
  mp.identify()
  return mp
}
