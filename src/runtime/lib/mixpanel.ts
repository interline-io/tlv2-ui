import mixpanel from 'mixpanel-browser'

export interface MixpanelUser {
  id: string
  email: string
  name: string
}

export interface MixpanelInstance {
  track: (msg: string, args: any) => void
  identify: (properties?: Record<string, any>) => void
  reset: () => void
}

// Mixpanel init
let init = false
let hasUser = false

export const createMixpanel = (apikey: string, user: MixpanelUser): MixpanelInstance => {
  if (import.meta.server) {
    return {
      track: (msg: string, args: any) => { },
      identify: () => {},
      reset: () => {}
    }
  }

  if (!apikey) {
    return {
      track: (msg: string, args: any) => { console.log('mixpanel dummy track (no API key):', msg, args) },
      identify: () => {},
      reset: () => {}
    }
  }

  if (!init) {
    console.log('mixpanel: init')
    mixpanel.init(apikey, {
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
      if (hasUser) {
        return
      }
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
