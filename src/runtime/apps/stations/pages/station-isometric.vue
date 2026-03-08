<template>
  <div v-if="station">
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
          <p v-if="selectedElements.length === 0" class="notification">
            Click a stop node or pathway line to select it.
          </p>
          <div v-for="pw in selectedPathwayObjects" :key="pw.id" class="block">
            <tl-apps-stations-mode-switch
              :params="{ feedKey, feedVersionKey, stationKey }"
              :query="{ selectedPathway: String(pw.id) }"
            />
            <tl-apps-stations-station-pathways-pathway-panel
              :station="station"
              :pathway="pw"
              :show-unselect="true"
              read-only
              @unselect="clearSelectedElements"
              @select-stop="selectStop"
            />
          </div>
          <div v-for="stop in selectedStopObjects" :key="stop.id" class="block">
            <tl-apps-stations-mode-switch
              :params="{ feedKey, feedVersionKey, stationKey }"
              :query="{ selectedStop: String(stop.id) }"
            />
            <tl-apps-stations-station-pathways-node-panel
              :station="station"
              :stop="stop"
              :feed-key="feedKey"
              :feed-version-key="feedVersionKey"
              :station-key="stationKey"
              :show-unselect="true"
              read-only
              @unselect="clearSelectedElements"
              @select-pathway="selectPathway"
            />
          </div>
        </div>
      </div>
      <div class="column">
        <tl-apps-stations-station-isometric-viewer
          ref="viewer"
          :station="station"
          :selected-stop="initialSelectedStop"
          :selected-pathway="initialSelectedPathway"
          :client-id="clientId"
          @update:selection="onSelectionChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { navigateTo, useHead, useRoute } from '#imports'
import type { Stop, Pathway } from '../station'
import { useStation } from '../composables/useStation'

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
  stopAssociationsEnabled
} = useStation({ feedKey, feedVersionKey, stationKey, clientId: clientId?.value })

useHead(computed(() => ({
  title: station.value?.stop?.stop_name ? `${station.value.stop.stop_name} — Isometric View` : 'Isometric View'
})))

const route = useRoute()
const viewer = ref<any>(null)
const selectedElements = ref<string[]>([])

const initialSelectedStop = computed(() => {
  const v = route.query.selectedStop
  const s = Array.isArray(v) ? v[0] : v
  return s ? Number(s) : undefined
})

const initialSelectedPathway = computed(() => {
  const v = route.query.selectedPathway
  const s = Array.isArray(v) ? v[0] : v
  return s ? Number(s) : undefined
})

const selectedStops = computed((): string[] => {
  return selectedElements.value.filter(id => id.startsWith('s'))
})

const selectedPathways = computed((): string[] => {
  return selectedElements.value.filter(id => id.startsWith('p'))
})

const selectedStopObjects = computed((): Stop[] => {
  if (!station.value) return []
  return selectedStops.value.flatMap((sid) => {
    const id = Number(sid.match('[0-9]+')?.[0])
    const s = station.value!.stops.find(s => s.id === id)
    return s ? [s] : []
  })
})

const selectedPathwayObjects = computed((): Pathway[] => {
  if (!station.value) return []
  return selectedPathways.value.flatMap((pid) => {
    const id = Number(pid.match('[0-9]+')?.[0])
    const p = station.value!.pathways.find(p => p.id === id)
    return p ? [p] : []
  })
})

function onSelectionChange (ids: string[]) {
  selectedElements.value = ids
}

function selectStop (id: number) {
  viewer.value?.selectStop(id)
}

function selectPathway (id: number) {
  viewer.value?.selectPathway(id)
}

function clearSelectedElements () {
  viewer.value?.clearSelection()
  navigateTo({ path: route.path, query: { selectedStop: null, selectedPathway: null } })
}
</script>

<style scoped>
.tl-apps-stations-info {
  width: 540px;
}
</style>
