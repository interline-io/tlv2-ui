<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Station Diagram">
        Station Diagram: {{ stationName }}
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
        <div id="cy" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRefs, watch } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { schemeRdGy, schemeDark2 } from 'd3-scale-chromatic'
import type { Level, Stop, Pathway } from '../station'
import { useStation } from '../composables/useStation'
import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'

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
  stopAssociationsEnabled
} = useStation({ feedKey, feedVersionKey, stationKey, clientId: clientId?.value })

const route = useRoute()

const cytoscapeConfig = {
  style: [
    {
      selector: 'node',
      style: {
        'background-color': 'data(bgcolor)',
        'label': 'data(name)'
      }
    }, {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'source-arrow-shape': (edge: any) => edge.data.bidirectional ? 'triangle' : null,
        'width': 3,
        'line-color': 'data(lineColor)',
        'target-arrow-color': '#ccc'
      }
    }, {
      selector: ':selected',
      css: {
        'background-color': 'orange',
        'line-color': 'orange',
        'target-arrow-color': 'black',
        'source-arrow-color': 'black'
      }
    }
  ],
  layout: {
    name: 'fcose'
  }
}

// Reactive data
const selectedElements = ref<string[]>([])
const cy = ref<any>(null)

// Computed properties
const sortedLevels = computed((): Level[] => {
  if (!station.value) return []
  return [...station.value.levels].sort((a, b) => { return (a.level_index! > b.level_index!) ? 1 : -1 })
})

const cytoscapeElements = computed((): any[] => {
  const levelColors = schemeRdGy[5]
  const stopColors = schemeDark2
  const arr: any[] = []
  if (station.value) {
    sortedLevels.value.forEach((l) => {
      const levelId = `l-${l.id}`
      const levelColor = (levelColors && l.level_index !== undefined) ? levelColors[l.level_index] : '#ccc'
      arr.push({
        group: 'nodes',
        data: {
          id: levelId,
          name: l.level_name,
          bgcolor: levelColor
        },
        selectable: false
      })
      if (!station.value) return
      station.value.stops.forEach((s) => {
        if (s.level?.id === l.id) {
          const stopId = `s-${s.id}`
          const stopName = s.stop_name || s.stop_id
          const stopColor = stopColors[Number(s.location_type)]
          arr.push({
            group: 'nodes',
            data: {
              id: stopId,
              parent: levelId,
              name: stopName,
              bgcolor: stopColor
            }
          })
        }
      })
    })
    if (!station.value) return arr
    station.value.pathways.forEach((p) => {
      const fromStopId = `s-${p.from_stop.id}`
      const toStopId = `s-${p.to_stop.id}`
      const pathwayColor = '#999'
      arr.push({
        group: 'edges',
        data: {
          id: `p-${p.id}`,
          source: fromStopId,
          target: toStopId,
          bidirectional: (p.is_bidirectional === 1),
          lineColor: pathwayColor
        }
      })
    })
  }
  return arr
})

const selectedStops = computed((): string[] => {
  return selectedElements.value.filter(id => id.startsWith('s'))
})

const selectedPathways = computed((): string[] => {
  return selectedElements.value.filter(id => id.startsWith('p'))
})

// Watch ready state
watch(ready, (isReady) => {
  if (isReady) {
    nextTick(() => { cytoscapeInit() })
  }
})

// Methods
function cytoscapeInit (): void {
  if (cytoscapeElements.value.length === 0) {
    console.log('cytoscape not ready')
    return
  }
  console.log('cytoscape init')
  const cyInstance = cytoscape({
    container: document.getElementById('cy'),
    elements: cytoscapeElements.value,
    style: cytoscapeConfig.style
  })
  cytoscape.use(fcose as any)
  cy.value = cyInstance
  nextTick(() => {
    cyInstance.layout(cytoscapeConfig.layout).run()
    cyInstance.fit(undefined, 200)
    cyInstance.on('select', 'node', elementSelected)
    cyInstance.on('unselect', 'node', elementUnselected)
    cyInstance.on('select', 'edge', elementSelected)
    cyInstance.on('unselect', 'edge', elementUnselected)
    if (route.query.selectedStop) {
      const stopId = Array.isArray(route.query.selectedStop) ? route.query.selectedStop[0] : route.query.selectedStop
      selectStop(Number(stopId), false)
    }
    if (route.query.selectedPathway) {
      const pathwayId = Array.isArray(route.query.selectedPathway) ? route.query.selectedPathway[0] : route.query.selectedPathway
      selectPathway(Number(pathwayId), false)
    }
  })
}

function elementSelected (event: any) {
  selectedElements.value = Array.from(new Set(selectedElements.value).add(event.target.id()))
}

function elementUnselected (event: any) {
  const set = new Set(selectedElements.value)
  set.delete(event.target.id())
  selectedElements.value = Array.from(set)
}

function clearSelectedElements () {
  selectedElements.value = []
  navigateTo({ path: route.path, query: { selectedStop: null, selectedPathway: null } })
  cy.value?.filter(':selected').forEach((element: any) => element.unselect())
}

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

function selectStop (id: number, shouldClear = true) {
  if (shouldClear) { clearSelectedElements() }
  selectElement(`s-${id}`)
}

function selectPathway (id: number, shouldClear = true) {
  if (shouldClear) { clearSelectedElements() }
  selectElement(`p-${id}`)
}

function selectElement (elementId: string) {
  cy.value?.filter(':unselected').forEach((element: any) => {
    if (element.id() === elementId) {
      element.select()
    }
  })
}
</script>

<style scoped>
.tl-apps-stations-info {
  width: 540px;
}
</style>

  <style scss>
#cy {
    height: 100%;
    height: 1000px;
  }
  </style>
