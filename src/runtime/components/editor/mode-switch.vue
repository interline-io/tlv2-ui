<template>
  <div class="buttons has-addons">
    <label class="label pr-2">View this stop in:</label>
    <nuxt-link
      :to="{
        name: routeKeys['pathways'],
        params: params,
        query: query
      }"
      class="button is-primary is-expanded is-small"
      :class="selectedMode === 'pathways' ? 'is-active' : 'is-outlined'"
    >
      Pathways Editor
    </nuxt-link>
    <nuxt-link
      :to="{
        name: routeKeys['diagram'],
        params: params,
        query: query
      }"
      class="button is-primary is-expanded is-small"
      :class="selectedMode === 'diagram' ? 'is-active' : 'is-outlined'"
    >
      Diagram Viewer
    </nuxt-link>
  </div>
</template>

<script>
import { useEditorRoutes } from '../../composables/useEditorRoutes'

export default {
  props: {
    params: {
      type: Object,
      default: () => {}
    },
    query: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    const routes = useEditorRoutes()
    return {
      routeKeys: {
        pathways: routes.stationPathways,
        diagram: routes.stationDiagram
      }
    }
  },
  computed: {
    selectedMode () {
      // TODO: pass this in?
      const currentRoute = this.$route.name
      for (const [k, r] in Object.entries(this.routeKeys)) {
        if (currentRoute === r) {
          return k
        }
      }
      return ''
    }
  }
}
</script>
