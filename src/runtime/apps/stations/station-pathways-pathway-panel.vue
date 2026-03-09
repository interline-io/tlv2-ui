<template>
  <tl-apps-stations-station-pathways-editor-panel
    v-model:edit-mode="editMode"
    view-heading="View Pathway"
    edit-heading="Edit Pathway"
    :show-unselect="showUnselect"
    :read-only="readOnly"
    @unselect="$emit('unselect')"
  >
    <template #view>
      <div class="content">
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Pathway ID:</label>
          </div>
          <div class="field-body">
            <code>{{ pathway.pathway_id }}</code>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Mode:</label>
          </div>
          <div class="field-body">
            <span>{{ pathwayModeName }}</span>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Direction:</label>
          </div>
          <div class="field-body">
            <span>{{ pathway.is_bidirectional === 1 ? 'Bidirectional' : 'One-way' }}</span>
          </div>
        </div>
        <div v-if="pathway.length" class="field is-horizontal">
          <div class="field-label">
            <label class="label">Length:</label>
          </div>
          <div class="field-body">
            <span>{{ pathway.length }}m</span>
          </div>
        </div>
        <div v-if="pathway.traversal_time" class="field is-horizontal">
          <div class="field-label">
            <label class="label">Time:</label>
          </div>
          <div class="field-body">
            <span>{{ pathway.traversal_time }}s</span>
          </div>
        </div>
        <div v-if="pathway.stair_count" class="field is-horizontal">
          <div class="field-label">
            <label class="label">Stairs:</label>
          </div>
          <div class="field-body">
            <span>{{ pathway.stair_count }}</span>
          </div>
        </div>
        <div v-if="pathway.signposted_as" class="field is-horizontal">
          <div class="field-label">
            <label class="label">Signposted as:</label>
          </div>
          <div class="field-body">
            <span>{{ pathway.signposted_as }}</span>
          </div>
        </div>
      </div>

      <!-- Mode Switch -->
      <div v-if="feedKey" class="menu">
        <p class="menu-label">
          Switch view
        </p>
        <ul class="menu-list">
          <li v-if="activeTab !== 'pathways-v2'">
            <tl-link
              route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways-v2"
              :to="{ params: modeSwitchParams, query: modeSwitchQuery }"
            >
              <t-icon icon="chart-timeline-variant-shimmer" size="small" /> &nbsp; Draw Pathways (v2 Preview)
            </tl-link>
          </li>
          <li v-if="activeTab !== 'diagram'">
            <tl-link
              route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-diagram"
              :to="{ params: modeSwitchParams, query: modeSwitchQuery }"
            >
              <t-icon icon="chart-timeline" size="small" /> &nbsp; Station Diagram
            </tl-link>
          </li>
          <li v-if="activeTab !== 'isometric'">
            <tl-link
              route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-isometric"
              :to="{ params: modeSwitchParams, query: modeSwitchQuery }"
            >
              <t-icon icon="cube-outline" size="small" /> &nbsp; Isometric View
            </tl-link>
          </li>
        </ul>
      </div>

      <!-- Navigation -->
      <div class="menu">
        <p class="menu-label">
          Navigate to Connected Nodes
        </p>
        <ul class="menu-list">
          <li>
            <a
              @click="pathway.from_stop.id != null && $emit('select-stop', pathway.from_stop.id)"
              @mouseenter="$emit('hover-stop', pathway.from_stop.id ?? null)"
              @mouseleave="$emit('hover-stop', null)"
            >
              <span v-if="pathway.is_bidirectional === 1">↔</span>
              <span v-else>←</span>
              {{ pathway.from_stop.stop_name || `Node ${pathway.from_stop.stop_id}` }}
              <span class="has-text-grey is-size-7">
                <template v-if="fromStopLevel">
                  <template v-if="fromStopLevel.level_index != null">
                    (Level: {{ fromStopLevel.level_index }})
                  </template>
                  <template v-else-if="fromStopLevel.level_name">
                    (Level: {{ fromStopLevel.level_name }})
                  </template>
                  <template v-else>
                    (Level ID: {{ pathway.from_stop.level.id }})
                  </template>
                </template>
                <template v-else>
                  (Unassigned)
                </template>
              </span>
            </a>
          </li>
          <li>
            <a
              @click="pathway.to_stop.id != null && $emit('select-stop', pathway.to_stop.id)"
              @mouseenter="$emit('hover-stop', pathway.to_stop.id ?? null)"
              @mouseleave="$emit('hover-stop', null)"
            >
              <span v-if="pathway.is_bidirectional === 1">↔</span>
              <span v-else>→</span>
              {{ pathway.to_stop.stop_name || `Node ${pathway.to_stop.stop_id}` }}
              <span class="has-text-grey is-size-7">
                <template v-if="toStopLevel">
                  <template v-if="toStopLevel.level_index != null">
                    (Level: {{ toStopLevel.level_index }})
                  </template>
                  <template v-else-if="toStopLevel.level_name">
                    (Level: {{ toStopLevel.level_name }})
                  </template>
                  <template v-else>
                    (Level ID: {{ pathway.to_stop.level.id }})
                  </template>
                </template>
                <template v-else>
                  (Unassigned)
                </template>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </template>

    <template #edit>
      <tl-apps-stations-pathway-editor
        :station="station"
        :value="pathway"
        @select-stop="$emit('select-stop', $event)"
        @delete="$emit('delete', $event)"
        @update="$emit('update', $event)"
      />
    </template>
  </tl-apps-stations-station-pathways-editor-panel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { PathwayModes } from '../../lib/pathways/pathway-icons'
import { SWITCH_VIEW_ROUTE_KEYS } from './basemaps'
import { useRouteResolver } from '../../composables/useRouteResolver'
import type { Station, Pathway } from './station'
import type { StationData } from './types'

interface Props {
  station: StationData | Station
  pathway: Pathway
  showUnselect?: boolean
  readOnly?: boolean
  feedKey?: string
  feedVersionKey?: string
  stationKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  showUnselect: false,
  readOnly: false
})

const editMode = defineModel<boolean>('editMode', { default: false })

defineEmits<{
  'select-stop': [id: number]
  'hover-stop': [id: number | null]
  'delete': [pathway: Pathway]
  'update': [pathway: Pathway]
  'unselect': []
}>()

const { resolve } = useRouteResolver()
const route = useRoute()

const routeKeys = SWITCH_VIEW_ROUTE_KEYS

const activeTab = computed(() => {
  for (const [k, r] of Object.entries(routeKeys)) {
    if (route.name === resolve(r)) return k
  }
  return ''
})

const modeSwitchParams = computed(() => ({
  feedKey: props.feedKey,
  feedVersionKey: props.feedVersionKey,
  stationKey: props.stationKey
}))

const modeSwitchQuery = computed(() => ({
  selectedPathway: props.pathway.id
}))

const pathwayModeName = computed(() => {
  for (const [mode, label] of PathwayModes) {
    if (mode === props.pathway.pathway_mode) {
      return label
    }
  }
  return 'Unknown'
})

const fromStopLevel = computed(() => {
  if (!props.pathway.from_stop.level?.id) {
    return null
  }
  return (props.station as Station).levels?.find(l => l.id === props.pathway.from_stop.level.id) ?? null
})

const toStopLevel = computed(() => {
  if (!props.pathway.to_stop.level?.id) {
    return null
  }
  return (props.station as Station).levels?.find(l => l.id === props.pathway.to_stop.level.id) ?? null
})
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
