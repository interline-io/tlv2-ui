<template>
  <nav class="panel station-editor-panel">
    <p class="panel-heading">
      <span>Find Route</span>
      <span class="panel-heading-buttons">
        <button class="button is-small" @click="$emit('unselect')">
          Clear <kbd>ESC</kbd>
        </button>
      </span>
    </p>
    <div class="panel-block is-block">
      <div class="field">
        <label class="label is-small">Routing Profile</label>
        <div class="select is-small is-fullwidth">
          <select :value="profile" @change="$emit('update:profile', $event.target.value)">
            <option v-for="p of profiles" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
        </div>
      </div>
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
        <tl-apps-stations-path-viewer
          :path="path"
          @hover-pathway="$emit('hover-pathway', $event)"
        />
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
    },
    profile: {
      type: String,
      default: 'Pathways: Default'
    },
    profiles: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:profile', 'hover-pathway', 'unselect'],
  computed: {
    selectedStopsCount () {
      return this.selectedStops ? this.selectedStops.length : 0
    }
  }
}
</script>

<style scoped>
.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-heading-buttons {
  display: flex;
  gap: 0.5rem;
}

</style>
