<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Station Diagram">
        Station Diagram: {{ stationName }}
      </tl-title>
    </slot>

    <tl-editor-station-mode-tabs
      :station="station"
      :feed-key="feedKey"
      :feed-version-key="feedVersionKey"
      :station-key="stationKey"
    />

    <div v-if="ready" class="columns">
      <div class="column is-narrow">
        <div class="block" style="width: 540px;">
          <o-collapse class="card">
            <template #trigger>
              <div class="card-header">
                <div class="card-header-title">
                  Select
                </div>
                <o-button v-if="selectedElements.length > 0" class="is-pulled-right m-2" variant="primary is-small" outlined @click="clearSelectedElements">
                  Unselect All
                </o-button>
              </div>
            </template>
            <div class="card-content">
              <p v-if="selectedElements.length === 0" class="notification">
                Click to select a stop node or a pathway edge. Hold down the Ctrl or Shift keys to select multiple.
              </p>
              <div v-for="p in selectedPathways" :key="p" class="block">
                <tl-editor-mode-switch
                  :params="{
                    feedKey: feedKey,
                    feedVersionKey: feedVersionKey,
                    stationKey: stationKey
                  }"
                  :query="{
                    selectedPathway: p.match('[0-9]+')[0]
                  }"
                />
                <tl-editor-pathway-editor
                  :station="station"
                  :value="getElementById(p)"
                  read-only
                  @select-stop="selectStop"
                />
              </div>
              <div v-for="s in selectedStops" :key="s" class="block">
                <tl-editor-mode-switch
                  :params="{
                    feedKey: feedKey,
                    feedVersionKey: feedVersionKey,
                    stationKey: stationKey
                  }"
                  :query="{
                    selectedStop: s.match('[0-9]+')[0]
                  }"
                />
                <tl-editor-stop-editor
                  :station="station"
                  :value="getElementById(s)"
                  read-only
                  current-mode="diagram"
                  @select-pathway="selectPathway"
                />
              </div>
            </div>
          </o-collapse>
        </div>
      </div>
      <div class="column">
        <div id="cy" />
      </div>
    </div>
  </div>
</template>

<script>
import fcose from 'cytoscape-fcose'
import { schemeRdGy, schemeDark2 } from 'd3-scale-chromatic'
import { nextTick } from 'vue'
import cytoscape from 'cytoscape'
import StationMixin from './station-mixin'
import { navigateTo } from '#imports'

const cytoscapeConfig = {
  style: [
    {
      selector: 'node',
      style: {
        'background-color': 'data(bgcolor)',
        label: 'data(name)'
      }
    }, {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'source-arrow-shape': edge => edge.data.bidirectional ? 'triangle' : null,
        width: 3,
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

export default {
  mixins: [StationMixin],
  query: ['selectedPathway', 'selectedStop'],
  data () {
    return {
      id: undefined,
      selectedElements: [],
      cy: null
    }
  },
  computed: {
    sortedLevels () {
      return [...this.station.levels].sort((a, b) => { return (a.level_index > b.level_index) })
    },
    cytoscapeElements () {
      const levelColors = schemeRdGy[5]
      const stopColors = schemeDark2
      const arr = []
      if (this.station) {
        this.sortedLevels.forEach((l) => {
          const levelId = `l-${l.id}`
          const levelColor = levelColors[l.level_index] || '#ccc'
          arr.push({
            group: 'nodes',
            data: {
              id: levelId,
              name: l.level_name,
              bgcolor: levelColor
            },
            selectable: false
          })
          this.station.stops.forEach((s) => {
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
        this.station.pathways.forEach((p) => {
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
    },
    selectedStops () {
      return this.selectedElements.filter(id => id.startsWith('s'))
    },
    selectedPathways () {
      return this.selectedElements.filter(id => id.startsWith('p'))
    }
  },
  watch: {
    ready() {
      if (this.ready) {
        nextTick(() => { this.cytoscapeInit() })
      }
    }
  },
  methods: {
    cytoscapeInit() {
      if (this.cytoscapeElements.length === 0) {
        console.log('cytoscape not ready')
        return
      }
      console.log('cytoscape init')
      const cy = cytoscape({
        container: document.getElementById('cy'),
        elements: this.cytoscapeElements,
        style: cytoscapeConfig.style
      })
      cytoscape.use(fcose, {
        // fixedNodeConstraint
      })
      nextTick(() => {
        cy.layout(cytoscapeConfig.layout).run()
        cy.fit(null, 200)
        cy.on('select', 'node', this.elementSelected)
        cy.on('unselect', 'node', this.elementUnselected)
        cy.on('select', 'edge', this.elementSelected)
        cy.on('unselect', 'edge', this.elementUnselected)
        if (this.$route.query.selectedStop) {
          this.selectStop(this.$route.query.selectedStop, false)
        }
        if (this.$route.query.selectedPathway) {
          this.selectPathway(this.$route.query.selectedPathway, false)
        }
      })
    },
    elementSelected (event) {
      this.selectedElements = Array.from(new Set(this.selectedElements).add(event.target.id()))
    },
    elementUnselected (event) {
      this.selectedElements = Array.from(new Set(this.selectedElements).delete(event.target.id()))
    },
    clearSelectedElements () {
      this.selectedElements = []
      navigateTo({ path: this.$route.path, query: { selectedStop: null, selectedPathway: null } })
      this.$refs.cy.instance.filter(':selected').forEach(element => element.unselect())
    },
    getElementById (elementId) {
      const id = Number(elementId.match('[0-9]+')[0])
      if (elementId.startsWith('s')) {
        return this.station.stops.find(s => s.id === id)
      } else if (elementId.startsWith('p')) {
        return this.station.pathways.find(p => p.id === id)
      } else if (elementId.startsWith('l')) {
        return this.station.levels.find(l => l.id === id)
      }
    },
    selectStop (id, clearSelectedElements = true) {
      if (clearSelectedElements) { this.clearSelectedElements() }
      this.selectElement(`s-${id}`)
    },
    selectPathway (id, clearSelectedElements = true) {
      if (clearSelectedElements) { this.clearSelectedElements() }
      this.clearSelectedElements()
      this.selectElement(`p-${id}`)
    },
    selectElement (elementId) {
      this.$refs.cy.instance.filter(':unselected').forEach((element) => {
        if (element.id() === elementId) {
          element.select()
        }
      })
    }
  }
}
</script>

  <style scss>
#cy {
    height: 100%;
    height: 1000px;
  }
  </style>
