<template>
  <div
    id="map"
    ref="mapelem"
    class="map"
  />
</template>

<script>
import { Map as MaplibreMap } from 'maplibre-gl'
import { nextTick } from 'vue'
import { PathwayModeIcons, getBasemapLayers } from './basemaps'

function distance (p1, p2) {
  return ((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2) ** 0.5
}

const LEVEL_COLORS = [
  '#d53e4f',
  '#fc8d59',
  '#fee08b',
  '#ffffbf',
  '#e6f598',
  '#99d594',
  '#3288bd'
]

export default {
  props: {
    station: {
      type: Object,
      default () { return null }
    },
    basemap: {
      type: String,
      default () { return 'carto' }
    },
    zoom: {
      type: Number,
      default () { return 17 }
    },
    center: {
      type: Array,
      default () { return [0, 0] }
    },
    otherStops: {
      type: Array,
      default () { return [] }
    },
    routes: {
      type: Array,
      default () { return [] }
    },
    selectedStops: {
      type: Array,
      default () { return [] }
    },
    selectedPathways: {
      type: Array,
      default () { return [] }
    },
    selectedLevels: {
      type: Array,
      default () { return [] }
    },
    selectedPathwayTransitionTypes: {
      type: String,
      default () { return 'all' }
    },
    selectedAgencies: {
      type: Array,
      default () { return null }
    },
    search: {
      type: Boolean,
      default () { return false }
    }
  },
  emits: ['select-point', 'select-stop', 'select-pathway', 'move-stop-save'],
  data () {
    return {
      ready: false,
      map: null,
      levelLayers: {}
    }
  },
  watch: {
    basemap (cur, prev) {
      this.map.setLayoutProperty(prev, 'visibility', 'none')
      this.map.setLayoutProperty(cur, 'visibility', 'visible')
    },
    selectedStops (cur, prev) {
      for (const i of (prev || [])) {
        this.map.setFeatureState(
          { source: 'stops', id: i.id },
          { hover: false }
        )
      }
      for (const i of (cur || [])) {
        this.map.setFeatureState(
          { source: 'stops', id: i.id },
          { hover: true }
        )
      }
    },
    selectedPathways (cur, prev) {
      for (const i of (prev || [])) {
        this.map.setFeatureState(
          { source: 'pathways', id: i.id },
          { hover: false }
        )
      }
      for (const i of (cur || [])) {
        this.map.setFeatureState(
          { source: 'pathways', id: i.id },
          { hover: true }
        )
      }
    },
    selectedLevels () {
      const strids = this.selectedLevels.map((s) => { return String(s) })
      for (const [levelId, layerIds] of Object.entries(this.levelLayers)) {
        const pfx = `level-${levelId}`
        const vis = strids.includes(levelId) ? 'visible' : 'none'
        const spt = this.selectedPathwayTransitionTypes
        for (const k of layerIds) {
          this.map.setLayoutProperty(k, 'visibility', vis)
          if (k.startsWith(pfx + '-pathway-type')) {
            if (spt === 'same' && !k.startsWith(pfx + '-pathway-type-' + spt)) {
              this.map.setLayoutProperty(k, 'visibility', 'none')
            }
            if (spt === 'transition' && !k.startsWith(pfx + '-pathway-type-' + spt)) {
              this.map.setLayoutProperty(k, 'visibility', 'none')
            }
          }
        }
      }
    },
    selectedAgencies () {
      this.drawStops()
    },
    'station.pathways' () {
      this.drawPathways()
    },
    'station.levels' () {
      this.drawLevels()
    },
    'station.stops' () {
      this.drawStops()
    },
    routes () {
      this.drawRoutes()
    }
  },
  mounted () {
    nextTick(() => { this.initMap() })
  },
  methods: {
    addLevelLayer (levelId, layer) {
      if (!this.map.getLayer(layer.id)) {
        this.map.addLayer(layer)
        if (this.levelLayers[levelId] === undefined) {
          this.levelLayers[levelId] = []
        }
        this.levelLayers[levelId].push(layer.id)
      }
    },
    redraw () {
      this.drawRoutes()
      this.drawLevels()
      this.drawPathways()
      this.drawStops()
    },
    drawRoutes () {
      if (!this.ready) {
        return
      }
      const features = this.routes
      this.map.getSource('routes').setData({
        type: 'FeatureCollection',
        features
      })
      this.addLevelLayer('routes',
        {
          id: 'routes',
          type: 'line',
          source: 'routes',
          paint: {
            'line-color': ['get', 'stroke'],
            'line-width': ['get', 'stroke-width']
          }
        }
      )
    },
    drawLevels () {
      if (!this.ready || !this.station) {
        return
      }
      const features = []
      for (const level of this.station.levels || []) {
        if (!level.geometry) {
          continue
        }
        features.push({ type: 'Feature', id: level.id, properties: { id: level.id }, geometry: level.geometry })
        this.addLevelLayer(level.id,
          {
            id: `level-${level.id}-level`,
            type: 'fill',
            source: 'levels',
            layout: {},
            paint: {
              'fill-color': '#3bb2d0',
              'fill-outline-color': '#3bb2d0',
              'fill-opacity': 0.1
            },
            filter: ['==', level.id, ['get', 'id']]
          }
        )
        this.addLevelLayer(level.id,
          {
            id: `level-${level.id}-level-outline`,
            type: 'line',
            source: 'levels',
            paint: {
              'line-color': '#3bb2d0',
              'line-width': 2
            },
            filter: ['==', level.id, ['get', 'id']]
          }
        )
      }
      this.map.getSource('levels').setData({
        type: 'FeatureCollection',
        features
      })
    },
    drawStops () {
      if (!this.ready || !this.station) {
        return
      }

      // filter stops based on agency
      const allStops = [...this.station.stops, ...this.otherStops]

      // get geoms
      const geoms = {}
      for (const stop of allStops) {
        geoms[stop.id] = stop.geometry.coordinates
      }

      // get layers
      const levelColors = new Map()
      levelColors.set(0, '#87a9ff')
      for (const [i, level] of this.station.levels.entries()) {
        levelColors.set(
          level.id,
          LEVEL_COLORS[i % LEVEL_COLORS.length]
        )
      }

      for (const [levelId, color] of levelColors) {
        this.addLevelLayer(
          levelId,
          {
            id: `level-${levelId}-stops-selected`,
            type: 'circle',
            source: 'stops',
            paint: {
              'circle-radius': 16,
              'circle-color': '#00ff00',
              'circle-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1,
                0.0
              ]
            },
            filter: ['==', levelId, ['get', 'level_id']]
          }
        )
        this.addLevelLayer(
          levelId,
          {
            id: `level-${levelId}-stops`,
            type: 'circle',
            source: 'stops',
            paint: {
              'circle-radius': 8,
              'circle-color': color
            },
            filter: ['==', levelId, ['get', 'level_id']]
          }
        )
        this.addLevelLayer(
          levelId,
          {
            id: `level-${levelId}-stops-text`,
            type: 'symbol',
            source: 'stops',
            layout: {
              'text-allow-overlap': true,
              'text-field': ['get', 'level_index'],
              'text-font': ['DIN Offc Pro Regular Sans Regular', 'Arial Unicode MS Regular'],
              'text-size': 10
            },
            filter: ['==', levelId, ['get', 'level_id']]
          }
        )
        this.addLevelLayer(
          levelId,
          {
            id: `level-${levelId}-stops-stop-name`,
            type: 'symbol',
            source: 'stops',
            layout: {
              'text-allow-overlap': true,
              'text-anchor': 'left',
              'text-field': ['get', 'stop_name'],
              'text-font': ['DIN Offc Pro Regular Sans Regular', 'Arial Unicode MS Regular'],
              'text-size': 12,
              'text-offset': [1.0, 0]
            },
            filter: ['==', levelId, ['get', 'level_id']]
          }
        )
        this.addLevelLayer(
          levelId,
          {
            id: `level-${levelId}-stops-parent-stations`,
            type: 'line',
            source: 'stops-parent-stations',
            paint: {
              'line-color': 'red',
              'line-opacity': 0.5,
              'line-width': 2
            },
            filter: ['==', levelId, ['get', 'level_id']]
          }
        )
      }

      const newStops = {
        type: 'FeatureCollection',
        features: allStops.map((s) => {
          return {
            type: 'Feature',
            id: s.id,
            properties: {
              level_id: s.level?.id || 0,
              level_index: s.level?.level_index,
              stop_name: s.stop_name
            },
            geometry: s.geometry
          }
        })
      }

      this.map.getSource('stops').setData(newStops)

      const stopParentStationGeoms = allStops.filter((s) => { return s.parent && s.parent.id && s.parent.id !== this.station.id }).map((s) => {
        return {
          type: 'Feature',
          id: s.id,
          properties: {
            level_id: s.level?.id || 0,
            level_index: s.level?.level_index,
            stop_name: s.stop_name
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              s.geometry.coordinates,
              geoms[s.parent.id]
            ]
          }
        }
      })
      this.map.getSource('stops-parent-stations').setData({
        type: 'FeatureCollection',
        features: stopParentStationGeoms
      })
    },
    drawPathways () {
      if (!this.ready || !this.station) {
        return
      }
      const pwLevels = new Map()
      for (const pw of this.station.pathways || []) {
        const levelId1 = pw.from_stop.level ? pw.from_stop.level.id : null
        pwLevels.set(levelId1, true)
      }
      for (const levelId1 of pwLevels.keys()) {
        this.addLevelLayer(
          levelId1,
          {
            id: `level-${levelId1}-pathway-selected`,
            type: 'line',
            source: 'pathways',
            paint: {
              'line-color': 'yellow',
              'line-width': 16,
              'line-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1,
                0.0
              ]
            },
            filter: ['any', ['==', levelId1, ['get', 'from_level_id']], ['==', levelId1, ['get', 'to_level_id']]]
          }
        )
        this.addLevelLayer(
          levelId1,
          {
            id: `level-${levelId1}-pathway-type-same`,
            type: 'line',
            source: 'pathways',
            paint: {
              'line-color': 'blue',
              'line-opacity': [
                'case',
                ['==', ['get', 'generated'], true], 0.0,
                1.0
              ],
              'line-width': 4
            },
            filter: [
              'all',
              ['any', ['==', levelId1, ['get', 'from_level_id']], ['==', levelId1, ['get', 'to_level_id']]],
              [
                '==', ['get', 'from_level_id'], ['get', 'to_level_id']
              ]
            ]
          }
        )
        this.addLevelLayer(
          levelId1,
          {
            id: `level-${levelId1}-pathway-type-transition`,
            type: 'line',
            source: 'pathways',
            paint: {
              'line-color': 'red',
              'line-opacity': [
                'case',
                ['==', ['get', 'generated'], true], 0.0,
                1.0
              ],
              'line-width': 4
            },
            filter: [
              'all',
              ['any', ['==', levelId1, ['get', 'from_level_id']], ['==', levelId1, ['get', 'to_level_id']]],
              [
                '!=', ['get', 'from_level_id'], ['get', 'to_level_id']
              ]
            ]
          }
        )
        this.addLevelLayer(
          levelId1,
          {
            id: `level-${levelId1}-pathway-icon`,
            type: 'symbol',
            source: 'pathways-midpoints',
            layout: {
              'icon-image': ['get', 'icon'],
              'icon-size': 0.25
            },
            filter: ['any', ['==', levelId1, ['get', 'from_level_id']], ['==', levelId1, ['get', 'to_level_id']]]
          }
        )
      }

      // Add midpoints
      const midpoints = this.station.pathways.map((s) => {
        return {
          type: 'Feature',
          id: s.id,
          properties: {
            description: 'ok',
            from_level_id: s.from_stop.level?.id,
            to_level_id: s.to_stop.level?.id,
            icon: PathwayModeIcons[s.pathway_mode].icon
          },
          geometry: {
            type: 'Point',
            coordinates: [
              (s.from_stop.geometry.coordinates[0] + s.to_stop.geometry.coordinates[0]) / 2,
              (s.from_stop.geometry.coordinates[1] + s.to_stop.geometry.coordinates[1]) / 2
            ]
          }
        }
      })
      this.map.getSource('pathways-midpoints').setData({
        type: 'FeatureCollection',
        features: midpoints
      })

      // Add pathways
      const features = this.station.pathways.map((s) => {
        return {
          type: 'Feature',
          id: s.id,
          properties: {
            from_stop_id: s.from_stop.id,
            to_stop_id: s.to_stop.id,
            level_id: s.from_stop.level?.id,
            from_level_id: s.from_stop.level?.id,
            to_level_id: s.to_stop.level?.id,
            generated: s.generated || false
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              s.from_stop.geometry.coordinates,
              s.to_stop.geometry.coordinates
            ]
          }
        }
      })
      this.map.getSource('pathways').setData({
        type: 'FeatureCollection',
        features
      })

      // Force redraw of selection
      for (const i of (this.selectedPathways || [])) {
        this.map.setFeatureState(
          { source: 'pathways', id: i.id },
          { hover: true }
        )
      }
    },
    ///
    initMap () {
      if (this.map) {
        return
      }
      const sources = {}
      const layers = []
      for (const [k, v] of Object.entries(getBasemapLayers())) {
        sources[k] = v.source
        layers.push(Object.assign({ id: k, source: k }, v.layer))
      }
      this.map = new MaplibreMap({
        container: this.$refs.mapelem,
        center: this.center,
        zoom: this.zoom,
        style: {
          version: 8,
          glyphs: '/fonts/{fontstack}/{range}.pbf',
          sources,
          layers
        }
      })
      this.map.doubleClickZoom.disable()
      this.map.getCanvas().style.cursor = 'default'
      if (this.search) {
        // this.map.addControl(
        //   new PeliasGeocoder({
        //     params: { api_key: process.env.peliasApikey },
        //     flyTo: false,
        //     wof: true,
        //     url: 'https://api.geocode.earth/v1/',
        //     useFocusPoint: true,
        //     marker: {
        //       icon: 'marker',
        //       multiple: false
        //     }
        //   }),
        //   'top-right'
        // )
      }
      // Load images, defer drawing map until loaded
      this.map.on('load', async () => {
        for (const icon of Object.values(PathwayModeIcons)) {
          const image2 = await this.map.loadImage(`/icons/${icon.icon}.png`)
          this.map.addImage(icon.icon, image2.data)
        }
        this.drawMap()
      })
    },
    drawMap () {
      // Sources
      this.map.addSource('stops', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })
      this.map.addSource('stops-parent-stations', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })
      this.map.addSource('pathways', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })
      this.map.addSource('pathways-midpoints', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })
      this.map.addSource('levels', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })
      this.map.addSource('routes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })

      // Actions
      this.map.on('click', (e) => {
        this.$emit('select-point', e.lngLat)
      })
      this.map.on('click', (e) => {
        const features = this.map.queryRenderedFeatures(e.point, (f) => { return f.source === 'stops' || f.source === 'pathways' })
        if (features.length === 0) {
          return
        }
        const feature = features[0]
        if (feature.source === 'stops') {
          this.$emit('select-stop', feature.id)
        } else if (feature.source === 'pathways') {
          this.$emit('select-pathway', feature.id)
        }
      })
      this.map.on('mousedown', (e) => {
        // Get the top most stop
        const features = this.map.queryRenderedFeatures(e.point, (f) => { return f.source === 'stops' || f.source === 'pathways' })
        if (features.length === 0) {
          return
        }
        const feature = features[0]
        if (feature.source !== 'stops') {
          return
        }
        // Prevent the default map drag behavior.
        e.preventDefault()
        const dragStartPoint = e.point
        // Get reference to update geometry
        let dragStop = null
        for (const stop of this.station.stops) {
          if (stop.id === feature.id) {
            dragStop = stop
          }
        }
        if (!dragStop) {
          return
        }
        if (!this.selectedStops.map((s) => { return s.id }).includes(dragStop.id)) {
          return
        }
        const mouseMove = (e) => {
          const d = distance(dragStartPoint, e.point)
          if (d < 10) {
            return
          }
          dragStop.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat]
          this.drawStops()
          this.drawPathways()
        }
        this.map.on('mousemove', mouseMove)
        this.map.once('mouseup', (e) => {
          const dragEndPoint = e.point
          const d = distance(dragStartPoint, dragEndPoint)
          if (d > 10) {
            this.$emit('move-stop-save', dragStop.id, e.lngLat)
          }
          this.map.off('mousemove', mouseMove)
        })
      })
      // Redraw
      this.ready = true
      this.redraw()
    }
  }
}
</script>

  <style scoped>
  #map {
    height: 600px;
  }
  </style>

  <style scss>
  @import 'maplibre-gl/dist/maplibre-gl';
  </style>
