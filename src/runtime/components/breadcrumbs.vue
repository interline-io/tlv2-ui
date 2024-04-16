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

interface nameOpts { [index: string]: string}

interface nameVal { [index: string]: number}

interface linkElem {
  routeName: string,
  routeParams: Object,
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
  return `${curRoute.name}:${forceUpdate.value}`
})

function capitalize (str:String) {
  return str.length
    ? str[0].toUpperCase() +
      str.slice(1).toLowerCase()
    : ''
}

function makeNav() {
  const router = useRouter()
  const routePath = useRoute().name
  const routeParams = useRoute().params
  const routeFragments = String(routePath || '').split('-')
  const ret: linkElem[] = []
  const foundParams = {}
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
    let text = ''
    let routeName = ''
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
    } else {
      continue
    }

    if (routeParams[element]) {
      foundParams[element] = routeParams[element]
    }

    if (routeTags[routeId]) {
      tag = routeTags[routeId]
    } else if (props.extraRouteTags[routeId]) {
      tag = props.extraRouteTags[routeId]
    }

    if (router.hasRoute(routeId)) {
      routeName = routeId
    }
    const shortenLength = shorteners[element] || 128
    if (shortenLength && text.length > shortenLength) {
      text = text.substr(0, shortenLength) + '…'
    }

    // Prepare for rendering
    ret.push({
      class: routeName ? '' : 'is-active',
      id: routeId,
      routeParams: Object.assign({}, foundParams),
      tag,
      routeName,
      text
    })
  }
  return ret
}

</script>
