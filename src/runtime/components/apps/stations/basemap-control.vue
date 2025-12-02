<template>
  <div>
    <t-dropdown
      :model-value="modelValue"
      selectable
      trigger-label="Basemap"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <t-dropdown-item
        v-for="(bm, key) in basemapLayers"
        :key="key"
        :value="key"
      >
        {{ bm.label }}
      </t-dropdown-item>
    </t-dropdown>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { getBasemapLayers } from './basemaps'
import type { BasemapLayer } from './types'

export default defineComponent({
  props: {
    modelValue: { type: String, default: 'carto' }
  },
  emits: ['update:modelValue'],
  data () {
    return {
      basemapLayers: getBasemapLayers() as Record<string, BasemapLayer>
    }
  }
})
</script>
