<template>
  <div class="buttons has-addons">
    <label class="label pr-2">View this stop in:</label>
    <nuxt-link
      :to="{
        name: 'editor-feedKey-feedVersionKey-stations-stationKey-pathways',
        params: params,
        query: query
      }"
      class="button is-primary is-expanded is-small"
      :class="$route.name === 'editor-feedKey-feedVersionKey-stations-stationKey-pathways' ? 'is-active' : 'is-outlined'"
    >
      Pathways Editor
    </nuxt-link>
    <nuxt-link
      :to="{
        name: 'editor-feedKey-feedVersionKey-stations-stationKey-diagram',
        params: params,
        query: query
      }"
      class="button is-primary is-expanded is-small"
      :class="$route.name === 'editor-feedKey-feedVersionKey-stations-stationKey-diagram' ? 'is-active' : 'is-outlined'"
    >
      Diagram Viewer
    </nuxt-link>
  </div>
</template>

<script>
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
  }
}
</script>
