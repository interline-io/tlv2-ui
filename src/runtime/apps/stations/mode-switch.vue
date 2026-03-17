<template>
  <div class="buttons has-addons">
    <label class="label pr-2">View this stop in:</label>
    <tl-link
      route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways"
      :to="{
        params: params,
        query: query,
      }"
      class="button is-primary is-expanded is-small"
      :class="selectedMode === 'pathways' ? 'is-active' : 'is-outlined'"
    >
      Pathways Editor
    </tl-link>
    <tl-link
      route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-diagram"
      :to="{
        params: params,
        query: query,
      }"
      class="button is-primary is-expanded is-small"
      :class="selectedMode === 'diagram' ? 'is-active' : 'is-outlined'"
    >
      Diagram Viewer
    </tl-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRouteResolver } from '../../composables/useRouteResolver'

interface Props {
  params?: Record<string, string>
  query?: Record<string, string>
}

withDefaults(defineProps<Props>(), {
  params: () => ({}),
  query: () => ({})
})

const { resolve } = useRouteResolver()
const route = useRoute()

const routeKeys = {
  pathways: 'apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways',
  diagram: 'apps-stations-feedKey-feedVersionKey-stations-stationKey-diagram'
}

const selectedMode = computed((): string => {
  const currentRoute = route.name
  for (const [k, r] of Object.entries(routeKeys)) {
    if (currentRoute === resolve(r)) {
      return k
    }
  }
  return ''
})
</script>
