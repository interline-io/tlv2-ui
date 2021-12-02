<template>
  <div>
    <div id="mapelem" ref="mapelem" :class="mapClass" />
    <div v-if="overlay" class="is-hidden-mobile">
      <div class="map-agencies notification">
        <div class="buttons">
          <b-switch
            v-if="showSketchMode"
            v-model="mode"
            class="navbar-item is-pulled-left"
            native-value="explore"
            true-value="sketch"
            false-value="explore"
          >
            Sketch Mode
          </b-switch>
          <span v-if="mode == 'explore' && showExploreOptions" class="is-pulled-right">
            <!-- OPTIONS FOR EXPLORE MODE -->
            <b-dropdown
              position="is-bottom-right"
              append-to-body
              aria-role="menu"
              trap-focus
            >
              <template #trigger="{ active }">
                <b-button
                  label="Options"
                  type="is-text"
                  :icon-right="active ? 'menu-up' : 'menu-down'"
                />
              </template>

              <b-dropdown-item
                aria-role="menu-item"
                :focusable="false"
                custom
              >
                <div class="field">
                  <b-checkbox v-model="showGeneratedShadow">
                    Show stop-to-stop geometries under 20km
                  </b-checkbox>
                </div>
                <div class="field">
                  <b-checkbox v-model="showLongGeneratedShadow">
                    Show stop-to-stop geometries over 20km
                  </b-checkbox>
                </div>
              </b-dropdown-item>
            </b-dropdown>
          </span>
          <b-button v-if="mode === 'sketch'" type="is-text" class="is-pulled-right" @click="exportSketchGeoJson">
            Import/Export
          </b-button>
        </div>
        <div v-if="mode === 'explore'" class="map-info">
          <div v-show="Object.keys(agencyFeatures).length == 0">
            <strong>Use your cursor</strong> to highlight routes and see their names here. <strong>Click</strong> for more details.
          </div>
          <tl-route-select :link="link" :agency-features="agencyFeatures" :collapse="true" />
        </div>
        <div v-if="mode === 'sketch'" class="map-info">
          <div v-if="sketchMode === SKETCH_MODES.DRAW_FREEFORM">
            <p><strong>Click on the map</strong> to sketch a freeform route. Double click on the final point to finish.</p>
            <div class="buttons has-addons is-right">
              <b-button type="is-primary is-outlined" @click="cancelSketchingRoute()">
                Cancel sketching this route
              </b-button>
            </div>
          </div>
          <div v-else-if="sketchMode === SKETCH_MODES.ROUTE_SELECTED">
            <b-field label="Name">
              {{ selectedSketchedRouteGeoJson.id }}
            </b-field>
            <div class="buttons has-addons is-right">
              <b-button type="is-primary is-outlined" @click="unselectSketchedRoute">
                Unselect
              </b-button>
              <b-button type="is-info" @click="snapSelectedSketchedRoute">
                Snap to roads
              </b-button>
              <b-button type="is-danger" @click="deleteSelectedSketchedRoute">
                Delete
              </b-button>
              <b-button type="is-primary" @click="sketchMode = SKETCH_MODES.DRAW_FREEFORM">
                Sketch another route
              </b-button>
            </div>
          </div>
          <div v-else-if="sketchMode === SKETCH_MODES.NOTHING_SELECTED">
            <ul class="content">
              <li v-for="f in sketchGeoJson.features" :key="f.id">
                <a @click="selectSketchedRoute(f.id)">{{ f.id }}</a>
              </li>
            </ul>
            <div class="buttons has-addons is-right">
              <b-button type="is-primary" @click="sketchMode = SKETCH_MODES.DRAW_FREEFORM">
                Sketch another route
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- sketch GeoJSON modal -->
    <b-modal
      v-if="mode === 'sketch'"
      :active.sync="isSketchGeoJsonModalActive"
      has-modal-card
    >
      <div v-if="isSketchGeoJsonModalActive" class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Transitland Map Sketch Import/Export
          </p>
          <button type="button" class="delete" @click="isSketchGeoJsonModalActive = false" />
        </header>
        <section class="modal-card-body">
          <p class="content">
            Below is your sketch in GeoJSON format. Copy the contents and save on your computer for future use. Or post it to a GitHub Gist for sharing.
          </p>
          <p class="content">
            To import an existing sketch, paste GeoJSON into this form and press <em>Import</em>.
          </p>
          <b-notification v-if="sketchGeoJsonError" type="is-danger">
            {{ sketchGeoJsonError }}
          </b-notification>
          <textarea v-model="sketchGeoJsonString" class="textarea" style="width: 100%; height: 80%; min-height: 300px;" />
        </section>
        <footer class="modal-card-foot">
          <div class="buttons is-right">
            <b-button
              label="Close"
              @click="isSketchGeoJsonModalActive = false"
            />
            <b-button
              label="Import"
              type="is-primary"
              @click="importSketchGeoJson"
            />
          </div>
        </footer>
      </div>
    </b-modal>

    <!-- explore modal -->
    <b-modal
      v-if="overlay && link"
      :active.sync="isComponentModalActive"
      has-modal-card
      full-screen
    >
      <template #default="props">
        <div v-if="isComponentModalActive" class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">
              Select Route
            </p>
            <button type="button" class="delete" @click="props.close" />
          </header>
          <section class="modal-card-body">
            <tl-route-select :agency-features="agencyFeatures" :link="link" :link-version="linkVersion" />
          </section>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import maplibre from 'maplibre-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import mapLayers from './map-layers.js'

export default {
  props: {
    showExploreOptions: { type: Boolean, default: false },
    showSketchMode: { type: Boolean, default: false },
    showGenerated: { type: Boolean, default: true },
    showLongGenerated: { type: Boolean, default: true },
    mapClass: { type: String, default: 'short' },
    routeTiles: { type: Object, default () { return null } },
    stopTiles: { type: Object, default () { return null } },
    stopFeatures: { type: Array, default () { return [] } },
    routeFeatures: { type: Array, default () { return [] } },
    interactive: { type: Boolean, default: true },
    overlay: { type: Boolean, default: false },
    autoFit: { type: Boolean, default: true },
    center: { type: Array, default () { return null } },
    circleRadius: { type: Number, default: 1 },
    circleColor: { type: String, default: '#f03b20' },
    link: { type: Boolean, default: true },
    linkVersion: { type: Boolean, default: false },
    zoom: { type: Number, default: 4 },
    hash: { type: Boolean, default: false },
    features: {
      type: Array, default () { return [] }
    }
  },
  data () {
    return {
      mode: 'explore',
      sketchMode: null,
      isSketchGeoJsonModalActive: false,
      sketchGeoJson: {},
      sketchGeoJsonString: null,
      sketchGeoJsonError: null,
      selectedSketchedRouteGeoJson: null,
      map: null,
      drawControl: null,
      hovering: [],
      agencyFeatures: {},
      isComponentModalActive: false,
      showGeneratedShadow: this.showGenerated,
      showLongGeneratedShadow: this.showLongGenerated
    }
  },
  watch: {
    showGeneratedShadow (v) {
      this.updateFilters()
    },
    showLongGeneratedShadow (v) {
      this.updateFilters()
    },
    features (v) {
      if (v) {
        this.$nextTick(() => {
          this.updateFeatures()
        })
      }
    },
    mode (v) {
      if (v === 'sketch') {
        if (this.drawControl === null) {
          this.drawControl = new MapboxDraw({
            displayControlsDefault: false,
            styles: [
            // ACTIVE (being drawn)
            // line stroke
              {
                id: 'gl-draw-line',
                type: 'line',
                filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
                layout: {
                  'line-cap': 'round',
                  'line-join': 'round'
                },
                paint: {
                  'line-color': '#D20C0C',
                  'line-width': 8
                }
              },
              // vertex point halos
              {
                id: 'gl-draw-polygon-and-line-vertex-halo-active',
                type: 'circle',
                filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
                paint: {
                  'circle-radius': 10,
                  'circle-color': '#FFF'
                }
              },
              // vertex points
              {
                id: 'gl-draw-polygon-and-line-vertex-active',
                type: 'circle',
                filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
                paint: {
                  'circle-radius': 8,
                  'circle-color': '#D20C0C'
                }
              },

              // INACTIVE (static, already drawn)
              // line stroke
              {
                id: 'gl-draw-line-static',
                type: 'line',
                filter: ['all', ['==', '$type', 'LineString'], ['!=', 'active', 'true']],
                layout: {
                  'line-cap': 'round',
                  'line-join': 'round'
                },
                paint: {
                  'line-color': '#000',
                  'line-width': 8
                }
              }
            ]
          })
          this.map.addControl(this.drawControl)
          // recover saved GeoJSON
          const retrivedGeoJsonString = localStorage.getItem(this.TRANSITLAND_SKETCH_LS)
          if (retrivedGeoJsonString) {
            try {
              const parsedRetrievedGeoJson = JSON.parse(retrivedGeoJsonString)
              if (parsedRetrievedGeoJson) {
                this.drawControl.add(parsedRetrievedGeoJson)
              }
            } catch (e) {
              alert('Found a saved sketch, but its GeoJSON is corrupt. Starting over.')
              localStorage.removeItem(this.TRANSITLAND_SKETCH_LS)
            }
          }
        }
        this.map.on('draw.modechange', this.mapWantsToChangeSketchMode)
        this.map.on('draw.selectionchange', this.mapWantsToChangeSketchMode)
        if (this.sketchGeoJson?.features?.length > 0) {
          // when returning to an existing sketch, start with nothing selected
          this.sketchMode = this.SKETCH_MODES.NOTHING_SELECTED
        } else {
          // when starting a new sketch, immediately start to draw first route
          this.sketchMode = this.SKETCH_MODES.DRAW_FREEFORM
        }
      } else if (v === 'explore') {
        this.unselectSketchedRoute()
        this.map.off('draw.modechange', this.mapWantsToChangeSketchMode)
        this.map.off('draw.selectionchange', this.mapWantsToChangeSketchMode)
      }
    },
    sketchMode (v) {
      if (v === this.SKETCH_MODES.DRAW_FREEFORM) {
        this.drawControl.changeMode('draw_line_string')
      } else if (v === this.SKETCH_MODES.ROUTE_SELECTED) {
        // TODO
      }
    },
    sketchGeoJsonString (v) {
      if (v && JSON.parse(v)) {
        this.sketchGeoJson = JSON.parse(v)
      } else {
        this.sketchGeoJsonError = 'Error parsing GeoJSON.'
      }
    }
  },
  mounted () {
    if (this.features) {
      this.initMap()
    }
  },
  created () {
    this.SKETCH_MODES = {
      NOTHING_SELECTED: 'nothing_selected',
      DRAW_FREEFORM: 'draw_freeform',
      ROUTE_SELECTED: 'route_selected'
    }
    this.TRANSITLAND_SKETCH_LS = 'transitland_sketch_ls'
  },
  methods: {
    /* SKETCH METHODS */
    mapWantsToChangeSketchMode (e) {
      if (e.type === 'draw.selectionchange' && e.features.length === 1) {
        // TODO: handle multiple select (when shift is pressed) or disable it
        this.selectedSketchedRouteGeoJson = e.features[0]
        this.sketchMode = this.SKETCH_MODES.ROUTE_SELECTED
      } else if (e.type === 'draw.selectionchange' && e.features.length === 0) {
        this.sketchMode = this.SKETCH_MODES.NOTHING_SELECTED
      } else {
        console.log(e)
      }
      this.updateSketchGeoJson()
    },
    updateSketchGeoJson () {
      this.sketchGeoJson = this.drawControl.getAll()
      localStorage.setItem(this.TRANSITLAND_SKETCH_LS, JSON.stringify(this.sketchGeoJson))
    },
    unselectSketchedRoute () {
      this.drawControl.changeMode('simple_select')
      this.sketchMode = this.SKETCH_MODES.NOTHING_SELECTED
    },
    snapSelectedSketchedRoute () {
      alert('TODO')
    },
    deleteSelectedSketchedRoute () {
      this.drawControl.delete(this.selectedSketchedRouteGeoJson.id)
      this.updateSketchGeoJson()
      this.unselectSketchedRoute()
    },
    selectSketchedRoute (id) {
      this.drawControl.changeMode('direct_select', { featureId: id })
      // this.selectedSketchedRouteGeoJson = this.sketchGeoJson.features.find(f => f.id === id)
      this.sketchMode = this.SKETCH_MODES.ROUTE_SELECTED
    },
    cancelSketchingRoute () {
      this.drawControl.trash()
      this.sketchMode = this.SKETCH_MODES.NOTHING_SELECTED
    },
    exportSketchGeoJson () {
      this.sketchGeoJsonString = JSON.stringify(this.sketchGeoJson, null, 2)
      this.isSketchGeoJsonModalActive = true
    },
    importSketchGeoJson () {
      this.drawControl.set(this.sketchGeoJson)
      this.isSketchGeoJsonModalActive = false
    },
    /* EXPLORE METHODS */
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
      const opts = {
        hash: this.hash,
        interactive: this.interactive,
        preserveDrawingBuffer: true,
        container: this.$refs.mapelem,
        transformRequest: (url, resourceType) => {
          if (resourceType === 'Tile' && url.startsWith('https://transit.land')) {
            return {
              url,
              headers: { apikey: this.$config.tileApikey }
            }
          }
        },
        style: {
          version: 8,
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: ['https://0.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{scale}.png'],
              tileSize: 256,
              attribution: '<a href="https://www.transit.land/terms">Transitland</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }
          },
          layers: [
            {
              id: 'simple-tiles',
              type: 'raster',
              source: 'raster-tiles',
              minzoom: 0,
              maxzoom: 22
            }
          ]
        }
      }
      if (this.center) {
        opts.center = this.center
      }
      if (this.zoom) {
        opts.zoom = this.zoom
      }
      this.map = new maplibre.Map(opts)
      this.map.addControl(new maplibre.FullscreenControl())
      this.map.on('load', () => {
        this.createSources()
        this.createLayers()
        this.updateFeatures()
        this.fitFeatures()
        this.map.on('mousemove', this.mapMouseMove)
        this.map.on('click', 'route-active', this.mapClick)
        this.map.resize()
      })
    },
    updateFeatures () {
      const polygons = this.features.filter((s) => { return s.geometry.type === 'MultiPolygon' || s.geometry.type === 'Polygon' })
      const points = this.features.filter((s) => { return s.geometry.type === 'Point' })
      const lines = this.features.filter((s) => { return s.geometry.type === 'LineString' })
      // check if map is initialized... TODO: this could be improved to try again
      const p = this.map.getSource('polygons')
      if (!p) {
        return
      }
      this.map.getSource('polygons').setData({ type: 'FeatureCollection', features: polygons })
      this.map.getSource('lines').setData({ type: 'FeatureCollection', features: lines })
      this.map.getSource('points').setData({ type: 'FeatureCollection', features: points })
    },
    updateFilters () {
      for (const v of mapLayers.routeLayers) {
        const f = (v.filter || []).slice()
        if (f.length === 0) {
          f.push('all')
        }
        f.push(['<', 'geometry_length', 5000 * 1000])
        // Hide generated geometries > 50km
        if (!this.showLongGeneratedShadow) {
          f.push(['any', ['==', 'generated', false], ['<', 'geometry_length', 20 * 1000]])
        }
        // Hide generated geometries
        if (!this.showGeneratedShadow) {
          f.push(['any', ['==', 'generated', false], ['>', 'geometry_length', 20 * 1000]])
        }
        if (f.length > 1) {
          this.map.setFilter(v.name, f)
        } else {
          this.map.setFilter(v.name, null)
        }
      }
    },
    createSources () {
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
      // Add route/stop sources, with geojson features as fallbacks
      if (this.routeTiles) {
        this.map.addSource('routes', {
          type: 'vector',
          tiles: [this.routeTiles.url],
          minzoom: this.routeTiles.minzoom || 0,
          maxzoom: this.routeTiles.maxzoom || 14
        })
      } else {
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
          'circle-color': this.circleColor,
          'circle-radius': this.circleRadius,
          'circle-opacity': 0.4
        }
      })
      this.map.addLayer({
        id: 'lines',
        type: 'line',
        source: 'lines',
        layout: {},
        paint: {
          'line-width': 2,
          'line-color': '#000',
          'line-opacity': 1.0
        }
      })
      // Route/Stop layers
      for (const v of mapLayers.routeLayers) {
        const layer = {
          id: v.name,
          type: 'line',
          source: 'routes',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: v.paint
        }
        if (this.routeTiles) {
          layer['source-layer'] = this.routeTiles.id
        }
        if (v.filter) {
          layer.filter = v.filter.slice()
        }
        this.map.addLayer(layer)
      }
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
        this.map.addLayer(layer)
      }
      // Set initial show generated geometry
      this.updateFilters()
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
          padding: 20
        })
      }
    },
    mapClick (e) {
      if (this.mode === 'explore') {
        this.isComponentModalActive = true
      }
    },
    mapMouseMove (e) {
      if (this.mode === 'explore') {
        const map = this.map

        const stops = map.queryRenderedFeatures(e.point, { layers: ['stops'] })
        console.log(stops)
        for (const s of stops) {
          map.setFeatureState({ source: 'stops', id: s.id, sourceLayer: this.stopTiles ? this.stopTiles.id : null }, { hover: true })
        }


        const routes = map.queryRenderedFeatures(e.point, { layers: ['route-active'] })
        map.getCanvas().style.cursor = 'pointer'
        for (const k of this.hovering) {
          map.setFeatureState(
            { source: 'routes', id: k, sourceLayer: this.routeTiles ? this.routeTiles.id : null },
            { hover: false }
          )
        }
        this.hovering = []
        for (const v of routes) {
          this.hovering.push(v.id)
          map.setFeatureState({ source: 'routes', id: v.id, sourceLayer: this.routeTiles ? this.routeTiles.id : null }, { hover: true })
        }
        const agencyFeatures = {}
        for (const v of routes) {
          const agencyId = v.properties.agency_name
          const routeId = v.properties.route_id
          if (agencyFeatures[agencyId] == null) {
            agencyFeatures[agencyId] = {}
          }
          agencyFeatures[agencyId][routeId] = v.properties
        }
        this.agencyFeatures = agencyFeatures
      }
    }
  }
}
</script>

<style scss>
@import 'maplibre-gl/dist/maplibre-gl';
@import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

.short {
  height: 600px;
}

.tall {
  height: calc(100vh - 60px);
}

.map-agencies {
  user-select:none;
  position: absolute !important;
  margin:0px;
  padding:10px;
  top:10px;
  left:10px;
  background:#ffffff;
  border: 1px solid gray;
  width:400px;
  opacity:1;
}

.map-options {
  border-bottom:solid 1px #ccc;
  margin-bottom:20px;
}

.map-info {
  padding-left:10px;
  padding-top:10px;
}

</style>
