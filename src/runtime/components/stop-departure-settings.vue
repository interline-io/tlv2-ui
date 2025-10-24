<template>
  <div class="search-options mb-2">
    <o-field horizontal label="Search radius">
      <o-select
        v-model="searchRadius"
        size="small"
      >
        <option v-for="r of allowedRadius" :key="r" :value="r">
          {{ r }}m
        </option>
      </o-select>
    </o-field>

    <o-field horizontal label="Options">
      <o-checkbox
        v-model="autoRefresh"
        size="small"
      >
        Auto-refresh
      </o-checkbox>
      <o-checkbox
        v-model="useServiceWindow"
        size="small"
      >
        Fallback service day
      </o-checkbox>
    </o-field>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  allowedRadius?: number[]
}>()

// Models
const searchRadius = defineModel<number>('searchRadius', { default: 200 })
const autoRefresh = defineModel<boolean>('autoRefresh', { default: true })
const useServiceWindow = defineModel<boolean>('useServiceWindow', { default: false })
</script>
