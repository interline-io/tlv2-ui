<template>
  <div ref="cyContainer" class="station-diagram-viewer" />
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { schemeRdGy, schemeDark2 } from 'd3-scale-chromatic'
import type { Level, Station } from './station'
import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'

const props = defineProps<{
  station: Station
  selectedStop?: number
  selectedPathway?: number
}>()

const emit = defineEmits<{
  'update:selection': [ids: string[]]
}>()

const cyContainer = ref<HTMLElement | null>(null)
const cy = ref<any>(null)
const selectedElements = ref<string[]>([])

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

const sortedLevels = computed((): Level[] => {
  return [...props.station.levels].sort((a, b) => { return (a.level_index! > b.level_index!) ? 1 : -1 })
})

const cytoscapeElements = computed((): any[] => {
  const levelColors = schemeRdGy[5]
  const stopColors = schemeDark2
  const arr: any[] = []
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
    props.station.stops.forEach((s) => {
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
  props.station.pathways.forEach((p) => {
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
  return arr
})

function cytoscapeInit (): void {
  const container = cyContainer.value
  if (cytoscapeElements.value.length === 0 || !container) {
    return
  }
  const cyInstance = cytoscape({
    container: container as HTMLElement,
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
    if (props.selectedStop) {
      selectStop(props.selectedStop, false)
    }
    if (props.selectedPathway) {
      selectPathway(props.selectedPathway, false)
    }
  })
}

function elementSelected (event: any) {
  const id = event.target.id()
  selectedElements.value = Array.from(new Set(selectedElements.value).add(id))
  emit('update:selection', selectedElements.value)
}

function elementUnselected (event: any) {
  const set = new Set(selectedElements.value)
  set.delete(event.target.id())
  selectedElements.value = Array.from(set)
  emit('update:selection', selectedElements.value)
}

function clearSelection () {
  selectedElements.value = []
  if (cy.value) {
    cy.value.off('select unselect')
    cy.value.filter(':selected').forEach((element: any) => element.unselect())
    cy.value.on('select', 'node', elementSelected)
    cy.value.on('unselect', 'node', elementUnselected)
    cy.value.on('select', 'edge', elementSelected)
    cy.value.on('unselect', 'edge', elementUnselected)
  }
  emit('update:selection', selectedElements.value)
}

function selectStop (id: number, shouldClear = true) {
  if (shouldClear) { clearSelection() }
  selectElement(`s-${id}`)
}

function selectPathway (id: number, shouldClear = true) {
  if (shouldClear) { clearSelection() }
  selectElement(`p-${id}`)
}

function selectElement (elementId: string) {
  cy.value?.filter(':unselected').forEach((element: any) => {
    if (element.id() === elementId) {
      element.select()
    }
  })
}

onMounted(() => {
  nextTick(() => { cytoscapeInit() })
})

watch(cytoscapeElements, () => {
  if (cy.value) {
    cy.value.destroy()
    cy.value = null
  }
  nextTick(() => { cytoscapeInit() })
})

onBeforeUnmount(() => {
  if (cy.value) {
    cy.value.destroy()
    cy.value = null
  }
})

defineExpose({
  selectStop,
  selectPathway,
  clearSelection
})
</script>

<style scoped>
.station-diagram-viewer {
  height: 1000px;
  width: 100%;
}
</style>
