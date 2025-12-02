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

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useRouteResolver } from '../../../composables/useRouteResolver'

export default defineComponent({
  props: {
    params: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({})
    },
    query: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({})
    }
  },
  setup () {
    const { resolve } = useRouteResolver()
    return { resolve }
  },
  data () {
    return {
      routeKeys: {
        pathways: 'apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways',
        diagram: 'apps-stations-feedKey-feedVersionKey-stations-stationKey-diagram'
      }
    }
  },
  computed: {
    selectedMode (): string {
      // TODO: pass this in?
      const currentRoute = this.$route.name
      for (const [k, r] of Object.entries(this.routeKeys)) {
        if (currentRoute === this.resolve(r)) {
          return k
        }
      }
      return ''
    }
  }
})
</script>
