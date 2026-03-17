<template>
  <div>
    <t-dropdown
      :model-value="modelValue"
      selectable
      label="Basemap"
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

<script setup lang="ts">
import { useBasemapLayers } from '../../composables/useBasemapLayers'

interface Props {
  modelValue?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: 'carto'
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const { basemapLayers } = useBasemapLayers()
</script>
