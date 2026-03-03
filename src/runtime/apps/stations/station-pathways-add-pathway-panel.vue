<template>
  <t-card label="Add Pathway" variant="panel" class="station-editor-panel">
    <div>
      <tl-apps-stations-pathway-editor
        :station="station"
        :value="pathway"
        @select-stop="$emit('select-stop', $event)"
        @create="$emit('create', $event)"
      />
    </div>
  </t-card>
</template>

<script setup lang="ts">
import type { Pathway } from './station'
import type { StationData, PathwayData } from './types'

interface Props {
  station: StationData
  pathway: PathwayData
}

defineProps<Props>()
defineEmits<{
  'select-stop': [id: number]
  'create': [pathway: Pathway]
}>()
</script>
