<template>
  <div id="mapelem" ref="mapelem" :class="mapClass" />
</template>

<script>
import maplibre from 'maplibre-gl'
import { noLabels, labels } from 'protomaps-themes-base'
import { nextTick } from 'vue'
import mapLayers from './map-layers'

export default {
  props: {
    hideTiles: { type: Boolean, default: false },
    markerCoords: { type: Array, default () { return [] } },
    markers: { type: Array, default () { return [] } },
    enableScrollZoom: { type: Boolean, default: false },
    showProblematicGeometries: { type: Boolean, default: true },
    showGeneratedGeometries: { type: Boolean, default: true },
    mapClass: { type: String, default: 'short' },
    routeTiles: { type: Object, default () { return null } },
    stopTiles: { type: Object, default () { return null } },
    stopFeatures: { type: Array, default () { return [] } },
    routeFeatures: { type: Array, default () { return [] } },
    interactive: { type: Boolean, default: true },
    autoFit: { type: Boolean, default: true },
    center: { type: Array, default () { return null } },
    circleRadius: { type: Number, default: 1 },
    circleColor: { type: String, default: '#f03b20' },
    zoom: { type: Number, default: 4 },
    hash: { type: Boolean, default: false },
    features: {
      type: Array, default () { return [] }
    }
  },
  data () {
    return {
      map: null,
      marker: null,
      hoveringRoutes: [],
      hoveringStops: [],
      markerLayer: null
    }
  },
  watch: {
    hideTiles () {
      this.updateFilters()
    },
    showProblematicGeometries () {
      this.updateFilters()
    },
    showGeneratedGeometries () {
      this.updateFilters()
    },
    features (v) {
      this.nextTickUpdateFeatures(v)
    },
    stopFeatures (v) {
      this.nextTickUpdateFeatures(v)
    },
    routeFeatures (v) {
      this.nextTickUpdateFeatures(v)
    },
    center (oldVal, newVal) {
      if (oldVal.toString() === newVal.toString()) {
        return
      }
      this.map.jumpTo({ center: this.center, zoom: this.zoom })
    },
    zoom () {
      this.map.jumpTo({ center: this.center, zoom: this.zoom })
    },
    markers (v) {
      this.drawMarkers(v)
    }
  },
  mounted () {
    if (this.features) {
      nextTick(() => { this.initMap() })
    }
  },
  methods: {
    nextTickUpdateFeatures (v) {
      if (v) {
        nextTick(() => {
          this.updateFeatures()
        })
      }
    },
    saveImage () {
      const canvas = this.map.getCanvas() // .toDataURL('image/png')
      const fileName = 'image'
      const link = document.createElement('a')
      link.download = fileName + '.png'
      canvas.toBlob(function (blob) {
        link.href = URL.createObjectURL(blob)
        link.click()
      })
    },
    initMap () {
      if (this.map) {
        return
      }
      const opts = {
        hash: this.hash,
        interactive: this.interactive,
        preserveDrawingBuffer: true,
        container: this.$refs.mapelem,
        style: {
          glyphs: 'https://cdn.protomaps.com/fonts/pbf/{fontstack}/{range}.pbf',
          version: 8,
          sources: {
            'protomaps-base': {
              type: 'vector',
              tiles: [`https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.pbf?key=${this.$config.public.protomapsApikey}`],
              maxzoom: 14,
              attribution: '<a href="https://www.transit.land/terms">Transitland</a> | <a href="https://protomaps.com">Protomaps</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }
          },
          layers: noLabels('protomaps-base', 'grayscale')
        }
      }
      if (this.center && this.center.length > 0) {
        opts.center = this.center
      }
      if (this.zoom) {
        opts.zoom = this.zoom
      }

      // maplibre.setRTLTextPlugin("https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js")
      this.map = new maplibre.Map(opts)
      this.map.addControl(new maplibre.FullscreenControl())
      this.map.addControl(new maplibre.NavigationControl())
      this.markerLayer = []
      if (!this.enableScrollZoom) {
        this.map.scrollZoom.disable()
      }
      this.drawMarkers(this.markers)
      this.map.on('load', () => {
        this.createSources()
        this.createLayers()
        this.updateFeatures()
        this.fitFeatures()
        this.map.on('mousemove', this.mapMouseMove)
        this.map.on('click', this.mapClick)
        this.map.on('zoom', this.mapZoom)
        this.map.on('moveend', this.mapMove)
        this.map.resize()
      })
    },
    updateFeatures () {
      console.log('Updating features:', {
        stopFeatures: this.stopFeatures.length,
        routeFeatures: this.routeFeatures.length,
        usingTiles: {
          stops: !!this.stopTiles,
          routes: !!this.routeTiles
        }
      })
      const polygons = this.features.filter((s) => { return s.geometry.type === 'MultiPolygon' || s.geometry.type === 'Polygon' })
      const points = this.features.filter((s) => { return s.geometry.type === 'Point' })
      const lines = this.features.filter((s) => { return s.geometry.type === 'LineString' })

      // check if map is initialized...
      const p = this.map.getSource('polygons')
      if (!p) {
        console.warn('Map not initialized yet')
        return
      }

      this.map.getSource('polygons').setData({ type: 'FeatureCollection', features: polygons })
      this.map.getSource('lines').setData({ type: 'FeatureCollection', features: lines })
      this.map.getSource('points').setData({ type: 'FeatureCollection', features: points })

      // Only update if using GeoJSON sources
      if (!this.stopTiles) {
        console.log('Updating GeoJSON stops source:', {
          featureCount: this.stopFeatures.length,
          features: this.stopFeatures.map(f => ({
            id: f.id,
            type: f.type,
            properties: f.properties
          }))
        })
        this.map.getSource('stops').setData({ 
          type: 'FeatureCollection', 
          features: this.stopFeatures 
        })
      }
      if (!this.routeTiles) {
        console.log('Updating GeoJSON routes source:', {
          featureCount: this.routeFeatures.length,
          features: this.routeFeatures.map(f => ({
            id: f.id,
            type: f.type,
            properties: f.properties
          }))
        })
        this.map.getSource('routes').setData({ 
          type: 'FeatureCollection', 
          features: this.routeFeatures 
        })
      }

      this.fitFeatures()
    },
    updateFilters () {
      for (const v of mapLayers.stopLayers) {
        const f = (v.filter || []).slice()
        if (f.length === 0) {
          f.push('all')
        }
        // Hide all routes?
        if (this.hideTiles) {
          f.push(['==', 'route_id', ''])
        }
        if (f.length > 1) {
          this.map.setFilter(v.name, f)
        } else {
          this.map.setFilter(v.name, null)
        }
      }

      for (const v of mapLayers.routeLayers) {
        const f = (v.filter || []).slice()
        if (f.length === 0) {
          f.push('all')
        }
        // Hide all routes?
        if (this.hideTiles) {
          f.push(['==', 'route_id', ''])
        }

        // Hide geometries with long max segment lengths
        if (!this.showProblematicGeometries) {
          f.push(['any', ['==', 'generated', true], ['<', 'geometry_max_segment_length', 50 * 1000]])
          f.push(['any', ['==', 'generated', false], ['<', 'geometry_max_segment_length', 5 * 1000]])
        }
        // Hide generated geometries
        if (!this.showGeneratedGeometries) {
          f.push(['==', 'generated', false])
        }
        if (f.length > 1) {
          this.map.setFilter(v.name, f)
        } else {
          this.map.setFilter(v.name, null)
        }
      }
    },
    createSources () {
      console.log('Creating sources:', {
        routeTiles: this.routeTiles,
        stopTiles: this.stopTiles,
        routeFeatures: this.routeFeatures.length,
        stopFeatures: this.stopFeatures.length
      })

      this.map.addSource('polygons', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })
      this.map.addSource('lines', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })
      this.map.addSource('points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })
      // Add route/stop sources

      if (this.routeTiles) {
        console.log('Adding vector tile source for routes:', this.routeTiles)
        this.map.addSource('routes', {
          type: 'vector',
          tiles: [this.routeTiles.url],
          minzoom: this.routeTiles.minzoom || 0,
          maxzoom: this.routeTiles.maxzoom || 14
        })
      } else {
        console.log('Adding GeoJSON source for routes:', {
          featureCount: this.routeFeatures.length,
          firstFeature: this.routeFeatures[0]
        })
        this.map.addSource('routes', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: this.routeFeatures }
        })
      }

      if (this.stopTiles) {
        this.map.addSource('stops', {
          type: 'vector',
          tiles: [this.stopTiles.url],
          minzoom: this.stopTiles.minzoom || 0,
          maxzoom: this.stopTiles.maxzoom || 14
        })
      } else {
        this.map.addSource('stops', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: this.stopFeatures }
        })
      }
    },
    createLayers () {
      console.log('Creating layers with paint properties:', mapLayers)

      // Add route layers
      for (const v of mapLayers.routeLayers) {
        const layer = {
          id: v.name,
          type: 'line',
          source: 'routes',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          minzoom: v.minzoom || 0,
          paint: v.paint
        }
        if (this.routeTiles) {
          layer['source-layer'] = this.routeTiles.id
        }
        if (v.filter) {
          layer.filter = v.filter.slice()
        }
        console.log('Adding route layer:', {
          name: v.name,
          paint: v.paint,
          filter: v.filter
        })
        this.map.addLayer(layer)
      }

      // Add stop layers  
      for (const v of mapLayers.stopLayers) {
        const layer = {
          id: v.name,
          type: 'circle',
          source: 'stops',
          paint: v.paint
        }
        if (this.stopTiles) {
          layer['source-layer'] = this.stopTiles.id
        }
        if (v.filter) {
          layer.filter = v.filter.slice()
        }
        console.log('Adding stop layer:', {
          name: v.name,
          paint: v.paint,
          filter: v.filter
        })
        this.map.addLayer(layer)
      }

      // Other feature layers
      this.map.addLayer({
        id: 'polygons',
        type: 'fill',
        source: 'polygons',
        layout: {},
        paint: {
          'fill-color': '#ccc',
          'fill-opacity': 0.2
        }
      })
      this.map.addLayer({
        id: 'polygons-outline',
        type: 'line',
        source: 'polygons',
        layout: {},
        paint: {
          'line-width': 2,
          'line-color': '#000',
          'line-opacity': 0.2
        }
      })
      this.map.addLayer({
        id: 'points',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-color': ['coalesce', ['get', 'marker-color'], this.circleColor],
          'circle-radius': ['coalesce', ['get', 'marker-radius'], this.circleRadius],
          'circle-opacity': 0.4
        }
      })
      this.map.addLayer({
        id: 'lines',
        type: 'line',
        source: 'lines',
        layout: {},
        paint: {
          'line-color': ['coalesce', ['get', 'stroke'], '#000'],
          'line-width': ['coalesce', ['get', 'stroke-width'], 2],
          'line-opacity': 1.0
        }
      })
      // add labels last
      for (const labelLayer of labels('protomaps-base', 'grayscale')) {
        this.map.addLayer(labelLayer)
      }
      // Set initial show generated geometry
      this.updateFilters()
    },

    drawMarkers (markers) {
      for (const m of this.markerLayer) {
        m.remove()
      }
      for (const m of markers) {
        const newMarker = new maplibre.Marker(m).setLngLat(m).addTo(this.map)
        if (m.onDragEnd) {
          newMarker.on('dragend', m.onDragEnd)
        }
        this.markerLayer.push(newMarker)
      }
    },
    fitFeatures () {
      const coords = []
      for (const f of [...this.features, ...this.routeFeatures, ...this.stopFeatures]) {
        const g = f.geometry
        if (g.type === 'Point') {
          coords.push(g.coordinates)
        } else if (g.type === 'LineString') {
          for (const c of g.coordinates) {
            coords.push(c)
          }
        } else if (g.type === 'Polygon') {
          for (const a of g.coordinates) {
            for (const b of a) {
              coords.push(b)
            }
          }
        } else if (g.type === 'MultiLineString') {
          for (const a of g.coordinates) {
            for (const b of a) {
              coords.push(b)
            }
          }
        }
      }
      if (this.autoFit && coords.length > 0) {
        const bounds = coords.reduce(function (bounds, coord) {
          return bounds.extend(coord)
        }, new maplibre.LngLatBounds(coords[0], coords[0]))
        this.map.fitBounds(bounds, {
          duration: 0,
          padding: 20,
          maxZoom: 14
        })
      }
    },
    mapClick (e) {
      this.$emit('mapClick', e)
    },
    mapZoom () {
      this.$emit('setZoom', this.map.getZoom())
    },
    mapMove () {
      this.$emit('mapMove', { zoom: this.map.getZoom(), bbox: this.map.getBounds().toArray() })
    },
    mapMouseMove (e) {
      const map = this.map
      let routeFeatures = []
      let stopFeatures = []

      // Query features
      const routeLayers = this.routeTiles ? ['route-active'] : [
        'route-active',
        'route-rail',
        'route-rail-outline',
        'route-bus-unknown',
        'route-bus-low',
        'route-bus-medium',
        'route-bus-high',
        'route-tram',
        'route-metro',
        'route-other'
      ]
      const stopLayer = this.stopTiles ? 'stop-active' : 'stops'

      // Query all route layers
      for (const layer of routeLayers) {
        if (map.getLayer(layer)) {
          try {
            const features = map.queryRenderedFeatures(e.point, { layers: [layer] })
            routeFeatures = routeFeatures.concat(features)
          } catch (err) {
            console.warn(`Error querying route layer ${layer}:`, err)
          }
        }
      }

      // Query stop layer
      if (map.getLayer(stopLayer)) {
        try {
          stopFeatures = map.queryRenderedFeatures(e.point, { layers: [stopLayer] })
        } catch (err) {
          console.warn('Error querying stop features:', err)
        }
      }

      // Update cursor
      map.getCanvas().style.cursor = stopFeatures.length || routeFeatures.length ? 'pointer' : ''

      // Handle route hover states
      for (const k of this.hoveringRoutes) {
        for (const layer of routeLayers) {
          if (map.getLayer(layer)) {
            try {
              map.setFeatureState(
                { source: 'routes', sourceLayer: this.routeTiles ? 'routes' : undefined, id: k },
                { hover: false }
              )
            } catch (err) {
              console.warn(`Error removing hover state from route ${k} in layer ${layer}:`, err)
            }
          }
        }
      }
      this.hoveringRoutes = []

      // Set hover state for found routes
      for (const v of routeFeatures) {
        this.hoveringRoutes.push(v.id)
        for (const layer of routeLayers) {
          if (map.getLayer(layer)) {
            try {
              map.setFeatureState(
                { source: 'routes', sourceLayer: this.routeTiles ? 'routes' : undefined, id: v.id },
                { hover: true }
              )
            } catch (err) {
              console.warn(`Error setting hover state for route ${v.id} in layer ${layer}:`, err)
            }
          }
        }
      }

      // Handle stop hover states
      for (const k of this.hoveringStops) {
        if (map.getLayer(stopLayer)) {
          try {
            map.setFeatureState(
              { source: 'stops', id: k, sourceLayer: this.stopTiles ? this.stopTiles.id : null },
              { hover: false }
            )
          } catch (err) {
            console.warn('Error removing stop hover state:', err)
          }
        }
      }
      this.hoveringStops = []

      for (const v of stopFeatures) {
        this.hoveringStops.push(v.id)
        if (map.getLayer(stopLayer)) {
          try {
            map.setFeatureState(
              { source: 'stops', id: v.id, sourceLayer: this.stopTiles ? this.stopTiles.id : null },
              { hover: true }
            )
          } catch (err) {
            console.warn('Error setting stop hover state:', err)
          }
        }
      }

      // Always process and emit features
      const agencyFeatures = {}
      const processFeature = (v) => {
        try {
          if (v.properties.route_id) {
            // Handle route
        const agencyId = v.properties.agency_name
        if (agencyFeatures[agencyId] == null) {
          agencyFeatures[agencyId] = { routes: {}, stops: {} }
        }
            agencyFeatures[agencyId].routes[v.properties.route_id] = v.properties
        } else {
            // Handle stop
            const agencies = JSON.parse(v.properties.agencies || '[]')
            
            const agencyId = agencies[0]?.agency_name || 'undefined'
            if (agencyFeatures[agencyId] == null) {
              agencyFeatures[agencyId] = { routes: {}, stops: {} }
            }
            
            const stopData = {
              id: v.properties.stop_id,
              stop_id: v.properties.stop_id,
              stop_name: v.properties.stop_name,
              location_type: v.properties.location_type || 0,
              onestop_id: v.properties.onestop_id,
              feed_onestop_id: v.properties.feed_onestop_id,
              feed_version_sha1: v.properties.feed_version_sha1,
              agencies: v.properties.agencies
            }
            
            agencyFeatures[agencyId].stops[v.properties.stop_id] = stopData
          }
        } catch (err) {
          console.warn('Error processing feature:', err, v)
        }
      }

      routeFeatures.forEach(processFeature)
      stopFeatures.forEach(processFeature)
      
      this.$emit('setAgencyFeatures', agencyFeatures)
    }
  }
}
</script>

<style scss>
@import 'maplibre-gl/dist/maplibre-gl';
.short {
  height: 600px;
}
.tall {
  height: calc(100vh - 60px);
}
</style>
