<template>
  <div>
    <o-dropdown
      :value="modelValue"
      aria-role="list"
      selectable
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #trigger>
        <button class="button" type="button">
          Basemap &nbsp;
          <o-icon icon="menu-down" />
        </button>
      </template>
      <o-dropdown-item
        v-for="(bm, key) in basemapLayers"
        :key="key"
        :value="key"
        aria-role="listitem"
      >
        {{ bm.label }}
      </o-dropdown-item>
    </o-dropdown>
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
