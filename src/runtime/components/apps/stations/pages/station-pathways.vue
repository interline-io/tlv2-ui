<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Station Pathways">
        Station Pathways: {{ stationName }}
      </tl-title>
    </slot>
    <tl-apps-stations-station-mode-tabs
      :station="station"
      :feed-key="feedKey"
      :feed-version-key="feedVersionKey"
      :station-key="stationKey"
      :stop-associations-enabled="stopAssociationsEnabled"
    />

    <div v-if="ready" class="columns">
      <div class="column is-narrow">
        <div class="block tl-apps-stations-info">
          <t-field label="Station Validation Reports">
            <tl-apps-stations-station-validator
              :station="station"
              @select-path="selectPath"
              @select-stop="selectStop"
              @select-pathway="selectPathway"
            />
          </t-field>
          <!-- SELECT -->
          <t-card v-if="selectMode === 'select'" label="Select">
            <div>
              <div class="mb-2">
                <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
                  <p class="label mb-0">
                    {{ selectedStops.length }} stops selected
                  </p>
                  <t-button :style="{ visibility: selectedStops.length > 0 ? 'visible' : 'hidden' }" variant="primary" size="small" outlined @click="unselectAll">
                    Unselect All
                  </t-button>
                </div>
                <t-field label="Select Stops">
                  <div class="buttons has-addons">
                    <a v-for="pwm of LocationTypes" :key="pwm[0]" class="button is-small" @click="selectLocationTypes(pwm[0])">{{ pwm[1] }}</a>
                  </div>
                </t-field>
                <t-field>
                  <div class="buttons has-addons">
                    <a class="button is-small" @click="selectStopsWithAssociations()">With associations</a>
                    <a class="button is-small" @click="selectStopsPlatformsWithoutAssociations()">Platforms w/o assoc.</a>
                    <a class="button is-small" @click="selectStopsEntrancesWithoutAssociations()">Entrances w/o assoc.</a>
                  </div>
                  <div class="buttons has-addons">
                    <a class="button is-small" @click="selectStopsWithPairedPathways()">With paired pathways</a>
                  </div>
                </t-field>
              </div>
              <div class="mb-2">
                <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
                  <p class="label mb-0">
                    {{ selectedPathways.length }} pathways selected
                  </p>
                  <t-button :style="{ visibility: selectedPathways.length > 0 ? 'visible' : 'hidden' }" variant="primary" size="small" outlined @click="unselectAll">
                    Unselect All
                  </t-button>
                </div>
                <t-field label="Select Pathways">
                  <div class="buttons has-addons">
                    <a v-for="pwm of PathwayModes" :key="pwm[0]" class="button is-small" @click="selectPathwayModes(pwm[0])">{{ pwm[1] }}</a>
                  </div>
                  <div class="buttons has-addons">
                    <a class="button is-small" @click="selectPathwaysWithPairs()">With pairs</a>
                    <a class="button is-small" @click="selectPathwaysOneway()">One-directional</a>
                    <a class="button is-small" @click="selectPathwaysBidirectional()">Bi-directional</a>
                  </div>
                </t-field>
                <ul>
                  <li class="blue-rectangle">
                    blue pathways are on the same level
                  </li>
                  <li class="red-rectangle">
                    red pathways connect two separate levels
                  </li>
                  <li class="purple-rectangle">
                    purple lines show distance to associated stop
                  </li>
                </ul>
              </div>
            </div>
          </t-card>
          <t-card v-else-if="selectMode === 'add-pathway'" label="Add Pathway">
            <div>
              <tl-apps-stations-pathway-editor
                :station="station"
                :value="newPathway()"
                @select-stop="selectStop"
                @create="createPathwayHandler"
              />
            </div>
          </t-card>
          <template v-if="selectMode === 'edit-pathway'">
            <t-card v-for="spw of selectedPathways" :key="spw.id" label="Edit Pathway">
              <tl-apps-stations-mode-switch
                :params="{
                  feedKey: feedKey,
                  feedVersionKey: feedVersionKey,
                  stationKey: stationKey,
                }"
                :query="{
                  selectedPathway: (spw.id?.toString() || '') as string,
                }"
              />
              <tl-apps-stations-pathway-editor
                :station="station"
                :value="spw"
                @select-stop="selectStop"
                @delete="deletePathwayHandler"
                @update="updatePathwayHandler"
              />
            </t-card>
          </template>
          <template v-else-if="selectMode === 'edit-node'">
            <t-card v-for="ss of selectedStops" :key="ss.id" class="card">
              <template #header>
                <p class="card-header-title">
                  Edit Node
                </p>
                <t-button v-if="selectedStops.length > 0 || selectedPathways.length > 0" class="card-header-icon m-2" variant="primary" size="small" outlined @click="unselectAll">
                  Unselect
                </t-button>
              </template>
              <tl-apps-stations-mode-switch
                :params="{
                  feedKey: feedKey,
                  feedVersionKey: feedVersionKey,
                  stationKey: stationKey,
                }"
                :query="{
                  selectedStop: (ss.id?.toString() || '') as string,
                }"
              />
              <tl-apps-stations-stop-editor
                :station="station"
                :value="ss"
                :stop-associations-enabled="stopAssociationsEnabled"
                @delete="deleteStopHandler"
                @update="updateStopHandler"
                @select-pathway="selectPathway"
              />
            </t-card>
          </template>
          <template v-else-if="selectMode === 'add-node'">
            <t-card label="Add Node">
              <t-field label="Level">
                <t-dropdown
                  v-model="selectedLevel"
                  selectable
                  :trigger-label="(selectedLevel !== null && levelIndex[selectedLevel]) ? levelIndex[selectedLevel]!.level_name : 'None'"
                >
                  <t-dropdown-item v-for="level of station.levels" :key="level.id" :value="level.id">
                    <h3>{{ level.level_name }}</h3>
                    <small> {{ level.stops.length }} nodes</small>
                  </t-dropdown-item>
                </t-dropdown>
              </t-field>
            </t-card>
          </template>
          <template v-else-if="selectMode === 'find-route'">
            <t-card v-if="selectedStops.length > 1" label="Find Route">
              <tl-apps-stations-path-viewer :path="selectedPath || []" />
            </t-card>
          </template>

          <br>
        </div>
      </div>

      <div class="column">
        <t-field grouped>
          <t-dropdown
            v-model="selectedLevels"
            :width="300"
            trigger-label="Levels"
            multiple
            selectable
            variant="primary"
          >
            <t-dropdown-item v-for="level of sortedStationLevels" :key="level.id" :value="mapLevelKeyFn(level)">
              <div class="media">
                <div class="media-left">
                  {{ level.level_index == null ? '&nbsp;&nbsp;&nbsp;' : level.level_index }}
                </div>
                <div class="media-content">
                  <h3>{{ level.level_name }}</h3>
                  <small>{{ level.stops.length }} nodes </small>
                </div>
              </div>
            </t-dropdown-item>
          </t-dropdown>
          <tl-apps-stations-basemap-control v-model="basemap" />
          <tl-download-geojson
            :features="geojsonFeatures"
            filename="station"
            label="GeoJSON"
          />
          <t-radio
            v-model="selectMode"
            native-value="select"
          >
            <span>Select</span>
          </t-radio>
          <t-radio
            v-model="selectMode"
            :disabled="!(selectedStop && selectedSource)"
            native-value="add-pathway"
          >
            <span>Add Pathway</span>
          </t-radio>
          <t-radio
            v-model="selectMode"
            native-value="find-route"
          >
            <span>Find Route</span>
          </t-radio>
          <t-radio
            v-model="selectMode"
            native-value="add-node"
          >
            Add Node
          </t-radio>
        </t-field>

        <tl-pathway-map
          :center="station.geometry?.coordinates as [number, number]"
          :station="station"
          :basemap="basemap"
          :selected-stops="selectedStops"
          :selected-pathways="selectMode === 'find-route' && selectedPath ? selectedPath.map((s) => { return s.pathway }) : selectedPathways"
          :selected-levels="selectedLevels"
          :editable="true"
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
import { computed, ref, toRefs, watch } from 'vue'
import { useRoute } from '#imports'
import type { LngLat } from 'maplibre-gl'
import type { Feature } from 'geojson'
import { PathwayModes } from '../../../../pathways/pathway-icons'
import { LocationTypes } from '../basemaps'
import { Stop, Pathway, mapLevelKeyFn } from '../station'
import type { Level } from '../station'
import { useStation } from '../composables/useStation'
import { useToastNotification } from '../../../../composables/useToastNotification'

type SelectMode = 'select' | 'add-node' | 'edit-node' | 'add-pathway' | 'edit-pathway' | 'find-route'

interface PathwayEdge {
  cost: number
  pathway: Pathway
}

defineOptions({
  layout: 'wide'
})

const props = defineProps<{
  feedKey: string
  feedVersionKey: string
  stationKey: string
  clientId?: string
}>()

const { feedKey, feedVersionKey, stationKey, clientId } = toRefs(props)

const {
  ready,
  station,
  stationName,
  stopAssociationsEnabled,
  selectedLevels,
  selectedLevel,
  handleError,
  refetch,
  createStop,
  updateStop,
  deleteStop,
  createPathway,
  updatePathway,
  deletePathway
} = useStation({ feedKey, feedVersionKey, stationKey, clientId: clientId?.value })

const route = useRoute()
const { showToast } = useToastNotification()

// Reactive data
const selectMode = ref<SelectMode>('select')
const selectedPoint = ref<LngLat | null>(null)
const selectedStops = ref<Stop[]>([])
const selectedPathways = ref<Pathway[]>([])
const basemap = ref('carto')

// Computed properties
const selectedPath = computed((): PathwayEdge[] | null => {
  if (selectMode.value !== 'find-route' || selectedStops.value.length < 2 || !station.value) {
    return null
  }
  const stop0Id = selectedStops.value[0]?.id
  const stop1Id = selectedStops.value[1]?.id
  if (!stop0Id || !stop1Id) return null
  const p = station.value.findRoute(stop0Id, stop1Id)
  if (!p) return null
  const edges: PathwayEdge[] = []
  for (const edge of p.edges || []) {
    const pathway = edge.pathway_id ? pathwayIndex.value[edge.pathway_id] : undefined
    if (edge.pathway_id && pathway) {
      edges.push({
        cost: 0,
        pathway
      })
    }
  }
  return edges
})

const selectedSource = computed((): Stop | null | undefined => {
  if (selectedStops.value.length === 2) {
    return selectedStops.value[0]
  }
  return null
})

const selectedStop = computed((): Stop | null | undefined => {
  if (selectedStops.value.length > 0) {
    return selectedStops.value[selectedStops.value.length - 1]
  }
  return null
})

const levelIndex = computed((): Record<number, Level> => {
  const si: Record<number, Level> = {}
  if (!station.value) return si
  for (const level of station.value.levels) {
    si[level.id!] = level
  }
  return si
})

const pathwayIndex = computed((): Record<number, Pathway> => {
  const si: Record<number, Pathway> = {}
  if (!station.value) return si
  for (const pw of station.value.pathways) {
    si[pw.id!] = pw
  }
  return si
})

const sortedStationLevels = computed((): Level[] => {
  if (!station.value) return []
  return station.value.levels.slice(0).sort(
    (a, b) => (b.level_index != null ? b.level_index : -Infinity) - (a.level_index != null ? a.level_index : -Infinity)
  )
})

const geojsonFeatures = computed((): Feature[] => {
  const allFeatures: Feature[] = []
  const levels = station.value?.levels || []
  allFeatures.push(...levels.filter(s => s.geometry).map((s) => {
    return {
      type: 'Feature' as const,
      id: s.id,
      properties: {
        id: s.id,
        level_id: s.level_id,
        level_name: s.level_name,
        level_index: s.level_index
      },
      geometry: s.geometry!
    }
  }))
  const pathways = station.value?.pathways || []
  allFeatures.push(...pathways.map((s) => {
    return {
      type: 'Feature' as const,
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
        from_level_name: s.from_stop.level?.id,
        to_level_id: s.to_stop.level?.id,
        to_level_name: s.to_stop.level?.id
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          s.from_stop.geometry?.coordinates || [0, 0],
          s.to_stop.geometry?.coordinates || [0, 0]
        ]
      }
    }
  }))
  const stops = station.value?.stops || []
  allFeatures.push(...stops.filter(s => s.geometry).map((s) => {
    return {
      type: 'Feature' as const,
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
      geometry: s.geometry!
    }
  }))
  return allFeatures
})

// Watchers
watch(ready, (isReady) => {
  if (isReady && route.query.selectedStop) {
    selectStop(Number(route.query.selectedStop))
  }
  if (isReady && route.query.selectedPathway) {
    selectPathway(Number(route.query.selectedPathway))
  }
})

watch(selectedLevels, () => {
  if (route.query.selectedStop || route.query.selectedPathway) {
    // Preserve selection when navigating from query parameters
  } else {
    selectedStops.value = []
    selectedPathways.value = []
  }
})

watch(selectMode, (mode) => {
  if (mode === 'add-node') {
    selectedStops.value = []
    selectedPathways.value = []
  }
})

// Methods - Stops
function createStopHandler (node: Stop) {
  if (!station.value) return
  createStop(node)
    .then((d) => {
      const newStopId = d?.data?.stop_create?.id
      return refetch().then(() => newStopId)
    })
    .then((newStopId) => {
      if (newStopId) {
        showToast('Stop created successfully', 'success')
        selectStop(newStopId)
      }
    })
    .catch(handleError)
}

function updateStopHandler (node: Stop) {
  if (!station.value) return
  const stopId = node.id!
  updateStop(node)
    .then(() => refetch())
    .then(() => {
      showToast('Stop updated successfully', 'success')
      selectStop(stopId)
    })
    .catch(handleError)
}

function deleteStopHandler (node: Stop) {
  if (!station.value) return
  return deleteStop(node)
    .then(() => refetch())
    .then(() => {
      showToast('Stop deleted successfully', 'success')
      selectStop(null)
    })
    .catch(handleError)
}

function moveStopSave (stopId: number, e: LngLat) {
  if (!station.value) return
  const stop = station.value.getStop(stopId)
  if (!stop) {
    return
  }
  stop.setCoords(e.lng, e.lat)
  updateStopHandler(stop)
}

// Pathways
function newPathway (): Pathway {
  const fromId = selectedSource.value?.id ?? 'unknown'
  const toId = selectedStop.value?.id ?? 'unknown'
  return new Pathway({
    from_stop: selectedSource.value || undefined,
    to_stop: selectedStop.value || undefined,
    pathway_id: `${fromId}-${toId}-${Date.now()}`
  }).setDefaults()
}

function createPathwayHandler (pw: Pathway) {
  if (!station.value) return
  createPathway(pw)
    .then((d) => {
      const newPathwayId = d?.data?.pathway_create?.id
      return refetch().then(() => newPathwayId)
    })
    .then((newPathwayId) => {
      if (newPathwayId) {
        showToast('Pathway created successfully', 'success')
        selectPathway(newPathwayId)
      }
    })
    .catch(handleError)
}

function updatePathwayHandler (pw: Pathway) {
  if (!station.value) return
  updatePathway(pw)
    .then(() => refetch())
    .then(() => {
      showToast('Pathway updated successfully', 'success')
      selectPathway(null)
    })
    .catch(handleError)
}

function deletePathwayHandler (pw: Pathway) {
  if (!station.value) return
  deletePathway(pw)
    .then(() => refetch())
    .then(() => {
      showToast('Pathway deleted successfully', 'success')
      selectPathway(null)
    })
    .catch(handleError)
}

// Select tools
function selectStop (stopId: number | null) {
  if (stopId === null) {
    selectedStops.value = []
    selectMode.value = 'select'
    return
  }
  if (!station.value) return
  const cur = station.value.getStop(stopId)
  const prev = selectedStops.value.length > 0 ? selectedStops.value[selectedStops.value.length - 1] : null
  if (!cur) {
    return
  }
  // find-route is sticky on first selected stop
  if (prev && selectMode.value === 'find-route') {
    if (prev === cur) {
      selectedStops.value = []
      return
    }
    selectedStops.value = [selectedStops.value[0]!, cur]
    return
  }
  // Handle stop selection for editing or pathway creation
  selectedPathways.value = []
  if (prev) {
    if (prev === cur) {
      selectedStops.value = []
      selectMode.value = 'select'
    } else {
      selectedStops.value = [prev, cur]
      selectMode.value = 'add-pathway'
    }
  } else {
    selectedStops.value = [cur]
    selectMode.value = 'edit-node'
  }
}

function selectPath (fromId: number, toId: number) {
  if (!station.value) return
  selectMode.value = 'find-route'
  selectedStops.value = [station.value.getStop(fromId)!, station.value.getStop(toId)!]
}

function selectPathway (pwid: number | null) {
  if (pwid === null) {
    selectedPathways.value = []
    selectMode.value = 'select'
    return
  }
  const cur = pathwayIndex.value[pwid]
  if (!cur) return
  const prev = selectedPathways.value.length > 0 ? selectedPathways.value[selectedPathways.value.length - 1] : null
  selectedStops.value = []
  if (prev === cur) {
    selectedPathways.value = []
    selectMode.value = 'select'
  } else {
    selectedPathways.value = [cur]
    selectMode.value = 'edit-pathway'
  }
}

function selectPoint (ll: LngLat) {
  selectedPoint.value = ll
  if (selectMode.value === 'add-node') {
    const stop = new Stop({
      geometry: {
        type: 'Point',
        coordinates: [ll.lng, ll.lat]
      },
      level: { id: selectedLevel.value || undefined }
    }).setDefaults()
    createStopHandler(stop)
  }
}

function selectStopsWithAssociations () {
  selectedStops.value = station.value?.stops?.filter(s => s.external_reference?.target_stop_id) || []
  selectMode.value = 'select'
}

function selectStopsPlatformsWithoutAssociations () {
  selectedStops.value = station.value?.stops?.filter(s => s.location_type === 0 && !s.external_reference) || []
  selectMode.value = 'select'
}

function selectStopsEntrancesWithoutAssociations () {
  selectedStops.value = station.value?.stops?.filter(s => s.location_type === 2 && !s.external_reference) || []
  selectMode.value = 'select'
}

function selectStopsWithPairedPathways () {
  const pairedPathways = new Map()
  selectedStops.value = station.value?.stops?.filter((s) => {
    const pwKeys = []
    for (const pw of s.pathways_from_stop) {
      pwKeys.push(`${pw.from_stop.id}-${pw.to_stop.id}`)
    }
    for (const pw of s.pathways_to_stop) {
      pwKeys.push(`${pw.to_stop.id}-${pw.from_stop.id}`)
    }
    let matched = false
    for (const pwkey of pwKeys) {
      if (pairedPathways.has(pwkey)) {
        matched = true
      }
      pairedPathways.set(pwkey, true)
    }
    return matched
  }) || []
  selectMode.value = 'select'
}

function selectLocationTypes (stype: number) {
  selectedStops.value = station.value?.stops?.filter(s => s.location_type === stype) || []
}

function selectPathwayModes (stype: number) {
  selectedPathways.value = station.value?.pathways?.filter(s => s.pathway_mode === stype) || []
}

function selectPathwaysWithPairs () {
  const pwPairs = new Map()
  selectedPathways.value = station.value?.pathways?.filter((s) => {
    const pwKeys = [
      `${s.from_stop.id}-${s.to_stop.id}`,
      `${s.to_stop.id}-${s.from_stop.id}`
    ]
    let matched = false
    for (const pwkey of pwKeys) {
      if (pwPairs.has(pwkey)) {
        matched = true
      }
      pwPairs.set(pwkey, true)
    }
    return matched
  }) || []
  selectMode.value = 'select'
}

function selectPathwaysOneway () {
  selectedPathways.value = station.value?.pathways?.filter(s => !s.is_bidirectional) || []
}

function selectPathwaysBidirectional () {
  selectedPathways.value = station.value?.pathways?.filter(s => s.is_bidirectional) || []
}

function unselectAll () {
  selectedStops.value = []
  selectedPathways.value = []
  selectedPoint.value = null
  selectMode.value = 'select'
}
</script>

  <style scoped>
  .help li {
    margin-bottom:10px;
  }
  .blue-rectangle::before {
    content: "🟦 ";
  }
  .red-rectangle::before {
    content: "🟥 "
  }
  .purple-rectangle::before {
    content: "🟪 "
  }
  .tl-apps-stations-info {
    width: 540px;
  }
  </style>
