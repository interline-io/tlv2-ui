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

              <o-field label="Rotation X (Azimuth)">
                <o-slider v-model="rotationX" :min="-180" :max="180" :step="1" />
              </o-field>
              <o-field label="Rotation Y (Tilt)">
                <o-slider v-model="rotationY" :min="-90" :max="90" :step="1" />
              </o-field>
              <o-field label="Rotation Z (Roll)">
                <o-slider v-model="rotation" :min="0" :max="360" :step="1" />
              </o-field>
            <!-- NOTE: zoom doesn't work so we'll hide it for now -->
            <!-- <div class="column is-half">
              <o-field label="Zoom">
                <o-slider v-model="zoom" :min="0.1" :max="5.0" :step="0.1" />
              </o-field>
            </div> -->

            <div class="field" v-if="levelHeightScale !== 1.0 || rotation !== 150 || rotationX !== 45 || rotationY !== -30 || zoom !== 1.0">
              <button class="button is-small is-fullwidth" @click="fitToView">
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
import { select } from 'd3-selection'
import { geoPath, geoOrthographic } from 'd3-geo'
import { schemeCategory10 } from 'd3-scale-chromatic'

export default {
  mixins: [StationMixin],
  layout: 'wide',
  data () {
    return {
      levelHeightScale: 1.0,
      rotation: 150,
      rotationX: 45,
      rotationY: -30,
      zoom: 1.0,
      showPathways: true,
      showStops: true,
      showLevels: true,
      showLabels: false,
      visibleLevelIndexes: [],
      svg: null,
      g: null,
      projection: null,
      isMounted: false
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
    },
    stationGeometry () {
      if (!this.station) return null
      
      const features = []
      
      // Add level geometries
      this.station.levels.forEach(level => {
        if (level.geometry) {
          features.push({
            type: 'Feature',
            properties: { type: 'level', id: level.id },
            geometry: level.geometry
          })
        }
      })
      
      // Add stop geometries
      this.station.stops.forEach(stop => {
        if (stop.geometry) {
          features.push({
            type: 'Feature',
            properties: { type: 'stop', id: stop.id },
            geometry: stop.geometry
          })
        }
      })
      
      // Add pathway geometries
      this.station.pathways.forEach(pathway => {
        if (pathway.from_stop.geometry && pathway.to_stop.geometry) {
          features.push({
            type: 'Feature',
            properties: { type: 'pathway', id: pathway.id },
            geometry: {
              type: 'LineString',
              coordinates: [
                pathway.from_stop.geometry.coordinates,
                pathway.to_stop.geometry.coordinates
              ]
            }
          })
        }
      })
      
      return {
        type: 'FeatureCollection',
        features
      }
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
      this.updateIsometricView()
    },
    rotation () {
      this.updateIsometricView()
      this.updateIsometricView() // TODO: figure out why it only correctly renders on second call
    },
    rotationX () {
      this.updateIsometricView()
      this.updateIsometricView()
    },
    rotationY () {
      this.updateIsometricView()
      this.updateIsometricView()
    },
    zoom () {
      this.updateIsometricView()
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
      this.updateIsometricView()
    }
  },
  mounted () {
    this.isMounted = true
    this.$nextTick(() => this.updateIsometricView())
  },
  methods: {
    updateIsometricView () {
      const container = this.$refs.isometricContainer
      if (!this.station || !this.isMounted || !container) return

      const width = container.clientWidth
      const height = container.clientHeight
      if (width === 0 || height === 0) return

      if (!this.svg) {
        this.svg = select(container).append('svg')
        this.g = this.svg.append('g')
        this.projection = geoOrthographic().clipAngle(90)
      }

      this.svg.attr('width', width).attr('height', height)
      this.projection.translate([width / 2, height / 2])
      this.g.selectAll('*').remove()

      const padding = 40
      const allPoints = []
      this.station.levels.forEach(level => {
        if (level.geometry && level.geometry.coordinates) {
          level.geometry.coordinates.forEach(ring => ring.forEach(p => allPoints.push(p)))
        }
      })
      this.station.stops.forEach(stop => {
        if (stop.geometry && stop.geometry.coordinates) {
          allPoints.push(stop.geometry.coordinates)
        }
      })

      if (allPoints.length > 0) {
        const fitFeature = { type: 'MultiPoint', coordinates: allPoints }
        this.projection.fitSize([width - padding, height - padding], fitFeature)
        const baseScale = this.projection.scale()
        this.projection
          .scale(baseScale * this.zoom)
          .rotate([this.rotationX, this.rotationY, this.rotation])
      }

      if (this.showLevels) this.drawLevels()
      if (this.showPathways) this.drawPathways()
      if (this.showStops) this.drawStops()
    },

    drawLevels () {
      this.levelColors.forEach((level) => {
        if (!level.geometry || level.geometry.type !== 'Polygon') return

        const isVisible = this.visibleLevelIndexes.includes(level.level_index)
        const levelIndex = level.level_index != null ? level.level_index : 0
        const height = levelIndex * 60 * this.levelHeightScale

        const pathData = level.geometry.coordinates.map(ring => {
          const projectedRing = ring.map(point => {
            const p = this.projection(point)
            if (!p) return null
            p[1] -= height
            return p
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
            const labelPoint = this.projection(level.geometry.coordinates[0][0])
            if (labelPoint) {
              this.g.append('text')
                .attr('x', labelPoint[0] - 10)
                .attr('y', labelPoint[1] - height - 10)
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

        const fromProjected = this.projection(fromStop.geometry.coordinates)
        const toProjected = this.projection(toStop.geometry.coordinates)

        if (!fromProjected || !toProjected) return

        const fromLevelIndex = fromStop.level?.level_index ?? 0
        const toLevelIndex = toStop.level?.level_index ?? 0
        const fromHeight = fromLevelIndex * 60 * this.levelHeightScale
        const toHeight = toLevelIndex * 60 * this.levelHeightScale

        const p1 = [fromProjected[0], fromProjected[1] - fromHeight]
        const p2 = [toProjected[0], toProjected[1] - toHeight]

        const drawGhostNode = (point) => {
          this.g.append('circle')
            .attr('cx', point[0])
            .attr('cy', point[1])
            .attr('r', 4)
            .attr('fill', 'none')
            .attr('stroke', '#888')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '2,2')
        }

        if (!fromLevelVisible) drawGhostNode(p1)
        if (!toLevelVisible) drawGhostNode(p2)

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
          .attr('x1', p1[0])
          .attr('y1', p1[1])
          .attr('x2', p2[0])
          .attr('y2', p2[1])
          .attr('stroke', this.getPathwayColor(pathway.pathway_mode))
          .attr('stroke-width', 2)
        line.on('mouseover', (event) => {
          const el = select(event.currentTarget)
          el.raise() // raise the line to the top of the stack
          el.attr('stroke', 'yellow')
          tooltip
            .style('opacity', 1)
            .html(tooltipHtml)
            .style('left', `${event.layerX + 15}px`)
            .style('top', `${event.layerY}px`)
        })
        line.on('mousemove', (event) => {
          tooltip
            .style('left', `${event.layerX + 15}px`)
            .style('top', `${event.layerY}px`)
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

        const projectedPoint = this.projection(stop.geometry.coordinates)
        if (!projectedPoint) return

        const level = stop.level
        const levelIndex = (level && level.level_index != null) ? level.level_index : 0
        const height = levelIndex * 60 * this.levelHeightScale

        const cx = projectedPoint[0]
        const cy = projectedPoint[1] - height

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
          const el = select(event.currentTarget)
          el.raise() // raise the circle to the top of the stack
          el.attr('stroke', 'yellow')
          el.attr('stroke-width', 2)

          tooltip
            .style('opacity', 1)
            .html(tooltipHtml)
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
        
      })
    },

    getPathwayModeName (mode) {
      const names = {
        1: 'Walkway',
        2: 'Stairs',
        3: 'Moving Sidewalk',
        4: 'Escalator',
        5: 'Elevator',
        6: 'Fare Gate',
        7: 'Exit Gate'
      }
      return names[mode] || 'Unknown'
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

    fitToView () {
      this.zoom = 1.0
      this.rotation = 150
      this.rotationX = 45
      this.rotationY = -30
      this.$nextTick(() => {
        this.updateIsometricView()
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