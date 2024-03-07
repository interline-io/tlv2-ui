<template>
  <div>
    <div ref="mapelem" :style="elemstyle" class="map" />
  </div>
</template>

<script>
import { Map, AttributionControl } from 'maplibre-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { getBasemapLayers, PeliasIcons } from './basemaps'

MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl'
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-'
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group'

function loadImages (map, icons, callback) {
  const results = {}
  for (const icon of Object.values(icons)) {
    map.loadImage(`/icons/${icon.icon}.png`, makeCallback(icon.icon))
  }
  function makeCallback (name) {
    return function (err, image) {
      results[name] = err ? null : image
      // if all images are loaded, call the callback
      if (Object.keys(results).length === Object.keys(icons).length) {
        callback(results)
      }
    }
  }
}

export default {
  props: {
    basemap: { type: String, default: 'carto' },
    width: { type: String, default: '100px' },
    height: { type: String, default: '100px' },
    showAttribution: { type: Boolean, default: true },
    drawTools: { type: Boolean, default: false },
    drawControls: {
      type: Object,
      default: () => {
        return {
          point: false,
          line_string: false,
          polygon: false,
          trash: false,
          combine_features: false,
          uncombine_features: false
        }
      }
    },
    drawDefaultMode: { type: String, default: 'simple_select' },
    center: {
      type: Array,
      default () {
        return [-122.431297, 37.773972]
      }
    },
    points: {
      type: Array,
      default () {
        return []
      }
    },
    lines: {
      type: Array,
      default () {
        return []
      }
    },
    polygons: {
      type: Array,
      default () {
        return []
      }
    },
    opacity: {
      type: Number,
      default () { return 0.5 }
    },
    lineWidth: {
      type: Number,
      default () { return 16.0 }
    },
    polygonOutlineWidth: {
      type: Number,
      default () { return 2.0 }
    },
    editableFeatures: {
      type: Array,
      default () {
        return []
      }
    },
    zoom: {
      type: Number,
      default: 12
    },
    search: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  emits: ['changed'],
  data () {
    return {
      map: null,
      draw: null,
      elemstyle: {
        width: this.width,
        height: this.height
      }
    }
  },
  watch: {
    basemap (cur, prev) {
      this.map.setLayoutProperty(prev, 'visibility', 'none')
      this.map.setLayoutProperty(cur, 'visibility', 'visible')
    },
    lines () {
      this.redraw()
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    changed () {
      this.$emit('changed', this.draw.getAll())
    },
    ///
    initMap () {
      const sources = {}
      const layers = []
      for (const [k, v] of Object.entries(getBasemapLayers())) {
        sources[k] = v.source
        layers.push(Object.assign({ id: k, source: k }, v.layer))
      }
      this.map = new Map({
        interactive: this.drawTools,
        container: this.$refs.mapelem,
        center: this.center,
        zoom: this.zoom,
        attributionControl: false,
        style: {
          version: 8,
          glyphs: '/fonts/{fontstack}/{range}.pbf',
          sources,
          layers
        }
      })
      this.map.doubleClickZoom.disable()
      if (this.showAttribution) {
        this.map.addControl(new AttributionControl(), 'bottom-left')
      }
      if (this.drawTools) {
        this.draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: this.drawControls,
          defaultMode: this.drawDefaultMode
        })
        this.map.addControl(this.draw)
      }
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
      this.map.on('draw.create', this.changed)
      this.map.on('draw.delete', this.changed)
      this.map.on('draw.update', this.changed)
      loadImages(this.map, PeliasIcons, (icons) => {
        for (const [icon, image] of Object.entries(icons)) {
          console.log(icon, image)
          this.map.addImage(icon, image)
        }
        this.map.on('load', () => {
          this.drawMap()
          this.map.resize()
        })
      })
    },
    redraw () {
      const l = this.map.getSource('lines')
      if (l) {
        l.setData({
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: (this.lines || []).map((p) => {
              return { type: 'Feature', properties: {}, geometry: p }
            })
          }
        })
      }
    },
    drawMap () {
      this.map.addSource('points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: (this.points || []).map((p) => {
            return { type: 'Feature', properties: {}, geometry: p }
          })
        }
      })
      this.map.addSource('lines', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })
      this.map.addSource('polygons', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: (this.polygons || []).map((p) => {
            return { type: 'Feature', properties: {}, geometry: p }
          })
        }
      })
      ///
      this.map.addLayer({
        id: 'polygons',
        type: 'fill',
        source: 'polygons',
        layout: {},
        paint: {
          'fill-color': '#3bb2d0',
          'fill-opacity': 0.1 // this.opacity
        }
      })
      this.map.addLayer({
        id: 'polygon-outlines',
        type: 'line',
        source: 'polygons',
        paint: {
          'line-color': '#3bb2d0',
          'line-width': this.polygonOutlineWidth,
          'line-opacity': this.opacity
        }
      })
      this.map.addLayer({
        id: 'lines',
        type: 'line',
        source: 'lines',
        paint: {
          'line-color': '#f58488',
          // 'line-opacity': this.opacity,
          'line-width': this.lineWidth
        }
      })
      this.map.addLayer({
        id: 'points',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-opacity': this.opacity,
          'circle-radius': 8,
          'circle-color': '#d53e4f' // '#f58488'
        }
      })
      if (this.draw) {
        this.draw.add({
          type: 'FeatureCollection',
          features: this.editableFeatures
        })
      }
    }
  }
}
</script>
