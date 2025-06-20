<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Station Isometric View">
        Station Isometric View: {{ stationName }}
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
      <div class="column is-narrow">
        <div class="block tl-editor-info">
          <div class="box">
            <o-field label="Level Height Scale">
              <o-slider v-model="levelHeightScale" :min="0.1" :max="2.0" :step="0.1" />
            </o-field>

              <o-field label="Rotation X (Tilt)">
                <o-slider v-model="rotationX" :min="-90" :max="90" :step="1" />
              </o-field>
              <o-field label="Rotation Y (Azimuth)">
                <o-slider v-model="rotationY" :min="-180" :max="180" :step="1" />
              </o-field>
              <o-field label="Rotation Z (Roll)">
                <o-slider v-model="rotation" :min="0" :max="360" :step="1" />
              </o-field>
              <o-field label="Zoom">
                <o-slider v-model="zoom" :min="0.1" :max="5.0" :step="0.1" />
              </o-field>

            <div class="field" v-if="!isDefaultView">
              <button class="button is-small is-fullwidth" @click="resetView">
                Reset View
              </button>
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
              <o-switch v-model="showLabels">
                Show All Labels
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

      <div class="column is-three-quarters">
        <div class="box" style="position: relative;">
          <div
            ref="isometricContainer"
            class="isometric-container"
            style="width: 100%; height: 600px; border: 1px solid #ccc;"
          />
          <div ref="tooltip" class="tooltip" />
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
import StationMixin from './station-mixin'
import { select, pointer } from 'd3-selection'
import { schemeCategory10 } from 'd3-scale-chromatic'

const DEFAULT_VIEW_PARAMS = {
  levelHeightScale: 1.0,
  rotation: 0,
  rotationX: -90,
  rotationY: 0,
  zoom: 1.0
}

export default {
  mixins: [StationMixin],
  layout: 'wide',
  data () {
    return {
      ...DEFAULT_VIEW_PARAMS,
      showPathways: true,
      showStops: true,
      showLevels: true,
      showLabels: false,
      visibleLevelIndexes: [],
      svg: null,
      g: null,
      isMounted: false,
      // XY coordinate system
      centerX: 0,
      centerY: 0,
      scale: 1
    }
  },
  computed: {
    isDefaultView () {
      return (
        this.levelHeightScale === DEFAULT_VIEW_PARAMS.levelHeightScale &&
        this.rotation === DEFAULT_VIEW_PARAMS.rotation &&
        this.rotationX === DEFAULT_VIEW_PARAMS.rotationX &&
        this.rotationY === DEFAULT_VIEW_PARAMS.rotationY &&
        this.zoom === DEFAULT_VIEW_PARAMS.zoom
      )
    },
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
          this.updateIsometricView()
        })
      }
    },
    levelHeightScale () {
      this.updateIsometricView()
    },
    rotation () {
      this.updateIsometricView()
    },
    rotationX () {
      this.updateIsometricView()
    },
    rotationY () {
      this.updateIsometricView()
    },
    zoom () {
      this.updateIsometricView()
    },
    showPathways () { this.$nextTick(() => this.updateIsometricView()) },
    showStops () { this.$nextTick(() => this.updateIsometricView()) },
    showLevels () { this.$nextTick(() => this.updateIsometricView()) },
    showLabels () { this.$nextTick(() => this.updateIsometricView()) },
    'station.levels' () { this.$nextTick(() => this.updateIsometricView()) },
    'station.stops' () { this.$nextTick(() => this.updateIsometricView()) },
    'station.pathways' () { this.$nextTick(() => this.updateIsometricView()) },
    visibleLevelIndexes () {
      this.updateIsometricView()
    }
  },
  mounted () {
    this.isMounted = true
    this.$nextTick(() => this.updateIsometricView())
  },
  methods: {
    // Convert geographic coordinates to local XY coordinates
    geoToXY (lng, lat) {
      // Simple conversion: treat longitude as X, latitude as Y
      // Scale by a factor to make the station fit nicely in the view
      const x = (lng - this.centerX) * this.scale
      const y = (lat - this.centerY) * this.scale
      return [x, y]
    },

    // Apply isometric transformation to a 3D point
    transform3D (x, y, z) {
      const radX = (this.rotationX * Math.PI) / 180
      const radY = (this.rotationY * Math.PI) / 180
      const radZ = (this.rotation * Math.PI) / 180

      // Rotation matrices
      const cosX = Math.cos(radX)
      const sinX = Math.sin(radX)
      const cosY = Math.cos(radY)
      const sinY = Math.sin(radY)
      const cosZ = Math.cos(radZ)
      const sinZ = Math.sin(radZ)

      // Apply rotations: Z -> Y -> X
      let x1 = x * cosZ - y * sinZ
      let y1 = x * sinZ + y * cosZ
      let z1 = z

      let x2 = x1 * cosY + z1 * sinY
      let y2 = y1
      let z2 = -x1 * sinY + z1 * cosY

      let x3 = x2
      let y3 = y2 * cosX - z2 * sinX
      let z3 = y2 * sinX + z2 * cosX

      return [x3, y3]
    },

    updateIsometricView () {
      const container = this.$refs.isometricContainer
      if (!this.station || !this.isMounted || !container) return

      const width = container.clientWidth
      const height = container.clientHeight
      if (width === 0 || height === 0) return

      if (!this.svg) {
        this.svg = select(container).append('svg')
        this.g = this.svg.append('g')
      }

      this.svg.attr('width', width).attr('height', height)
      this.g.selectAll('*').remove()

      // Calculate bounding box and center
      const bbox = this.calculateBoundingBox()
      if (bbox) {
        this.centerX = bbox.centerLng
        this.centerY = bbox.centerLat
        
        // Calculate scale to fit in view
        const bboxWidth = bbox.maxLng - bbox.minLng
        const bboxHeight = bbox.maxLat - bbox.minLat
        const maxDimension = Math.max(bboxWidth, bboxHeight)
        const padding = 40
        this.scale = Math.min((width - padding) / maxDimension, (height - padding) / maxDimension) * this.zoom
      }

      // Center the view
      this.g.attr('transform', `translate(${width / 2}, ${height / 2})`)

      if (this.showLevels) this.drawLevels()
      if (this.showPathways) this.drawPathways()
      if (this.showStops) this.drawStops()
    },

    calculateBoundingBox () {
      if (!this.station || !this.station.levels || this.station.levels.length === 0) {
        return null
      }

      let minLng = Infinity
      let maxLng = -Infinity
      let minLat = Infinity
      let maxLat = -Infinity

      this.station.levels.forEach(level => {
        if (level.geometry && level.geometry.coordinates) {
          level.geometry.coordinates.forEach(ring => {
            ring.forEach(point => {
              const [lng, lat] = point
              minLng = Math.min(minLng, lng)
              maxLng = Math.max(maxLng, lng)
              minLat = Math.min(minLat, lat)
              maxLat = Math.max(maxLat, lat)
            })
          })
        }
      })

      // Also include stops in the bounding box calculation
      this.station.stops.forEach(stop => {
        if (stop.geometry && stop.geometry.coordinates) {
          const [lng, lat] = stop.geometry.coordinates
          minLng = Math.min(minLng, lng)
          maxLng = Math.max(maxLng, lng)
          minLat = Math.min(minLat, lat)
          maxLat = Math.max(maxLat, lat)
        }
      })

      if (minLng === Infinity || maxLng === -Infinity) {
        return null
      }

      return {
        minLng,
        maxLng,
        minLat,
        maxLat,
        centerLng: (minLng + maxLng) / 2,
        centerLat: (minLat + maxLat) / 2
      }
    },

    drawLevels () {
      this.levelColors.forEach((level) => {
        if (!level.geometry || level.geometry.type !== 'Polygon') return

        const isVisible = this.visibleLevelIndexes.includes(level.level_index)
        const levelIndex = level.level_index != null ? level.level_index : 0
        const height = levelIndex * 60 * this.levelHeightScale

        const pathData = level.geometry.coordinates.map(ring => {
          const projectedRing = ring.map(point => {
            const [lng, lat] = point
            const [x, y] = this.geoToXY(lng, lat)
            const [tx, ty] = this.transform3D(x, y, -height)
            return [tx, ty]
          }).filter(p => p)

          if (projectedRing.length < 2) return ''
          return 'M' + projectedRing.map(p => p.join(',')).join('L') + 'Z'
        }).join(' ')

        if (pathData) {
          // Draw level fill (only for visible levels)
          if (isVisible) {
            this.g.append('path')
              .attr('d', pathData)
              .attr('fill', level.color)
              .attr('opacity', 0.2)
          }

          // Draw level outline (always, with reduced opacity for hidden levels)
          this.g.append('path')
            .attr('d', pathData)
            .attr('fill', 'none')
            .attr('stroke', level.color)
            .attr('stroke-width', isVisible ? 2 : 1)
            .attr('opacity', isVisible ? 0.8 : 0.3)
            .attr('stroke-dasharray', isVisible ? 'none' : '5,5')
          
          // Add level label (only for visible levels)
          if (this.showLabels && isVisible && level.level_name && level.geometry.coordinates[0].length > 0) {
            const [lng, lat] = level.geometry.coordinates[0][0]
            const [x, y] = this.geoToXY(lng, lat)
            const [tx, ty] = this.transform3D(x, y, -height)
            
            this.g.append('text')
              .attr('x', tx - 10)
              .attr('y', ty - 10)
              .attr('text-anchor', 'end')
              .attr('font-size', '12px')
              .attr('fill', '#333')
              .style('paint-order', 'stroke')
              .style('stroke', 'white')
              .style('stroke-width', '3px')
              .style('stroke-linecap', 'butt')
              .style('stroke-linejoin', 'miter')
              .text(`${level.level_name} (${level.level_index})`)
          }
        }
      })
    },

    drawPathways () {
      this.station.pathways.forEach((pathway) => {
        const fromStop = pathway.from_stop
        const toStop = pathway.to_stop

        if (!fromStop || !toStop || !fromStop.geometry || !toStop.geometry) return

        const fromLevelVisible = this.visibleLevelIndexes.includes(fromStop.level?.level_index)
        const toLevelVisible = this.visibleLevelIndexes.includes(toStop.level?.level_index)

        if (!fromLevelVisible && !toLevelVisible) return

        const [fromLng, fromLat] = fromStop.geometry.coordinates
        const [toLng, toLat] = toStop.geometry.coordinates
        
        const [fromX, fromY] = this.geoToXY(fromLng, fromLat)
        const [toX, toY] = this.geoToXY(toLng, toLat)

        const fromLevelIndex = fromStop.level?.level_index ?? 0
        const toLevelIndex = toStop.level?.level_index ?? 0
        const fromHeight = fromLevelIndex * 60 * this.levelHeightScale
        const toHeight = toLevelIndex * 60 * this.levelHeightScale

        const [p1x, p1y] = this.transform3D(fromX, fromY, -fromHeight)
        const [p2x, p2y] = this.transform3D(toX, toY, -toHeight)

        const drawGhostNode = (x, y) => {
          this.g.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 4)
            .attr('fill', 'none')
            .attr('stroke', '#888')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '2,2')
        }

        if (!fromLevelVisible) drawGhostNode(p1x, p1y)
        if (!toLevelVisible) drawGhostNode(p2x, p2y)

        // Pathway tooltip
        const tooltip = select(this.$refs.tooltip)
        const tooltipHtml = `
          <strong>${pathway.name || pathway.signposted_as || 'Unnamed Pathway'}</strong><br>
          ID: ${pathway.id}<br>
          Mode: ${{1:'Walkway',2:'Stairs',3:'Moving Sidewalk',4:'Escalator',5:'Elevator',6:'Fare Gate',7:'Exit Gate'}[pathway.pathway_mode] || 'Unknown'}<br>
          From: ${fromStop.stop_name || fromStop.stop_id} (L${fromStop.level?.level_index})
          ${fromStop.platform_code ? `<br>&nbsp;&nbsp;Platform: ${fromStop.platform_code}` : ''}
          <br>To: ${toStop.stop_name || toStop.stop_id} (L${toStop.level?.level_index})
          ${toStop.platform_code ? `<br>&nbsp;&nbsp;Platform: ${toStop.platform_code}` : ''}
        `

        const line = this.g.append('line')
          .attr('x1', p1x)
          .attr('y1', p1y)
          .attr('x2', p2x)
          .attr('y2', p2y)
          .attr('stroke', this.getPathwayColor(pathway.pathway_mode))
          .attr('stroke-width', 2)
        line.on('mouseover', (event) => {
          const [mx, my] = pointer(event, this.$refs.isometricContainer)
          const el = select(event.currentTarget)
          el.raise() // raise the line to the top of the stack
          el.attr('stroke', 'yellow')
          tooltip
            .style('opacity', 1)
            .html(tooltipHtml)
            .style('left', `${mx + 15}px`)
            .style('top', `${my}px`)
        })
        line.on('mousemove', (event) => {
          const [mx, my] = pointer(event, this.$refs.isometricContainer)
          tooltip
            .style('left', `${mx + 15}px`)
            .style('top', `${my}px`)
        })
        line.on('mouseout', (event) => {
          const el = select(event.currentTarget)
          el.attr('stroke', this.getPathwayColor(pathway.pathway_mode))
          tooltip.style('opacity', 0)
        })
      })
    },

    drawStops () {
      const visibleStops = this.station.stops.filter(stop =>
        stop.geometry && this.visibleLevelIndexes.includes(stop.level?.level_index)
      )

      visibleStops.forEach((stop) => {
        if (!Array.isArray(stop.geometry.coordinates) || stop.geometry.coordinates.length !== 2) {
          return
        }

        const [lng, lat] = stop.geometry.coordinates
        const [x, y] = this.geoToXY(lng, lat)

        const level = stop.level
        const levelIndex = (level && level.level_index != null) ? level.level_index : 0
        const height = levelIndex * 60 * this.levelHeightScale

        const [cx, cy] = this.transform3D(x, y, -height)

        const circle = this.g.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 4)
          .attr('fill', this.getStopColor(stop.location_type))
          .attr('stroke', '#333')
          .attr('stroke-width', 1.5)

        if (this.showLabels) {
          this.g.append('text')
            .attr('x', cx + 8)
            .attr('y', cy - 8)
            .attr('font-size', '10px')
            .attr('fill', '#333')
            .text(stop.stop_name || stop.stop_id)
        }
      // Add tooltip
      const tooltip = select(this.$refs.tooltip)
      const stopTypeMap = { 0: 'Platform', 1: 'Station', 2: 'Entrance/Exit', 3: 'Generic Node' }
      const tooltipHtml = `
        <strong>${stop.stop_name || 'Unnamed Stop'}</strong><br>
        ID: ${stop.stop_id}<br>
        Level: ${stop.level.level_name || 'N/A'}<br>
        Type: ${stopTypeMap[stop.location_type] || 'Unknown'}
        ${stop.platform_code ? `<br>Platform: ${stop.platform_code}` : ''}
      `

      circle
        .on('mouseover', (event) => {
          const [mx, my] = pointer(event, this.$refs.isometricContainer)
          const el = select(event.currentTarget)
          el.raise() // raise the circle to the top of the stack
          el.attr('stroke', 'yellow')
          el.attr('stroke-width', 2)

          tooltip
            .style('opacity', 1)
            .html(tooltipHtml)
            .style('left', `${mx + 15}px`)
            .style('top', `${my}px`)
        })
        .on('mousemove', (event) => {
          const [mx, my] = pointer(event, this.$refs.isometricContainer)
          tooltip
            .style('left', `${mx + 15}px`)
            .style('top', `${my}px`)
        })
        .on('mouseout', (event) => {
          const el = select(event.currentTarget)
          el.attr('stroke', '#333')
          el.attr('stroke-width', 1.5)
          tooltip.style('opacity', 0)
        })
        
      })
    },

    getPathwayColor (pathwayMode) {
      const colors = {
        1: '#666', // Walkway
        2: '#ff6b6b', // Stairs
        3: '#4ecdc4', // Moving sidewalk
        4: '#45b7d1', // Escalator
        5: '#96ceb4', // Elevator
        6: '#feca57', // Fare gate
        7: '#ff9ff3'  // Exit gate
      }
      return colors[pathwayMode] || '#999'
    },

    getStopColor (locationType) {
      const colors = {
        0: '#e74c3c', // Platform
        1: '#3498db', // Station
        2: '#2ecc71', // Entrance
        3: '#f39c12'  // Node
      }
      return colors[locationType] || '#95a5a6'
    },

    resetView () {
      this.zoom = DEFAULT_VIEW_PARAMS.zoom
      this.rotation = DEFAULT_VIEW_PARAMS.rotation
      this.rotationX = DEFAULT_VIEW_PARAMS.rotationX
      this.rotationY = DEFAULT_VIEW_PARAMS.rotationY
      this.levelHeightScale = DEFAULT_VIEW_PARAMS.levelHeightScale
      this.$nextTick(() => {
        this.updateIsometricView()
      })
    },

    createTooltip (stop) {
      const tooltip = select(this.$refs.tooltip)
      const content = this.getStopTooltipContent(stop)

      return (selection) => {
        selection
          .on('mouseover', (event) => {
            const el = select(event.currentTarget)
            el.raise()
            el.attr('stroke', '#007bff')
            el.attr('stroke-width', 2.5)

            tooltip
              .style('opacity', 1)
              .html(content)
              .style('left', `${event.layerX + 15}px`)
              .style('top', `${event.layerY}px`)
          })
          .on('mousemove', (event) => {
            tooltip
              .style('left', `${event.layerX + 15}px`)
              .style('top', `${event.layerY}px`)
          })
          .on('mouseout', (event) => {
            const el = select(event.currentTarget)
            el.attr('stroke', '#333')
            el.attr('stroke-width', 1.5)
            tooltip.style('opacity', 0)
          })
      }
    }
  }
}
</script>

<style scoped>
.tl-editor-info {
  width: 300px;
}

.legend {
  margin-top: 1em;
}

.legend ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.legend-stop-shape {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 0.5em;
  vertical-align: middle;
  border-radius: 50%;
}

.legend-pathway-shape {
  display: inline-block;
  width: 1.75em;
  height: .5em;
  margin-right: 0.5em;
  vertical-align: middle;
  border: 1px solid #777;
}

.legend-level-shape {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 0.5em;
  vertical-align: middle;
  border: 1px solid #777;
}

.isometric-container {
  background: #f8f9fa;
  border-radius: 4px;
}

.isometric-container svg {
  background: white;
}

.tooltip {
  position: absolute;
  opacity: 0;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  padding: 5px;
  border-radius: 3px;
  pointer-events: none;
  font-size: 12px;
  z-index: 10000;
  display: block;
}

.legend-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 14px;
}

.legend-box {
  height: 100%;
}

.visualization-wrapper {
  position: relative;
  width: 100%;
}
</style> 