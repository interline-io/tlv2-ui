<template>
  <o-select
    :model-value="modelValue?.toString() || null"
    placeholder="Route vehicle type"
    @update:model-value="(value: string | null | undefined) => emit('update:modelValue', value ? parseInt(value) : null)"
  >
    <option :value="null">
      All
    </option>
    <option v-for="v, k of routeTypes" :key="k" :value="k">
      {{ v }}
    </option>
  </o-select>
</template>

<script setup lang="ts">
// GTFS route types mapping
const routeTypes: Record<number, string> = {
  0: 'Tram',
  1: 'Metro',
  2: 'Rail',
  3: 'Bus',
  4: 'Ferry',
  5: 'Cable car',
  6: 'Aerial lift',
  7: 'Funicular',
  11: 'Trolleybus',
  12: 'Monorail'
}

// Props
withDefaults(defineProps<{
  modelValue?: string | number | null
}>(), {
  modelValue: 0
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()
</script>
