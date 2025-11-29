<template>
  <div>
    <t-dropdown
      :model-value="modelValue"
      aria-role="list"
      selectable
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #trigger="{ toggle }">
        <button class="button" type="button" @click="toggle">
          Basemap &nbsp;
          <t-icon icon="menu-down" />
        </button>
      </template>
      <t-dropdown-item
        v-for="(bm, key) in basemapLayers"
        :key="key"
        :value="key"
        aria-role="listitem"
      >
        {{ bm.label }}
      </t-dropdown-item>
    </t-dropdown>
  </div>
</template>

<script>
import { getBasemapLayers } from './basemaps'

export default {
  props: {
    modelValue: { type: String, default: 'carto' }
  },
  emits: ['update:modelValue'],
  data () {
    return {
      basemapLayers: getBasemapLayers()
    }
  }
}
</script>
