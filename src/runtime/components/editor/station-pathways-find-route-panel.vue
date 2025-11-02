<template>
  <nav class="panel station-editor-panel">
    <p class="panel-heading">
      Find Route
    </p>
    <div class="panel-block is-block">
      <div v-if="selectedStopsCount == 1" class="notification">
        <p>
          Click on a second node on the map to select a target destination.
        </p>
      </div>
      <div v-else-if="selectedStopsCount == 2 && (!path || (Array.isArray(path) && path.length === 0))">
        <div class="notification">
          <p>
            <strong>No route found.</strong> There are no pathways connecting the selected stop nodes. If this is not intended, edit the pathways.
          </p>
        </div>
      </div>
      <div v-else-if="path && Array.isArray(path) && path.length > 0">
        <tl-editor-path-viewer :path="path" />
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  props: {
    path: {
      type: [Array, Object],
      default: null
    },
    selectedStops: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    selectedStopsCount () {
      return this.selectedStops ? this.selectedStops.length : 0
    }
  }
}
</script>
