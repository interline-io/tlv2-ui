<template>
  <div>
    <nav :key="updateKey" :class="classes" aria-label="breadcrumbs">
      <ul>
        <li v-for="p of makeNav()" :key="p.id" :class="p.class">
          <span v-if="p.tag" class="tag is-small">{{ p.tag }}</span>
          <nuxt-link v-if="p.routeName" :to="{ name: p.routeName, params: p.routeParams }">
            {{ p.text }}
          </nuxt-link>
          <a v-else @click.prevent>{{ p.text }}</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'nuxt/app'

interface nameOpts { [index: string]: string }

interface nameVal { [index: string]: number }

interface linkElem {
  routeName: string
  routeParams: Record<string, any>
  tag: string
  text: string
  id: string
  class: string
}

const routeNames: nameOpts = {
  routes: 'Routes',
  stops: 'Stops'
}

const shorteners: nameVal = {
  feedVersionKey: 8
}

const routeTags: nameOpts = {
  'editor-feedKey': 'Feed',
  'apps-stations-feedVersionKey': 'Version',
  'apps-stations-feedKey-feedVersionKey-stations-stationKey': 'Station',
  'feeds-feedKey': 'Feed',
  'feeds-feedKey-versions-feedVersionKey': 'Version',
  'routes-routeKey': 'Route',
  'stops-stopKey': 'Stop'
}

const props = withDefaults(defineProps<{
  boxed?: boolean
  extraRouteNames?: nameOpts
  extraRouteTags?: nameOpts
}>(), {
  boxed: false,
  extraRouteNames: () => ({}),
  extraRouteTags: () => ({})
})

const classes = computed(() => {
  return 'breadcrumb ' + (props.boxed ? 'box' : '')
})

// Watch on changes to route
const curRoute = useRoute()
const router = useRouter()
const updateKey = computed(() => {
  return String(curRoute.name)
})

const abbrs: Record<string, string> = {
  id: 'ID',
  api: 'API',
  graphql: 'GraphQL',
  gtfs: 'GTFS',
  gbfs: 'GBFS',
  rest: 'REST'
}

function capitalize (str: string) {
  if (abbrs[str]) {
    return abbrs[str]
  }
  return str.length
    ? str[0]?.toUpperCase()
    + str.slice(1).toLowerCase()
    : ''
}

function titleize (str: string) {
  const ret = []
  for (const s of str.split(/[\s\-_]/)) {
    ret.push(capitalize(s))
  }
  return ret.join(' ')
}

function makeNav () {
  const routePath = curRoute.name
  const routeParams = curRoute.params
  const routeFragments = String(routePath || '').split('-')
  const ret: linkElem[] = []
  const foundParams: Record<string, any> = {}
  ret.push({
    class: '',
    id: 'index',
    routeName: 'index',
    text: 'Home',
    routeParams: {},
    tag: ''
  })
  if (routeFragments.length === 1 && routeFragments[0] === 'index') {
    return ret
  }
  for (let i = 0; i < routeFragments.length; i++) {
    const element = routeFragments[i]
    if (!element) continue
    const routeId = String(routeFragments.slice(0, i + 1).join('-'))
    const slug = routeParams.slug
    let routeName = routeId

    // Get matching parameters
    if (routeParams[element]) {
      foundParams[element] = routeParams[element]
    }

    // Get display text
    let text = ''
    let tag = ''
    if (routeNames[routeId]) {
      text = routeNames[routeId]
    } else if (props.extraRouteNames[routeId]) {
      text = props.extraRouteNames[routeId]
    } else if (routeParams[element]) {
      text = String(routeParams[element])
    } else if (router.hasRoute(routeId)) {
      text = capitalize(element)
    }
    // Check text length
    const shortenLength = element ? (shorteners[element] || 128) : 128
    if (shortenLength && text.length > shortenLength) {
      text = text.slice(0, shortenLength) + '…'
    }

    // Get tag
    if (routeTags[routeId]) {
      tag = routeTags[routeId]
    } else if (props.extraRouteTags[routeId]) {
      tag = props.extraRouteTags[routeId]
    }

    // Check if route exists
    if (slug && Array.isArray(slug) && slug.length > 0 && router.hasRoute(routeId + '-slug')) {
      routeName = routeId + '-slug'
    }

    // Do not try to create a link if route name does not exist
    if (!router.hasRoute(routeName)) {
      routeName = ''
    }

    // Nothing to display
    if (!routeName && !text) {
      continue
    }

    // Add to crumbs
    ret.push({
      class: routeName ? '' : 'is-active',
      id: routeId,
      routeParams: Object.assign({}, foundParams),
      tag,
      routeName,
      text
    })

    if (slug && Array.isArray(slug) && slug.length > 0) {
      for (const [sli, sl] of Array.from(slug).entries()) {
        if (!sl) {
          continue
        }
        ret.push({
          class: routeName ? '' : 'is-active',
          id: routeId,
          routeParams: Object.assign({}, foundParams, { slug: slug.slice(0, sli + 1) }),
          tag,
          routeName,
          text: titleize(sl)
        })
      }
      // Skip processing of split path elements
      break
    }
  }
  return ret
}
</script>

<style scoped>
nav .tag {
  margin-left: 10px;
}
</style>
