<template>
  <tl-apps-stations-station-pathways-editor-panel
    v-model:edit-mode="editMode"
    view-heading="View Node"
    edit-heading="Edit Node"
    edit-label="Edit / Move"
    :show-unselect="showUnselect"
    @unselect="$emit('unselect')"
  >
    <template #view>
      <div class="content">
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Stop ID:</label>
          </div>
          <div class="field-body">
            <code>{{ stop.stop_id }}</code>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Name:</label>
          </div>
          <div class="field-body">
            <span>{{ stop.stop_name }}</span>
          </div>
        </div>
        <div v-if="stop.platform_code" class="field is-horizontal">
          <div class="field-label">
            <label class="label">Platform:</label>
          </div>
          <div class="field-body">
            <span>{{ stop.platform_code }}</span>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Type:</label>
          </div>
          <div class="field-body">
            <span>{{ locationTypeName }}</span>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Level:</label>
          </div>
          <div class="field-body">
            <span>{{ levelName }}</span>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Wheelchair:</label>
          </div>
          <div class="field-body">
            <span>{{ stop.wheelchair_boarding === 1 ? 'Accessible' : 'Not accessible' }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div v-if="pathwaysFromStop.length > 0 || pathwaysToStop.length > 0" class="menu">
        <p class="menu-label">
          Navigate to connected pathways
        </p>
        <ul class="menu-list">
          <li v-for="pw of pathwaysFromStop" :key="pw.id">
            <a
              @click="pw.id != null && $emit('select-pathway', pw.id)"
              @mouseenter="$emit('hover-pathway', pw.id ?? null)"
              @mouseleave="$emit('hover-pathway', null)"
            >
              <span class="tl-path-icon"><img :src="pathwayIcon(pw.pathway_mode).url" :title="pathwayIcon(pw.pathway_mode).label"></span>
              <span v-if="pw.is_bidirectional === 1">↔</span>
              <span v-else>→</span>
              {{ pw.to_stop.stop_name }}
            </a>
          </li>
          <li v-for="pw of pathwaysToStop" :key="pw.id">
            <a
              @click="pw.id != null && $emit('select-pathway', pw.id)"
              @mouseenter="$emit('hover-pathway', pw.id ?? null)"
              @mouseleave="$emit('hover-pathway', null)"
            >
              <span class="tl-path-icon"><img :src="pathwayIcon(pw.pathway_mode).url" :title="pathwayIcon(pw.pathway_mode).label"></span>
              <span v-if="pw.is_bidirectional === 1">↔</span>
              <span v-else>←</span>
              {{ pw.from_stop.stop_name }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Mode Switch -->
      <div class="menu">
        <p class="menu-label">
          Switch view
        </p>
        <ul class="menu-list">
          <li>
            <nuxt-link
              :to="{
                name: 'saas-station-editor-feedKey-feedVersionKey-stations-stationKey-diagram',
                params: modeSwitchParams,
                query: modeSwitchQuery,
              }"
            >
              <t-icon icon="chart-timeline" size="small" /> &nbsp; View in Station Diagram
            </nuxt-link>
          </li>
        </ul>
      </div>
    </template>

    <template #edit>
      <p class="notification is-info is-light py-2 px-3 mb-3 is-size-7">
        Drag the node on the map to reposition it.
      </p>
      <tl-apps-stations-stop-editor
        :station="station"
        :value="stop"
        :stop-associations-enabled="stopAssociationsEnabled"
        :show-pathways="false"
        @delete="$emit('delete', $event)"
        @update="$emit('update', $event)"
        @select-pathway="$emit('select-pathway', $event)"
      />
    </template>
  </tl-apps-stations-station-pathways-editor-panel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LocationTypes } from './basemaps'
import { PathwayModeIcons } from '../../lib/pathways/pathway-icons'
import type { Station, Stop, Pathway } from './station'
import type { StationData } from './types'

const editMode = defineModel<boolean>('editMode', { default: false })

interface Props {
  station: StationData | Station
  stop: Stop
  stopAssociationsEnabled?: boolean
  showUnselect?: boolean
  feedKey: string
  feedVersionKey: string
  stationKey: string
}

const props = withDefaults(defineProps<Props>(), {
  stopAssociationsEnabled: false,
  showUnselect: false
})

defineEmits<{
  'delete': [stop: Stop]
  'update': [stop: Stop]
  'delete-association': [stop: Stop]
  'select-pathway': [id: number]
  'hover-pathway': [id: number | null]
  'unselect': []
}>()

const modeSwitchParams = computed(() => ({
  feedKey: props.feedKey,
  feedVersionKey: props.feedVersionKey,
  stationKey: props.stationKey
}))

const modeSwitchQuery = computed(() => ({
  selectedStop: props.stop.id
}))

const locationTypeName = computed(() => {
  const type = props.stop.location_type
  for (const [key, value] of LocationTypes.entries()) {
    if (key === type) {
      return value
    }
  }
  return 'Unknown'
})

const levelName = computed(() => props.stop.level?.level_name || 'None')

const pathwaysFromStop = computed<Pathway[]>(() => props.stop.pathways_from_stop || [])
const pathwaysToStop = computed<Pathway[]>(() => props.stop.pathways_to_stop || [])

function pathwayIcon (mode: number | undefined): { url: string, label: string } {
  if (mode == null) return { url: '', label: '' }
  const m = PathwayModeIcons[mode]
  if (!m) return { url: '', label: '' }
  return { url: `/icons/${m.altIcon ?? m.icon}.png`, label: m.label }
}
</script>

<style scoped>
.field.is-horizontal .field-label {
  flex-grow: 0;
  flex-basis: 120px;
  text-align: left;
}

.field.is-horizontal .field-body {
  flex-grow: 1;
}

.tl-path-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  margin-right: 0.5rem;
}

.tl-path-icon img {
  width: 100%;
  height: 100%;
}

.menu-list a {
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  color: #3273dc;
  transition: background-color 0.2s, color 0.2s;
}

.menu-list a:hover {
  background-color: #f5f5f5;
  color: #363636;
}
</style>
