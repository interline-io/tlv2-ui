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
          <t-card>
            <template #trigger>
              Select
              <t-button v-if="selectedElements.length > 0" class="is-pulled-right m-2" variant="primary" size="small" outlined @click="clearSelectedElements">
                Unselect All
              </t-button>
            </template>
            <p v-if="selectedElements.length === 0" class="notification">
              Click to select a stop node or a pathway edge. Hold down the Ctrl or Shift keys to select multiple.
            </p>
            <div v-for="p in selectedPathways" :key="p" class="block">
              <tl-apps-stations-mode-switch
                :params="{
                  feedKey: feedKey,
                  feedVersionKey: feedVersionKey,
                  stationKey: stationKey,
                }"
                :query="{
                  selectedPathway: (p.match('[0-9]+')?.[0] || '') as string,
                }"
              />
              <tl-apps-stations-pathway-editor
                :station="station"
                :value="getElementById(p)"
                read-only
                @select-stop="selectStop"
              />
            </div>
            <div v-for="s in selectedStops" :key="s" class="block">
              <tl-apps-stations-mode-switch
                :params="{
                  feedKey: feedKey,
                  feedVersionKey: feedVersionKey,
                  stationKey: stationKey,
                }"
                :query="{
                  selectedStop: (s.match('[0-9]+')?.[0] || '') as string,
                }"
              />
              <tl-apps-stations-stop-editor
                :station="station"
                :value="getElementById(s) as any"
                read-only
                current-mode="diagram"
                @select-pathway="selectPathway"
              />
            </div>
          </t-card>
        </div>
      </div>
      <div class="column">
        <tl-apps-stations-station-diagram-viewer
          ref="viewer"
          :station="station"
          :selected-stop="initialSelectedStop"
          :selected-pathway="initialSelectedPathway"
          @update:selection="onSelectionChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { navigateTo, useHead, useRoute } from '#imports'
import type { Stop, Pathway, Level } from '../station'
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
  title: station.value?.stop?.stop_name ? `${station.value.stop.stop_name} — Station Diagram` : 'Station Diagram'
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

function getElementById (elementId: string): Stop | Pathway | Level | undefined {
  const match = elementId.match('[0-9]+')
  if (!match || !station.value) return undefined
  const id = Number(match[0])
  if (elementId.startsWith('s-')) {
    return station.value.stops.find(s => s.id === id)
  } else if (elementId.startsWith('p-')) {
    return station.value.pathways.find(p => p.id === id)
  } else if (elementId.startsWith('l-')) {
    return station.value.levels.find(l => l.id === id)
  }
}

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
