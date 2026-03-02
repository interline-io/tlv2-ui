<template>
  <nav class="panel station-editor-panel">
    <p class="panel-heading">
      <span>Select</span>
      <t-button
        v-if="selectedStopsCount > 0 || selectedPathwaysCount > 0"
        size="small"
        @click="$emit('unselect-all')"
      >
        Unselect All <kbd>ESC</kbd>
      </t-button>
    </p>
    <div class="panel-block is-block">
      <div v-if="selectedStopsCount > 0 || selectedPathwaysCount > 0" class="mb-4">
        <div v-if="lastFilterApplied" class="notification is-info is-light py-2 px-3 mb-3">
          <p class="is-size-7">
            <strong>Filter:</strong> {{ lastFilterApplied }}
          </p>
        </div>
        <div v-if="selectedStopsCount > 0" class="mb-2">
          <div class="menu">
            <ul class="menu-list">
              <li v-for="stop of selectedStops" :key="stop.id">
                <a
                  @click="selectItem('stop', stop.id)"
                  @mouseenter="$emit('hover-stop', stop.id ?? null)"
                  @mouseleave="$emit('hover-stop', null)"
                >
                  {{ stop.stop_name || stop.stop_id }}
                  <span class="has-text-grey is-size-7">
                    ({{ (stop.location_type != null ? locationTypes.get(stop.location_type) : undefined) || 'Node' }}
                    <template v-if="stop.level && stop.level.level_index != null">
                      · L{{ stop.level.level_index }}
                    </template>
                    <template v-else-if="!stop.level">
                      · Unassigned
                    </template>)
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div v-if="selectedPathwaysCount > 0">
          <div class="menu">
            <ul class="menu-list">
              <li v-for="pathway of selectedPathways" :key="pathway.id">
                <a
                  @click="selectItem('pathway', pathway.id)"
                  @mouseenter="$emit('hover-pathway', pathway.id ?? null)"
                  @mouseleave="$emit('hover-pathway', null)"
                >
                  {{ pathway.from_stop.stop_name }} → {{ pathway.to_stop.stop_name }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div v-if="selectedStopsCount === 0 && selectedPathwaysCount === 0">
        <t-field
          v-for="(section, si) of filterSections"
          :key="section.label"
          :label="section.label"
          :class="{ 'mb-3': si < filterSections.length - 1 }"
        >
          <template v-for="(group, gi) of section.groups" :key="group.label">
            <p class="subcategory-label">
              {{ group.label }}
            </p>
            <div class="filter-buttons" :class="{ 'mb-2': gi < section.groups.length - 1 }">
              <t-tooltip v-for="btn of group.buttons" :key="btn.key" :text="btn.tooltip" position="bottom">
                <t-button size="small" :disabled="!btn.count" @click="dispatchFilter(btn.event, btn.arg)">
                  {{ btn.label }}
                </t-button>
              </t-tooltip>
            </div>
          </template>
        </t-field>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, nextTick } from 'vue'
import type { Stop, Pathway } from './station'
import type { FilterCounts } from './station-pathways-filter-counts'

interface FilterButton {
  key: string | number
  label: string
  event: string
  count: number
  tooltip: string
  arg: number | undefined
}

function makeBtn (key: string | number, label: string, event: string, count: number, noun: string, arg?: number): FilterButton {
  const tooltip = count ? `${count} ${noun}` : `No ${noun} in this station`
  return { key, label, event, count, tooltip, arg }
}

interface Props {
  filterCounts?: FilterCounts
  selectedStopsCount: number
  selectedPathwaysCount: number
  selectedStops: Stop[]
  selectedPathways: Pathway[]
  lastFilterApplied?: string
  locationTypes: Map<number, string>
  pathwayModes: Map<number, string>
}

const props = withDefaults(defineProps<Props>(), {
  filterCounts: () => ({} as FilterCounts),
  lastFilterApplied: ''
})

const emit = defineEmits<{
  'unselect-all': []
  'select-stop': [id: number]
  'select-pathway': [id: number]
  'hover-stop': [id: number | null]
  'hover-pathway': [id: number | null]
  'select-location-types': [type: number]
  'select-stops-with-associations': []
  'select-stops-platforms-without-associations': []
  'select-stops-entrances-without-associations': []
  'select-stops-with-paired-pathways': []
  'select-pathway-modes': [mode: number]
  'select-pathways-with-pairs': []
  'select-pathways-oneway': []
  'select-pathways-bidirectional': []
}>()

const filterSections = computed(() => {
  const fc = props.filterCounts
  const stopCounts = fc.stopsByLocationType || {}
  const pwCounts = fc.pathwaysByMode || {}
  return [
    {
      label: 'Select Stops',
      groups: [
        {
          label: 'By type',
          buttons: [...props.locationTypes].map(([type, label]) =>
            makeBtn(type, label, 'select-location-types', stopCounts[type] || 0, `${label} stops`, type)
          )
        },
        {
          label: 'By filter',
          buttons: [
            makeBtn('assoc', 'With associations', 'select-stops-with-associations', fc.stopsWithAssociations || 0, 'stops with associations'),
            makeBtn('plat-no-assoc', 'Platforms w/o assoc.', 'select-stops-platforms-without-associations', fc.platformsWithoutAssociations || 0, 'platforms without associations'),
            makeBtn('ent-no-assoc', 'Entrances w/o assoc.', 'select-stops-entrances-without-associations', fc.entrancesWithoutAssociations || 0, 'entrances without associations'),
            makeBtn('paired-pw', 'With paired pathways', 'select-stops-with-paired-pathways', fc.stopsWithPairedPathways || 0, 'stops with paired pathways')
          ]
        }
      ]
    },
    {
      label: 'Select Pathways',
      groups: [
        {
          label: 'By mode',
          buttons: [...props.pathwayModes].map(([mode, label]) =>
            makeBtn(mode, label, 'select-pathway-modes', pwCounts[mode] || 0, `${label} pathways`, mode)
          )
        },
        {
          label: 'By direction',
          buttons: [
            makeBtn('pairs', 'With pairs', 'select-pathways-with-pairs', fc.pathwaysWithPairs || 0, 'pathways with pairs'),
            makeBtn('oneway', 'One-directional', 'select-pathways-oneway', fc.pathwaysOneway || 0, 'one-directional pathways'),
            makeBtn('bidir', 'Bi-directional', 'select-pathways-bidirectional', fc.pathwaysBidirectional || 0, 'bi-directional pathways')
          ]
        }
      ]
    }
  ]
})

function dispatchFilter (event: string, arg?: number) {
  ;(emit as any)(event, arg)
}

function selectItem (type: 'stop' | 'pathway', id: number | undefined) {
  emit('unselect-all')
  nextTick(() => {
    if (type === 'stop' && id != null) {
      emit('select-stop', id)
    } else if (type === 'pathway' && id != null) {
      emit('select-pathway', id)
    }
  })
}
</script>

<style scoped>
.menu-list {
  max-height: 200px;
  overflow-y: auto;
}

.menu-list a {
  display: flex;
  align-items: center;
  padding: 0.5em 0.75em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: #3273dc;
  transition: background-color 0.2s, color 0.2s;
}

.menu-list a:hover {
  background-color: #f5f5f5;
  color: #363636;
}

.subcategory-label {
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.35rem;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
</style>
