<template>
  <nav class="panel station-editor-panel">
    <p class="panel-heading">
      <span>Find Route</span>
      <t-button size="small" @click="$emit('unselect')">
        Clear <kbd>ESC</kbd>
      </t-button>
    </p>
    <div class="panel-block is-block">
      <div class="field">
        <label class="label is-small">Routing Profile</label>
        <t-select
          size="small"
          fullwidth
          :model-value="profile"
          @update:model-value="$emit('update:profile', $event)"
        >
          <option v-for="p of profiles" :key="p" :value="p">
            {{ p }}
          </option>
        </t-select>
      </div>
      <div v-if="selectedStopsCount === 1" class="notification">
        <p>
          Click on a second node on the map to select a target destination.
        </p>
      </div>
      <div v-else-if="selectedStopsCount === 2 && (!path || (Array.isArray(path) && path.length === 0))">
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

<script setup lang="ts">
import { computed } from 'vue'
import type { Stop } from './station'

interface Props {

  path?: any[] | null
  selectedStops?: Stop[]
  profile?: string
  profiles?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  path: null,
  selectedStops: () => [],
  profile: 'Pathways: Default',
  profiles: () => []
})

defineEmits<{
  'update:profile': [value: string]
  'hover-pathway': [id: number | null]
  'unselect': []
}>()

const selectedStopsCount = computed(() => props.selectedStops?.length ?? 0)
</script>
