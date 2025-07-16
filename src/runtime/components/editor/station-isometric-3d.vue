<template>
  <div v-if="station" class="station-isometric-3d">
    <slot name="title">
      <tl-title title="Station 3D Isometric View">
        Station 3D Isometric View: {{ stationName }}
      </tl-title>
    </slot>

    <tl-editor-station-mode-tabs
      :station="station"
      :feed-key="feedKey"
      :feed-version-key="feedVersionKey"
      :station-key="stationKey"
      :stop-associations-enabled="stopAssociationsEnabled"
    />

    <div v-show="ready" class="columns">
      <div class="column is-one-fifth">
        <div class="block tl-editor-info">
          <div class="box">
            <o-field label="Camera Pitch">
              <o-slider v-model="cameraPitch" :min="-90" :max="90" :step="1" />
            </o-field>
            <o-field label="Camera Bearing">
              <o-slider v-model="cameraBearing" :min="-180" :max="180" :step="1" />
            </o-field>
            <o-field label="Zoom">
              <o-slider v-model="cameraZoom" :min="14" :max="20" :step="0.1" />
            </o-field>
            <o-field label="Level Height">
              <o-slider v-model="levelHeight" :min="10" :max="100" :step="5" />
            </o-field>

            <div class="buttons is-fullwidth mb-2">
              <button class="button is-small is-fullwidth" @click="setIsometricView">Isometric</button>
              <button class="button is-small is-fullwidth" @click="setTopDownView">Top Down</button>
              <button class="button is-small is-fullwidth" @click="setSideView">Side View</button>
            </div>
            <div class="buttons is-fullwidth">
              <button class="button is-small is-fullwidth" @click="resetView">Reset View</button>
              <button class="button is-small is-fullwidth" @click="fitToBounds">Fit to Station</button>
            </div>
          </div>

          <div class="box">
            <div class="field">
              <o-switch v-model="showPathways">
                Show Pathways
              </o-switch>
            </div>
            <div class="field">
              <o-switch v-model="showStops">
                Show Stops
              </o-switch>
            </div>
            <div class="field">
              <o-switch v-model="showLevels">
                Show Level Outlines
              </o-switch>
            </div>
            <div class="field">
              <o-switch v-model="showLevelFills">
                Show Level Fills
              </o-switch>
            </div>
            <div class="field">
              <o-switch v-model="showLabels">
                Show Labels
              </o-switch>
            </div>
          </div>

          <div class="box">
            <h6 class="title is-6">Levels</h6>
            <ul class="legend-list is-flex is-flex-wrap-wrap">
              <li v-for="item in levelColors.sort((a, b) => b.level_index - a.level_index)" :key="item.level_index" class="legend-item mr-4">
                <o-switch v-model="visibleLevelIndexes" :native-value="item.level_index">
                  <span class="legend-level-shape" :style="{ backgroundColor: item.color, opacity: visibleLevelIndexes.includes(item.level_index) ? 1 : 0.3 }"></span>
                  <span>{{ item.level_name }} ({{ item.level_index }})</span>
                </o-switch>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="column is-four-fifths">
        <div class="box" style="position: relative;">
          <div
            ref="mapContainer"
            class="map-container"
            style="width: 100%; height: 600px; border: 1px solid #ccc;"
          />
          <div
            v-if="tooltip"
            class="deck-tooltip"
            :style="{ left: pointerX + 'px', top: pointerY + 'px' }"
            v-html="tooltip"
          />
        </div>

        <div class="columns">
          <div class="column">
            <div class="box legend-box">
              <h6 class="title is-6">Legend: Stop Location Types</h6>
              <ul class="legend-list is-flex is-flex-wrap-wrap">
                <li v-for="item in stopTypesLegend" :key="item.type" class="legend-item mr-4">
                  <span class="legend-stop-shape" :style="{ backgroundColor: item.color }"></span>
                  <span>{{ item.name }} ({{ item.type }})</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="column">
            <div class="box legend-box">
              <h6 class="title is-6">Legend: Pathway Modes</h6>
              <ul class="legend-list is-flex is-flex-wrap-wrap">
                <li v-for="item in pathwayTypesLegend" :key="item.type" class="legend-item mr-4">
                  <span class="legend-pathway-shape" :style="{ backgroundColor: item.color }"></span>
                  <span>{{ item.name }} ({{ item.mode }})</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <tl-loading v-if="$apollo.loading" />
  </div>
</template>

<script>
import StationMixin from './pages/station-mixin'
import { Map } from 'maplibre-gl'
import { getBasemapLayers } from './basemaps'
import { schemeCategory10 } from 'd3-scale-chromatic'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { PolygonLayer, ScatterplotLayer, PathLayer, TextLayer } from '@deck.gl/layers'

export default {
  mixins: [StationMixin],
  layout: 'wide',
  data () {
    return {
      map: null,
      deckOverlay: null,
      ready: false,
      cameraPitch: -45,
      cameraBearing: -35,
      cameraZoom: 17,
      levelHeight: 50,
      showPathways: true,
      showStops: true,
      showLevels: true,
      showLevelFills: false,
      showLabels: false,
      visibleLevelIndexes: [],
      centerLng: 0,
      centerLat: 0,
      bounds: null,
      tooltip: null,
      hoveredObject: null,
      pointerX: 0,
      pointerY: 0
    }
  },
  computed: {
    stopTypesLegend () {
      return [
        { type: 0, name: 'Platform' },
        { type: 1, name: 'Station' },
        { type: 2, name: 'Entrance/Exit' },
        { type: 3, name: 'Generic Node' }
      ].map(item => ({ ...item, color: this.getStopColor(item.type) }))
    },
    pathwayTypesLegend () {
      return [
        { mode: 1, name: 'Walkway' },
        { mode: 2, name: 'Stairs' },
        { mode: 3, name: 'Moving Sidewalk' },
        { mode: 4, name: 'Escalator' },
        { mode: 5, name: 'Elevator' },
        { mode: 6, name: 'Fare Gate' },
        { mode: 7, name: 'Exit Gate' }
      ].map(item => ({ ...item, color: this.getPathwayColor(item.mode) }))
    },
    sortedLevels () {
      return [...this.station.levels].sort((a, b) => a.level_index - b.level_index)
    },
    levelColors () {
      return this.sortedLevels.map((level, i) => ({
        ...level,
        color: schemeCategory10[i % schemeCategory10.length]
      }))
    }
  },
  watch: {
    ready (isReady) {
      if (isReady) {
        this.visibleLevelIndexes = this.station.levels.map(l => l.level_index)
        this.$nextTick(() => {
          this.initMap()
        })
      }
    },
    cameraPitch () {
      this.updateCamera()
    },
    cameraBearing () {
      this.updateCamera()
    },
    cameraZoom () {
      this.updateCamera()
    },
    levelHeight () {
      this.updateDeckLayers()
    },
    showPathways () {
      this.updateDeckLayers()
    },
    showStops () {
      this.updateDeckLayers()
    },
    showLevels () {
      this.updateDeckLayers()
    },
    showLevelFills () {
      this.updateDeckLayers()
    },
    showLabels () {
      this.updateDeckLayers()
    },
    'station.levels' () {
      this.updateDeckLayers()
    },
    'station.stops' () {
      this.updateDeckLayers()
    },
    'station.pathways' () {
      this.updateDeckLayers()
    },
    visibleLevelIndexes () {
      this.updateDeckLayers()
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.ready) {
        this.initMap()
      }
      // Add Command+drag rotation
      const container = this.$refs.mapContainer
      if (container) {
        let dragging = false
        let lastX = 0
        let lastY = 0
        const onMouseDown = (e) => {
          if (e.metaKey) {
            dragging = true
            lastX = e.clientX
            lastY = e.clientY
            window.addEventListener('mousemove', onMouseMove)
            window.addEventListener('mouseup', onMouseUp)
            e.preventDefault()
          }
        }
        const onMouseMove = (e) => {
          if (!dragging) return
          const dx = e.clientX - lastX
          const dy = e.clientY - lastY
          lastX = e.clientX
          lastY = e.clientY
          // Sensitivity factors
          this.cameraBearing += dx * 0.5
          this.cameraPitch += -dy * 0.3
          // Clamp pitch
          this.cameraPitch = Math.max(-90, Math.min(90, this.cameraPitch))
          this.updateCamera()
        }
        const onMouseUp = () => {
          dragging = false
          window.removeEventListener('mousemove', onMouseMove)
          window.removeEventListener('mouseup', onMouseUp)
        }
        container.addEventListener('mousedown', onMouseDown)
        this._removeCtrlDrag = () => {
          container.removeEventListener('mousedown', onMouseDown)
        }
      }
    })
  },
  beforeUnmount () {
    if (this._removeCtrlDrag) this._removeCtrlDrag()
  },
  methods: {
    getStopColor (locationType) {
      const colors = {
        0: '#4CAF50', // Platform - Green
        1: '#2196F3', // Station - Blue
        2: '#FF9800', // Entrance/Exit - Orange
        3: '#9C27B0'  // Generic Node - Purple
      }
      return colors[locationType] || '#666'
    },
    getPathwayColor (mode) {
      const colors = {
        1: '#2196F3', // Walkway - Blue
        2: '#FF5722', // Stairs - Red-Orange
        3: '#4CAF50', // Moving Sidewalk - Green
        4: '#FF9800', // Escalator - Orange
        5: '#9C27B0', // Elevator - Purple
        6: '#E91E63', // Fare Gate - Pink
        7: '#795548'  // Exit Gate - Brown
      }
      return colors[mode] || '#666'
    },
    calculateBounds () {
      if (!this.station || !this.station.levels) return null

      let minLng = Infinity, maxLng = -Infinity
      let minLat = Infinity, maxLat = -Infinity

      // Calculate bounds from levels
      for (const level of this.station.levels) {
        if (level.geometry && level.geometry.coordinates) {
          for (const coord of level.geometry.coordinates[0]) {
            minLng = Math.min(minLng, coord[0])
            maxLng = Math.max(maxLng, coord[0])
            minLat = Math.min(minLat, coord[1])
            maxLat = Math.max(maxLat, coord[1])
          }
        }
      }

      // Calculate bounds from stops
      for (const stop of this.station.stops) {
        if (stop.geometry && stop.geometry.coordinates) {
          minLng = Math.min(minLng, stop.geometry.coordinates[0])
          maxLng = Math.max(maxLng, stop.geometry.coordinates[0])
          minLat = Math.min(minLat, stop.geometry.coordinates[1])
          maxLat = Math.max(maxLat, stop.geometry.coordinates[1])
        }
      }

      if (minLng === Infinity) return null

      return {
        minLng, maxLng, minLat, maxLat,
        centerLng: (minLng + maxLng) / 2,
        centerLat: (minLat + maxLat) / 2
      }
    },
    initMap () {
      if (this.map) return

      this.bounds = this.calculateBounds()
      if (!this.bounds) return

      this.centerLng = this.bounds.centerLng
      this.centerLat = this.bounds.centerLat

      const sources = {}
      const layers = []
      for (const [k, v] of Object.entries(getBasemapLayers())) {
        sources[k] = v.source
        layers.push(Object.assign({ id: k, source: k }, v.layer))
      }

      this.map = new Map({
        container: this.$refs.mapContainer,
        center: [this.centerLng, this.centerLat],
        zoom: 17,
        pitch: this.cameraPitch,
        bearing: this.cameraBearing,
        style: {
          version: 8,
          glyphs: '/fonts/{fontstack}/{range}.pbf',
          sources,
          layers
        }
      })

      this.map.on('load', () => {
        this.addDeckOverlay()
        this.updateCamera()
        this.updateDeckLayers()
      })
    },
    addDeckOverlay () {
      if (this.deckOverlay) return
      this.deckOverlay = new MapboxOverlay({
        layers: this.getDeckLayers()
      })
      this.map.addControl(this.deckOverlay)
    },
    hexToRgbArray(hex) {
      hex = hex.replace(/^#/, '')
      if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('')
      }
      const num = parseInt(hex, 16)
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 255]
    },
    getDeckLayers () {
      // Compute correct elevation for stops and pathways
      const levelPolygons = (this.station?.levels || []).map((level, i) => ({
        polygon: level.geometry?.coordinates?.[0] || [],
        color: schemeCategory10[i % schemeCategory10.length],
        elevation: i * this.levelHeight
      }))
      // For outlines, add Z to each coordinate
      const levelOutlinePolygons = (this.station?.levels || []).map((level, i) => {
        const elevation = i * this.levelHeight
        const color = schemeCategory10[i % schemeCategory10.length]
        const coords = (level.geometry?.coordinates?.[0] || []).map(
          c => [c[0], c[1], elevation]
        )
        return {
          polygon: coords,
          color
        }
      })
      const stopPoints = (this.station?.stops || []).map((stop) => {
        const level = this.station.levels.find(l => l.id === stop.level?.id)
        const levelIndex = level ? this.station.levels.indexOf(level) : 0
        const elevation = levelIndex * this.levelHeight + this.levelHeight / 2
        return {
          position: [...(stop.geometry?.coordinates || [0, 0]), elevation],
          color: this.getStopColor(stop.location_type),
          stop_name: stop.stop_name,
          level_index: level?.level_index || 0
        }
      })
      const pathwayLines = (this.station?.pathways || []).map((pw) => {
        const fromLevel = this.station.levels.find(l => l.id === pw.from_stop.level?.id)
        const toLevel = this.station.levels.find(l => l.id === pw.to_stop.level?.id)
        const fromLevelIndex = fromLevel ? this.station.levels.indexOf(fromLevel) : 0
        const toLevelIndex = toLevel ? this.station.levels.indexOf(toLevel) : 0
        const fromElevation = fromLevelIndex * this.levelHeight + this.levelHeight / 2
        const toElevation = toLevelIndex * this.levelHeight + this.levelHeight / 2
        return {
          path: [
            [...(pw.from_stop.geometry?.coordinates || [0, 0]), fromElevation],
            [...(pw.to_stop.geometry?.coordinates || [0, 0]), toElevation]
          ],
          color: this.getPathwayColor(pw.pathway_mode),
          mode: pw.pathway_mode,
          from_level: fromLevel?.level_index,
          to_level: toLevel?.level_index
        }
      })
      // Tooltip layer logic
      const layers = [
        new PolygonLayer({
          id: 'deck-levels',
          data: levelPolygons,
          extruded: true,
          getPolygon: d => d.polygon,
          getElevation: d => d.elevation,
          getFillColor: d => this.hexToRgbArray(d.color),
          visible: this.showLevelFills,
          opacity: 0.2,
          parameters: { depthTest: true }
        }),
        new PolygonLayer({
          id: 'deck-level-outlines',
          data: levelOutlinePolygons,
          extruded: false,
          getPolygon: d => d.polygon,
          getLineColor: d => this.hexToRgbArray(d.color),
          getLineWidth: 2,
          filled: true,
          stroked: true,
          getFillColor: d => {
            const rgb = this.hexToRgbArray(d.color)
            return [rgb[0], rgb[1], rgb[2], 30]
          },
          visible: this.showLevels,
          parameters: { depthTest: true }
        }),
        new ScatterplotLayer({
          id: 'deck-stops',
          data: stopPoints,
          getPosition: d => d.position,
          getFillColor: d => this.hexToRgbArray(d.color),
          getRadius: 4,
          visible: this.showStops,
          pickable: true,
          onHover: info => this.handleHover(info, 'stop')
        }),
        new PathLayer({
          id: 'deck-pathways',
          data: pathwayLines,
          getPath: d => d.path,
          getColor: d => this.hexToRgbArray(d.color),
          getWidth: 2,
          visible: this.showPathways,
          pickable: true,
          onHover: info => this.handleHover(info, 'pathway')
        })
      ]
      // Add TextLayer for labels if enabled
      if (this.showLabels) {
        layers.push(new TextLayer({
          id: 'deck-stop-labels',
          data: stopPoints,
          getPosition: d => d.position,
          getText: d => d.stop_name,
          getColor: [0, 0, 0, 255],
          getSize: 18,
          getTextAnchor: 'middle',
          getAlignmentBaseline: 'top',
          visible: true
        }))
      }
      return layers
    },
    updateDeckLayers () {
      if (this.deckOverlay) {
        this.deckOverlay.setProps({
          layers: this.getDeckLayers()
        })
      }
    },
    updateCamera () {
      if (!this.map) return

      this.map.easeTo({
        center: [this.centerLng, this.centerLat],
        pitch: this.cameraPitch,
        bearing: this.cameraBearing,
        zoom: this.cameraZoom,
        duration: 0
      })
    },
    setIsometricView () {
      this.cameraPitch = -45
      this.cameraBearing = -35
      this.cameraZoom = 17
      this.updateCamera()
    },
    setTopDownView () {
      this.cameraPitch = 0
      this.cameraBearing = 0
      this.cameraZoom = 18
      this.updateCamera()
    },
    setSideView () {
      this.cameraPitch = -90
      this.cameraBearing = 0
      this.cameraZoom = 17
      this.updateCamera()
    },
    resetView () {
      this.setIsometricView()
    },
    fitToBounds () {
      if (!this.bounds || !this.map) return

      this.map.fitBounds([
        [this.bounds.minLng, this.bounds.minLat],
        [this.bounds.maxLng, this.bounds.maxLat]
      ], {
        padding: 50,
        duration: 1000
      })
    },
    handleHover (info, type) {
      if (info.object) {
        this.hoveredObject = info.object
        if (type === 'stop') {
          this.pointerX = info.x
          this.pointerY = info.y
          this.tooltip = `
            <strong>Stop:</strong> ${info.object.stop_name}<br>
            <strong>Level:</strong> ${info.object.level_index}<br>
            <strong>Type:</strong> ${this.getStopTypeName(info.object.color)}<br>
          `
        } else if (type === 'pathway') {
          // Compute midpoint screen position for overlay
          const from = info.object.path[0]
          const to = info.object.path[1]
          const mid = [
            (from[0] + to[0]) / 2,
            (from[1] + to[1]) / 2,
            (from[2] + to[2]) / 2
          ]
          if (info.viewport && info.viewport.project) {
            const [mx, my] = info.viewport.project(mid)
            this.pointerX = mx
            this.pointerY = my
          } else {
            this.pointerX = info.x
            this.pointerY = info.y
          }
          this.tooltip = `
            <strong>Pathway Mode:</strong> ${this.getPathwayModeName(info.object.mode)}<br>
            <strong>From Stop:</strong> ${this.getStopNameByCoords(from)} (Level ${info.object.from_level})<br>
            <strong>To Stop:</strong> ${this.getStopNameByCoords(to)} (Level ${info.object.to_level})<br>
          `
        }
      } else {
        this.tooltip = null
        this.hoveredObject = null
      }
    },
    getStopTypeName(color) {
      // Map color to stop type name for tooltip
      const colorMap = {
        '#4CAF50': 'Platform (0)',
        '#2196F3': 'Station (1)',
        '#FF9800': 'Entrance/Exit (2)',
        '#9C27B0': 'Generic Node (3)'
      }
      if (typeof color === 'string') return colorMap[color] || ''
      // If color is an array, try to match to hex
      const hex = this.rgbArrayToHex(color)
      return colorMap[hex] || ''
    },
    getPathwayModeName(mode) {
      const modeMap = {
        1: 'Walkway (1)',
        2: 'Stairs (2)',
        3: 'Moving Sidewalk (3)',
        4: 'Escalator (4)',
        5: 'Elevator (5)',
        6: 'Fare Gate (6)',
        7: 'Exit Gate (7)'
      }
      return modeMap[mode] || ''
    },
    getStopNameByCoords(coord) {
      // Find stop by coordinates (lng, lat)
      const stop = (this.station?.stops || []).find(s => {
        const c = s.geometry?.coordinates
        return c && Math.abs(c[0] - coord[0]) < 1e-6 && Math.abs(c[1] - coord[1]) < 1e-6
      })
      return stop ? stop.stop_name : ''
    },
    rgbArrayToHex(arr) {
      if (!Array.isArray(arr) || arr.length < 3) return ''
      return (
        '#' +
        ((1 << 24) + (arr[0] << 16) + (arr[1] << 8) + arr[2])
          .toString(16)
          .slice(1)
          .toUpperCase()
      )
    },
  }
}
</script>

<style scoped>
.station-isometric-3d {
  height: 100%;
}

.map-container {
  position: relative;
}

.deck-tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 10;
  background: rgba(255,255,255,0.95);
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 14px;
  color: #222;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  max-width: 260px;
  white-space: pre-line;
}

.legend-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.legend-level-shape {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  margin-right: 0.5rem;
  border: 1px solid #ccc;
}

.legend-stop-shape {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.5rem;
  border: 1px solid #fff;
}

.legend-pathway-shape {
  width: 16px;
  height: 4px;
  margin-right: 0.5rem;
  border-radius: 2px;
}

.legend-box {
  margin-top: 1rem;
}

.buttons.is-fullwidth {
  display: flex;
  width: 100%;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.button.is-fullwidth {
  flex: 1 1 0;
}
</style>

<style>
@import 'maplibre-gl/dist/maplibre-gl';
</style> 