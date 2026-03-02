<template>
  <nav class="panel station-editor-panel">
    <p class="panel-heading">
      Add Pathway
    </p>
    <div class="panel-block is-block">
      <tl-apps-stations-pathway-editor
        :station="station"
        :value="pathway"
        @select-stop="$emit('select-stop', $event)"
        @create="$emit('create', $event)"
      />
    </div>
  </nav>
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
