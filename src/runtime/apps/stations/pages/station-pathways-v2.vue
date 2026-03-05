<template>
  <div v-if="station" class="station-pathways-container">
    <tl-apps-stations-station-mode-tabs
      :station="station"
      :feed-key="feedKey"
      :feed-version-key="feedVersionKey"
      :station-key="stationKey"
      :stop-associations-enabled="stopAssociationsEnabled"
    />
    <div v-if="ready" class="columns pathways-columns">
      <div class="column is-narrow">
        <div class="tl-editor-info">
          <!-- Mode Selection -->
          <t-card label="Mode" variant="panel" class="station-editor-panel">
            <div class="buttons has-addons is-fullwidth" role="group" aria-label="Editor mode selection">
              <button
                class="button"
                :class="{ 'is-primary is-selected': selectMode === 'select' }"
                aria-label="Switch to select mode"
                :aria-pressed="selectMode === 'select'"
                @click="selectMode = 'select'"
              >
                Select <kbd>V</kbd>
              </button>
              <button
                class="button"
                :class="{ 'is-primary is-selected': selectMode === 'add-node' }"
                aria-label="Switch to add node mode"
                :aria-pressed="selectMode === 'add-node'"
                @click="selectMode = 'add-node'"
              >
                Add Node <kbd>N</kbd>
              </button>
              <button
                class="button"
                :class="{ 'is-primary is-selected': selectMode === 'add-pathway' }"
                :disabled="!(selectedStop && selectedSource)"
                :title="!(selectedStop && selectedSource) ? 'Select two nodes to add a pathway' : ''"
                aria-label="Switch to add pathway mode"
                :aria-pressed="selectMode === 'add-pathway'"
                @click="selectMode = 'add-pathway'"
              >
                Add Pathway
              </button>
              <button
                class="button"
                :class="{ 'is-primary is-selected': selectMode === 'find-route' }"
                :disabled="selectedStops.length !== 1"
                :title="selectedStops.length !== 1 ? 'Select a starting node before entering Find Route mode' : ''"
                aria-label="Switch to find route mode"
                :aria-pressed="selectMode === 'find-route'"
                @click="selectMode = 'find-route'"
              >
                Find Route <kbd>F</kbd>
              </button>
              <button
                class="button"
                :class="{ 'is-primary is-selected': selectMode === 'export' }"
                aria-label="Switch to export mode"
                :aria-pressed="selectMode === 'export'"
                @click="selectMode = 'export'"
              >
                Export
              </button>
            </div>
          </t-card>

          <!-- Map Controls -->
          <t-card label="Map Display" variant="panel" class="station-editor-panel">
            <div>
              <div class="field collapse-trigger-field" style="cursor:pointer" @click="levelsOpen = !levelsOpen">
                <label class="label is-small collapse-trigger-label" style="cursor:pointer">
                  <t-icon :icon="levelsOpen ? 'menu-down' : 'menu-right'" size="small" />
                  <span>Levels</span>
                </label>
              </div>
              <div v-show="levelsOpen" class="ml-4">
                <t-checkbox-group
                  v-model="selectedLevelKeys"
                  :options="sortedStationLevels"
                  value-field="levelKey"
                  hide-select-all
                >
                  <template #option="{ option }">
                    <span v-if="option.level_index != null" class="has-text-weight-semibold">{{ option.level_index }}:</span>
                    {{ option.level_name }}
                    <span class="has-text-grey is-size-7">({{ option.stops.length }} nodes)</span>
                  </template>
                </t-checkbox-group>
              </div>
            </div>

            <div>
              <div class="field collapse-trigger-field" style="cursor:pointer" @click="basemapOpen = !basemapOpen">
                <label class="label is-small collapse-trigger-label" style="cursor:pointer">
                  <t-icon :icon="basemapOpen ? 'menu-down' : 'menu-right'" size="small" />
                  <span>Basemap</span>
                </label>
              </div>
              <div v-show="basemapOpen">
                <div v-for="(bm, key) in basemapLayers" :key="key" class="field ml-4">
                  <t-radio
                    v-model="basemap"
                    :native-value="String(key)"
                  >
                    {{ bm.label }}
                  </t-radio>
                </div>
              </div>
            </div>

            <div>
              <div class="field collapse-trigger-field" style="cursor:pointer" @click="legendOpen = !legendOpen">
                <label class="label is-small collapse-trigger-label" style="cursor:pointer">
                  <t-icon :icon="legendOpen ? 'menu-down' : 'menu-right'" size="small" />
                  <span>Legend</span>
                </label>
              </div>
              <div v-show="legendOpen" class="ml-4">
                <ul>
                  <li class="legend-item circle-indicator">
                    circles are nodes (stops) with number for assigned level
                  </li>
                  <li class="legend-item yellow-ring">
                    yellow highlight indicates selected or hovered node/pathway
                  </li>
                  <li class="legend-item blue-rectangle">
                    blue pathways are on the same level
                  </li>
                  <li class="legend-item red-rectangle">
                    red pathways connect two separate levels
                  </li>
                  <li class="legend-item purple-rectangle">
                    purple lines show distance to associated stop
                  </li>
                </ul>
              </div>
            </div>
          </t-card>

          <!-- SELECT -->
          <tl-apps-stations-station-pathways-select-panel
            v-if="selectMode === 'select'"
            :filter-counts="filterCounts"
            :selected-stops-count="selectedStops.length"
            :selected-pathways-count="selectedPathways.length"
            :selected-stops="selectedStops"
            :selected-pathways="selectedPathways"
            :last-filter-applied="lastFilterApplied"
            :location-types="LocationTypes"
            :pathway-modes="PathwayModes"
            @unselect-all="unselectAll"
            @select-stop="selectStop"
            @select-pathway="selectPathway"
            @hover-stop="hoverStopId = $event"
            @hover-pathway="hoverPathwayId = $event"
            @select-location-types="selectLocationTypes"
            @select-stops-with-associations="selectStopsWithAssociations"
            @select-stops-platforms-without-associations="selectStopsPlatformsWithoutAssociations"
            @select-stops-entrances-without-associations="selectStopsEntrancesWithoutAssociations"
            @select-stops-with-paired-pathways="selectStopsWithPairedPathways"
            @select-pathway-modes="selectPathwayModes"
            @select-pathways-with-pairs="selectPathwaysWithPairs"
            @select-pathways-oneway="selectPathwaysOneway"
            @select-pathways-bidirectional="selectPathwaysBidirectional"
          />

          <tl-apps-stations-station-pathways-add-pathway-panel
            v-else-if="selectMode === 'add-pathway'"
            :station="station"
            :pathway="newPathway()"
            @select-stop="selectStop"
            @create="createPathwayHandler"
          />

          <template v-if="selectMode === 'edit-pathway'">
            <tl-apps-stations-station-pathways-pathway-panel
              v-for="spw of selectedPathways"
              :key="spw.id"
              v-model:edit-mode="pathwayEditMode"
              :station="station"
              :pathway="spw"
              :show-unselect="selectedStops.length > 0 || selectedPathways.length > 0"
              @select-stop="selectStop"
              @hover-stop="hoverStopId = $event"
              @delete="deletePathwayHandler"
              @update="updatePathwayHandler"
              @unselect="unselectAll"
            />
          </template>

          <template v-else-if="selectMode === 'edit-node'">
            <tl-apps-stations-station-pathways-node-panel
              v-for="ss of selectedStops"
              :key="ss.id"
              v-model:edit-mode="nodeEditMode"
              :station="station"
              :stop="ss"
              :stop-associations-enabled="stopAssociationsEnabled"
              :show-unselect="selectedStops.length > 0 || selectedPathways.length > 0"
              :feed-key="feedKey"
              :feed-version-key="feedVersionKey"
              :station-key="stationKey"
              @delete="deleteStopHandler"
              @update="updateStopHandler"
              @delete-association="deleteAssociationHandler"
              @select-pathway="selectPathway"
              @hover-pathway="hoverPathwayId = $event"
              @unselect="unselectAll"
            />
          </template>
          <tl-apps-stations-station-pathways-add-node-panel
            v-else-if="selectMode === 'add-node'"
            :selected-level="selectedLevel"
            :levels="station.levels"
            :level-index="levelIndex"
            @update:selected-level="selectedLevel = Number($event)"
          />
          <tl-apps-stations-station-pathways-find-route-panel
            v-else-if="selectMode === 'find-route'"
            :path="selectedPath"
            :selected-stops="selectedStops"
            :profile="selectedProfile"
            :profiles="profileNames"
            @update:profile="selectedProfile = $event"
            @hover-pathway="hoverPathwayId = $event"
            @unselect="unselectAll"
          />

          <t-card v-else-if="selectMode === 'export'" label="Export" variant="panel" class="station-editor-panel">
            <p class="notification">
              To export as a full GTFS feed, exit the pathways editor and
              <tl-link
                route-key="apps-stations-feedKey-feedVersionKey-stations"
                :to="{ params: { feedKey, feedVersionKey } }"
              >
                return to the feed version
              </tl-link>
            </p>
            <t-button icon-left="download" fullwidth @click="downloadGeojson">
              Download this station as GeoJSON
            </t-button>
          </t-card>

          <!-- Validation Reports -->
          <t-card label="Station Validation Reports" variant="panel" class="station-editor-panel">
            <tl-apps-stations-station-validator
              ref="stationValidator"
              :station="station"
              show-shortcuts
              @select-path="selectPath"
              @select-stop="selectStop"
              @select-pathway="selectPathway"
            />
          </t-card>
        </div>
      </div>

      <div class="column">
        <tl-apps-stations-pathway-map
          :center="stationCenter"
          :station="station"
          :basemap="basemap"
          :selected-stops="selectedStops"
          :draggable-stops="nodeEditMode && selectedStop ? [selectedStop] : []"
          :selected-pathways="selectMode === 'find-route' && selectedPath ? selectedPath.map((s) => { return s.pathway }) : selectedPathways"
          :selected-levels="selectedLevels"
          :hover-stop-id="hoverStopId"
          :hover-pathway-id="hoverPathwayId"
          @select-stop="selectStop"
          @select-pathway="selectPathway"
          @select-point="selectPoint"
          @move-stop-save="moveStopSave"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '#imports'
import { LocationTypes } from '../basemaps'
import { PathwayModes } from '../../../lib/pathways/pathway-icons'
import { Profiles } from '../../../lib/pathways/graph'
import type { Level } from '../station'
import { Stop, Pathway, mapLevelKeyFn } from '../station'
import { useStation } from '../composables/useStation'
import { useBasemapLayers } from '../../../composables/useBasemapLayers'
import { useToastNotification } from '../../../composables/useToastNotification'
import { usePathwaySelection } from '../composables/usePathwaySelection'
import { usePathwayEditorKeyboard } from '../composables/usePathwayEditorKeyboard'

defineOptions({ layout: 'wide' })

const props = defineProps<{
  feedKey: string
  feedVersionKey: string
  stationKey: string
  clientId?: string
}>()

const { feedKey, feedVersionKey, stationKey, clientId } = toRefs(props)
const route = useRoute()
const { showToast } = useToastNotification()

const {
  ready,
  station,
  stopAssociationsEnabled,
  selectedLevels,
  selectedLevel,
  refetch,
  handleError,
  createStop,
  updateStop,
  deleteStop,
  createPathway,
  updatePathway,
  deletePathway
} = useStation({ feedKey, feedVersionKey, stationKey, clientId: clientId?.value })

useHead(computed(() => ({
  title: station.value?.stop?.stop_name ? `${station.value.stop.stop_name} — Draw Pathways` : 'Draw Pathways'
})))

const { basemapLayers } = useBasemapLayers()

const basemap = ref('carto')
const levelsOpen = ref(true)
const basemapOpen = ref(false)
const legendOpen = ref(false)
const selectedProfile = ref('Pathways: Default')
const profileNames = Object.keys(Profiles) as string[]

const stationValidator = ref<{ openStopsModal: () => void, openPathwaysModal: () => void, openPathsModal: () => void } | null>(null)

const {
  selectMode,
  selectedStops,
  selectedPathways,
  hoverStopId,
  hoverPathwayId,
  lastFilterApplied,
  filterCounts,
  selectedStop,
  selectedSource,
  selectedPath,
  selectStop,
  selectPathway,
  selectPath,
  selectPoint: setSelectedPoint,
  unselectAll,
  selectLocationTypes,
  selectPathwayModes,
  selectStopsWithAssociations,
  selectStopsPlatformsWithoutAssociations,
  selectStopsEntrancesWithoutAssociations,
  selectStopsWithPairedPathways,
  selectPathwaysWithPairs,
  selectPathwaysOneway,
  selectPathwaysBidirectional
} = usePathwaySelection(station, selectedProfile, showToast)

const nodeEditMode = ref(false)
const pathwayEditMode = ref(false)
watch(selectedStop, () => { nodeEditMode.value = false })
watch(selectedPathways, () => { pathwayEditMode.value = false })

// Watch for query params after station loads
watch(ready, (isReady) => {
  if (isReady && route.query.selectedStop) {
    selectStop(Number(route.query.selectedStop))
  }
  if (isReady && route.query.selectedPathway) {
    selectPathway(Number(route.query.selectedPathway))
  }
})

// Clear selection when levels filter changes
watch(selectedLevels, () => {
  if (!route.query.selectedStop && !route.query.selectedPathway) {
    selectedStops.value = []
    selectedPathways.value = []
  }
  selectMode.value = 'select'
})

// Level and sorting
const levelIndex = computed<Record<number, Level>>(() => {
  const si: Record<number, Level> = {}
  for (const level of (station.value?.levels || [])) {
    if (level.id != null) {
      si[level.id] = level
    }
  }
  return si
})

const stationCenter = computed<[number, number] | undefined>(() => {
  const coords = station.value?.geometry?.coordinates
  if (!coords) { return undefined }
  return [coords[0]!, coords[1]!] as [number, number]
})

const sortedStationLevels = computed(() =>
  (station.value?.levels || [])
    .filter(l => l.id || l.stops.length > 0)
    .slice(0)
    .sort(
      (a, b) => (b.level_index != null ? b.level_index : -Infinity) - (a.level_index != null ? a.level_index : -Infinity)
    )
    .map(l => ({ ...l, levelKey: mapLevelKeyFn(l) }))
)

const selectedLevelKeys = computed({
  get (): string[] | undefined {
    return selectedLevels.value
  },
  set (keys: string[] | undefined) {
    if (keys === undefined) {
      selectedLevels.value = station.value?.levels?.map(mapLevelKeyFn) || []
    } else {
      selectedLevels.value = keys
    }
  }
})

// Map select-point: set state + handle add-node creation
function selectPoint (ll: { lng: number, lat: number }) {
  setSelectedPoint(ll)
  if (selectMode.value === 'add-node') {
    const stop = new Stop({
      geometry: {
        type: 'Point',
        coordinates: [ll.lng, ll.lat]
      },
      level: { id: selectedLevel.value ?? undefined }
    }).setDefaults()
    createStopHandler(stop)
  }
}

// CRUD handlers
function createStopHandler (node: Stop) {
  let newStopId = 0
  createStop(node)
    .then((d: any) => {
      newStopId = d?.data?.stop_create?.id
      return refetch()
    })
    .then(() => nextTick())
    .then(() => {
      setTimeout(() => { selectStop(newStopId) }, 150)
    })
    .catch(handleError)
}

function updateStopHandler (node: Stop) {
  updateStop(node)
    .then(() => refetch())
    .then(() => { selectStop(node.id!) })
    .catch(handleError)
}

function deleteStopHandler (node: Stop) {
  deleteStop(node)
    .then(() => refetch())
    .then(() => { selectStop(null) })
    .catch(handleError)
}

function moveStopSave (stopid: number | null, e: { lng: number, lat: number }) {
  if (stopid === null) return
  const stop = station.value?.getStop(stopid)
  if (!stop) return
  stop.setCoords(e.lng, e.lat)
  updateStopHandler(stop)
}

function deleteAssociationHandler (node: Stop) {
  updateStop(node)
    .then(() => refetch())
    .then(() => { selectStop(null) })
    .catch(handleError)
}

function newPathway (): Pathway {
  return new Pathway({
    from_stop: selectedSource.value!,
    to_stop: selectedStop.value!,
    pathway_id: `${selectedSource.value!.id}-${selectedStop.value!.id}-${Date.now()}`
  }).setDefaults()
}

function createPathwayHandler (pw: Pathway) {
  createPathway(pw)
    .then(() => refetch())
    .then(() => { selectPathway(null) })
    .catch(handleError)
}

function updatePathwayHandler (pw: Pathway) {
  updatePathway(pw)
    .then(() => refetch())
    .then(() => { selectPathway(null) })
    .catch(handleError)
}

function deletePathwayHandler (pw: Pathway) {
  selectPathway(null)
  deletePathway(pw)
    .then(() => refetch())
    .then(() => { selectPathway(null) })
    .catch(handleError)
}

function downloadGeojson () {
  const allFeatures: any[] = []
  allFeatures.push(...(station.value?.levels || []).map(s => ({
    type: 'Feature',
    id: s.id,
    properties: {
      id: s.id,
      level_id: s.level_id,
      level_name: s.level_name,
      level_index: s.level_index
    },
    geometry: s.geometry
  })))
  allFeatures.push(...(station.value?.pathways || []).map(s => ({
    type: 'Feature',
    id: s.id,
    properties: {
      id: s.id,
      pathway_id: s.pathway_id,
      pathway_mode: s.pathway_mode,
      signposted_as: s.signposted_as,
      reverse_signposted_as: s.reverse_signposted_as,
      stair_count: s.stair_count,
      is_bidirectional: s.is_bidirectional,
      length: s.length,
      max_slope: s.max_slope,
      from_id: s.from_stop.id,
      from_stop_id: String(s.from_stop.stop_id),
      from_stop_name: s.from_stop.stop_name,
      to_id: s.to_stop.id,
      to_stop_id: String(s.to_stop.stop_id),
      to_stop_name: s.to_stop.stop_name,
      from_level_id: s.from_stop.level?.id,
      from_level_name: s.from_stop.level?.level_name,
      to_level_id: s.to_stop.level?.id,
      to_level_name: s.to_stop.level?.level_name
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        s.from_stop.geometry!.coordinates,
        s.to_stop.geometry!.coordinates
      ]
    }
  })))
  allFeatures.push(...(station.value?.stops || []).map(s => ({
    type: 'Feature',
    id: s.id,
    properties: {
      id: s.id,
      stop_name: s.stop_name,
      stop_id: String(s.stop_id),
      stop_code: s.stop_code,
      stop_desc: s.stop_desc,
      location_type: s.location_type,
      level_id: s.level?.id,
      level_index: s.level?.level_index
    },
    geometry: s.geometry
  })))
  const data = JSON.stringify({ type: 'FeatureCollection', features: allFeatures })
  const blob = new Blob([data], { type: 'text/json' })
  const a = document.createElement('a')
  a.download = 'station.geojson'
  const url = window.URL.createObjectURL(blob)
  a.href = url
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
  a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: false }))
  window.URL.revokeObjectURL(url)
}

// Keyboard shortcuts
usePathwayEditorKeyboard({
  onEscape: unselectAll,
  onV: () => { selectMode.value = 'select' },
  onE: () => {
    if (selectMode.value === 'edit-node') { nodeEditMode.value = !nodeEditMode.value }
    if (selectMode.value === 'edit-pathway') { pathwayEditMode.value = !pathwayEditMode.value }
  },
  onN: () => { selectMode.value = 'add-node' },
  onF: () => { if (selectedStops.value.length === 1) { selectMode.value = 'find-route' } },
  onS: () => stationValidator.value?.openStopsModal(),
  onP: () => stationValidator.value?.openPathwaysModal(),
  onC: () => stationValidator.value?.openPathsModal()
})
</script>

  <style scoped lang="scss">
  .station-pathways-container {
    height: calc(100vh - 100px);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.station-mode-tabs-bar) {
      margin-bottom: 0;
    }
  }

  .tl-editor-info {
    width: 540px;
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 4px;
  }

  .station-editor-panel {
    // Compact padding to fit sidebar on smaller screens (e.g. iPad)
    :deep(.card-header-title) {
      padding: 0.5em 0.75em;
      font-size: 0.875rem;
    }

    :deep(.card-content) {
      padding: 0.75rem;
    }

    .buttons.has-addons {
      display: flex;
      width: 100%;

      .button {
        flex: 1;
      }
    }

    :deep(.columns.is-mobile) {
      margin-bottom: 0;

      .column {
        padding-top: 0;
        padding-bottom: 0;
      }
    }
  }

  .pathways-columns {
    flex: 1;
    min-height: 0;
    margin: 0;
    display: flex;
    align-items: stretch;

    .column.is-narrow {
      display: flex;
      flex-direction: column;
      padding-left: 0;
      padding-right: 0;
    }

    .column:not(.is-narrow) {
      display: flex;
      flex-direction: column;
      flex: 1;
      > :deep(*) {
        flex: 1;
        height: 100%;
      }
    }
  }

  .collapse-trigger-field {
    margin-bottom: 0.5rem;
  }

  .collapse-trigger-label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
    margin-bottom: 0 !important;

    &:hover {
      color: #3273dc;
    }
  }

  .legend-item {
    margin-bottom: 0.25rem;
  }

  .circle-indicator::before { content: "⓪ "; font-size: 1.2em; }
  .yellow-ring::before { content: "🟡 "; }
  .blue-rectangle::before { content: "🟦 "; }
  .red-rectangle::before { content: "🟥 "; }
  .purple-rectangle::before { content: "🟪 "; }
</style>
