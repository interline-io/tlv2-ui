<template>
  <nav class="panel station-editor-panel">
    <p class="panel-heading">
      Add Node
    </p>
    <div class="panel-block is-block">
      <p class="notification">
        To create a node, select which level it will be located on and then click/tap on the map.
      </p>
      <t-field label="Level">
        <t-dropdown
          :model-value="selectedLevel"
          @update:model-value="$emit('update:selected-level', $event)"
        >
          <template #trigger>
            <t-button type="button">
              {{ levelName }} &nbsp;
              <t-icon icon="menu-down" />
            </t-button>
          </template>
          <t-dropdown-item v-for="level of levels" :key="level.id" :value="level.id">
            <h3>{{ level.level_name }}</h3>
            <small> {{ level.stops.length }} nodes</small>
          </t-dropdown-item>
        </t-dropdown>
      </t-field>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Level } from './station'

interface Props {
  selectedLevel?: number | string | null
  levels: Level[]
  levelIndex: Record<string | number, Level>
}

const props = withDefaults(defineProps<Props>(), {
  selectedLevel: null
})

defineEmits<{
  'update:selected-level': [value: number | string]
}>()

const levelName = computed(() => props.levelIndex[props.selectedLevel!]?.level_name ?? 'None')
</script>
