<template>
  <nav class="breadcrumb box" aria-label="breadcrumbs">
    <ul>
      <li v-for="p of parents" :key="p.id" :class="p.class">
        <span v-if="p.tag" class="tag is-small">{{ p.tag }}</span>
        <nuxt-link v-if="p.route" :to="{name:p.route}">
          {{ p.text }}
        </nuxt-link>
        <a v-else href="#">{{ p.text }}</a>
      </li>
    </ul>
  </nav>
</template>

<script>
const capitalize = str => str.length
  ? str[0].toUpperCase() +
    str.slice(1).toLowerCase()
  : ''

const routeNames = {
  feeds: 'Source Feeds',
  routes: 'Routes',
  stops: 'Stops'
}

const shorteners = {
  feedVersionKey: 8
}

const routeTags = {
  'editor-feedKey-feedVersionKey-stations-stationKey': 'Station',
  'editor-feedKey': 'Feed',
  'editor-feedKey-feedVersionKey': 'Version'
}

export default {
  props: {
    extraRouteNames: { type: Object, default() { return {} } },
    extraRouteTags: { type: Object, default() { return {} } }
  },
  computed: {
    parents() {
      const router = useRouter()
      const params = useRoute().params
      const routeFragments = useRoute().name.split('-')
      console.log('routeFragments:', routeFragments)
      const ret = []
      ret.push({
        class: '',
        id: 'index',
        route: 'index',
        text: 'Home'
      })
      if (routeFragments.length === 1 && routeFragments[0] === 'index') {
        return ret
      }
      for (let i = 0; i < routeFragments.length; i++) {
        const element = routeFragments[i]
        const id = routeFragments.slice(0, i + 1).join('-')
        let text = ''
        let route = ''
        let tag = ''
        if (routeNames[id]) {
          text = routeNames[id]
        } else if (this.extraRouteNames[id]) {
          text = this.extraRouteNames[id]
        } else if (params[element]) {
          text = params[element]
        } else if (router.hasRoute(id)) {
          text = capitalize(element)
        } else {
          continue
        }

        if (routeTags[id]) {
          tag = routeTags[id]
        } else if (this.extraRouteTags[id]) {
          tag = this.extraRouteTags[id]
        }

        if (router.hasRoute(id)) {
          route = id
        }
        const shortenLength = shorteners[element] || 128
        if (shortenLength) {
          text = this.$filters.shortenName(text, shortenLength)
        }

        // Prepare for rendering
        ret.push({
          class: route ? '' : 'is-active',
          id,
          tag,
          route,
          text
        })
      }
      return ret
    }
  }
}
</script>
