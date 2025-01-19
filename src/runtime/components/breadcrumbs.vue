<template>
  <div>
    <nav :key="updateKey" :class="classes" aria-label="breadcrumbs">
      <ul>
        <li v-for="p of makeNav()" :key="p.id" :class="p.class">
          <span v-if="p.tag" class="tag is-small">{{ p.tag }}</span>
          <nuxt-link v-if="p.routeName" :to="{name:p.routeName, params: p.routeParams}">
            {{ p.text }}
          </nuxt-link>
          <a v-else href="#">{{ p.text }}</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter, useEventBus, ref, computed } from '#imports'
import { type RouteParams } from '#vue-router'
interface nameOpts { [index: string]: string}

interface nameVal { [index: string]: number}

interface linkElem {
  routeName: string,
  routeParams: RouteParams,
  tag: string,
  text: string,
  id: string,
  class: string
}

const routeNames: nameOpts = {
  routes: 'Routes',
  stops: 'Stops'
}

const shorteners:nameVal = {
  feedVersionKey: 8
}

const routeTags:nameOpts = {
  'editor-feedKey-feedVersionKey-stations-stationKey': 'Station',
  'editor-feedKey': 'Feed',
  'editor-feedKey-feedVersionKey': 'Version',
  'feeds-feedKey': 'Feed',
  'feeds-feedKey-versions-feedVersionKey': 'Version',
  'routes-routeKey': 'Route',
  'stops-stopKey': 'Stop'
}

const props = defineProps({
  boxed: { type: Boolean, default: false },
  extraRouteNames: { type: Object as ()=>nameOpts, default() { return {} } },
  extraRouteTags: { type: Object as ()=>nameOpts, default() { return {} } }
})

const classes = computed(() => {
  return 'breadcrumb ' + (props.boxed ? 'box' : '')
})

// Override names
const mergedParams = new Map<string, string>()
const forceUpdate = ref(0)
useEventBus().$on('setParamKey', (k: string, v: string) => {
  console.log('updating breadcrumbs:', k, v)
  mergedParams.set(k, v)
  forceUpdate.value += 1
})

// Watch on changes to route and forceUpdate
const curRoute = useRoute()
const updateKey = computed(() => {
  return `${String(curRoute.name)}:${forceUpdate.value}`
})

const abbrs: Record<string, string> = {
  id: 'ID',
  api: 'API',
  graphql: 'GraphQL',
  gtfs: 'GTFS',
  gbfs: 'GBFS',
  rest: 'REST'
}

function capitalize (str:string) {
  if (abbrs[str]) {
    return abbrs[str]
  }
  return str.length
    ? str[0].toUpperCase() +
      str.slice(1).toLowerCase()
    : ''
}

function titleize(str:string) {
  const ret = []
  for (const s of str.split(/[\s-_]/)) {
    ret.push(capitalize(s))
  }
  return ret.join(' ')
}

function makeNav() {
  const router = useRouter()
  const routePath = useRoute().name
  const routeParams = useRoute().params
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
    const routeId = String(routeFragments.slice(0, i + 1).join('-'))
    const slug = routeParams.slug
    let routeName = routeId

    // Check if route exists
    if (slug?.length > 0 && router.hasRoute(routeId + '-slug')) {
      routeName = routeId + '-slug'
    }
    if (!router.hasRoute(routeName)) {
      continue
    }

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
    } else if (mergedParams.get(element)) {
      text = mergedParams.get(element) || ''
    } else if (routeParams[element]) {
      text = String(routeParams[element])
    } else if (router.hasRoute(routeId)) {
      text = capitalize(element)
    }
    // Check text length
    const shortenLength = shorteners[element] || 128
    if (shortenLength && text.length > shortenLength) {
      text = text.substr(0, shortenLength) + '…'
    }

    // Get tag
    if (routeTags[routeId]) {
      tag = routeTags[routeId]
    } else if (props.extraRouteTags[routeId]) {
      tag = props.extraRouteTags[routeId]
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
    if (slug?.length > 0) {
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
