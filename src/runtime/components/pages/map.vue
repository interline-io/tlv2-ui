<template>
  <client-only>
    <div class="tl-map">
      <tl-map-viewer
        :key="0"
        :show-generated-geometries="showGeneratedGeometries"
        :show-problematic-geometries="showProblematicGeometries"
        :enable-scroll-zoom="true"
        :route-tiles="routeTiles"
        :stop-tiles="stopTiles"
        :zoom="initialZoom"
        :center="initialCenter"
        :hash="useHash"
        :marker-coords="markerCoords"
        map-class="tall"
        @set-zoom="setZoom"
        @set-agency-features="setAgencyFeatures"
        @map-click="mapClick"
        @map-move="mapMove"
      />
      <div class="tl-map-panel tl-map-panel-tabs">
        <o-tabs v-model="activeTab" class="tl-tabs block" position="centered" type="boxed">
          <o-tab-item id="routes" label="Routes">
            <!-- <tl-map-search
              :bbox="currentBbox"
              :include-routes="true"
              @set-location="setLocation"
            /> -->
            <div v-if="currentZoom < 8">
              <h6 class="title is-6">
                Zoom in to select route lines and to see stop points.
              </h6>
            </div>
            <div v-else>
              <tl-map-route-list
                v-if="activeTab === 1"
                :agency-features="agencyFeatures"
                :is-component-modal-active="isComponentModalActive"
                @close="isComponentModalActive = false"
              >
                <h6 class="title is-6">
                  Select routes and stops
                </h6>
                <div>
                  Use your cursor to highlight routes lines or stop points. Click for details.
                </div>
              </tl-map-route-list>
            </div>
            <p v-if="Object.keys(agencyFeatures).length == 0" class="content block is-small pt-2">
              <a href="https://www.transit.land/documentation/vector-tiles" target="_blank">Learn more about Transitland v2 Vector Tiles</a>
            </p>
          </o-tab-item>
          <o-tab-item id="departures" label="Departures">
            <tl-map-search
              :bbox="currentBbox"
              :include-stops="true"
              @set-location="setLocation"
            />
            <tl-stop-departures
              v-if="activeTab === 2"
              :show-auto-refresh="true"
              :show-fallback-selector="true"
              :show-radius-selector="true"
              :search-coords="markerCoords"
            />
            <p class="content block is-small pt-2">
              <a href="https://www.transit.land/documentation/rest-api/departures" target="_blank">Learn more about Transitland v2 REST API stop departures endpoint</a>
            </p>
          </o-tab-item>
          <o-tab-item id="options" label="Options">
            <div class="field">
              <o-checkbox
                v-model="showGeneratedGeometries"
              >
                Show stop-to-stop geometries
              </o-checkbox>
            </div>
            <div class="field">
              <o-checkbox
                v-model="showProblematicGeometries"
              >
                Show problematic geometries
              </o-checkbox>
            </div>
          </o-tab-item>
        </o-tabs>
      </div>
    </div>
  </client-only>
</template>

<script>
import { navigateTo } from '#imports'

export default {
  props: {
    lon: {
      type: [String, Number], default () { return null }
    },
    lat: {
      type: [String, Number], default () { return null }
    }
  },
  data () {
    let center = [-119.49, 12.66]
    let zoom = 1.5
    let activeTab = 1
    const useHash = true
    let searchCoords = null
    let markerCoords = null
    if (this.lon && this.lat) {
      center = [parseFloat(this.lon), parseFloat(this.lat)]
      searchCoords = center
      markerCoords = center
      zoom = 16
      activeTab = 2
    }
    return {
      activeTab,
      useHash,
      searchCoords,
      markerCoords,
      initialZoom: zoom,
      initialCenter: center,
      currentZoom: zoom,
      centerCenter: center,
      isComponentModalActive: false,
      agencyFeatures: {},
      showGeneratedGeometries: true,
      showProblematicGeometries: false,
      currentBbox: null,
      routeTiles: {
        id: 'routes',
        url: `${this.$config.public.apiBase}/tiles/routes/tiles/{z}/{x}/{y}.pbf`,
        minzoom: 0,
        maxzoom: 14
      },
      stopTiles: {
        id: 'stops',
        url: `${this.$config.public.apiBase}/tiles/stops/tiles/{z}/{x}/{y}.pbf`,
        minzoom: 14,
        maxzoom: 14
      }
    }
  },
  watch: {
    activeTab () {
      // Hacky; always set modal back to empty when switching tabs
      this.isComponentModalActive = false
    }
  },
  methods: {
    mapMove (e) {
      this.currentZoom = e.zoom
      this.currentBbox = e.bbox
    },
    setAgencyFeatures (e) {
      this.agencyFeatures = e
    },
    async setCoords (coords) {
      const pathNoHash = this.$route.path.split('#')[0]
      if (!coords || coords.length !== 2) {
        this.markerCoords = null
        this.searchCoords = null
        await navigateTo({
          path: pathNoHash,
          query: { }
        })
        return
      }
      // Re-initialize map
      if (!this.searchCoords) {
        this.initialZoom = 16
        this.initialCenter = coords
      }
      this.searchCoords = coords
      this.markerCoords = coords
      // Update query parameters, split off any hash
      if (coords && coords.length === 2) {
        await navigateTo({
          path: pathNoHash,
          query: { lon: coords[0].toFixed(5), lat: coords[1].toFixed(5) }
        })
      }
    },
    setZoom (v) {
      this.currentZoom = v
    },
    setLocation (coords) {
      this.markerCoords = null
      this.searchCoords = null
      this.setCoords(coords)
    },
    mapClick (e) {
      if (this.activeTab === 2) {
        this.setCoords([e.lngLat.lng, e.lngLat.lat])
      } else {
        this.setCoords(null)
      }
      // Check if we have any routes or stops to show in the modal
      const hasFeatures = Object.keys(this.agencyFeatures).some(agency => {
        return Object.keys(this.agencyFeatures[agency].routes || {}).length > 0 ||
               Object.keys(this.agencyFeatures[agency].stops || {}).length > 0
      })
      if (hasFeatures) {
        this.isComponentModalActive = true
      }
    }
  }
}
</script>

<style>
.tl-map {
  position: relative;
}

.tl-map-panel {
    user-select: none;
    position: absolute !important;
    margin: 0px;
    padding: 10px;
    top: 10px;
    left: 10px;
    max-width:90vw;
    min-width: 565px;
}

.tl-map-panel-tabs {
    background: rgba(255, 255, 255, 0.0) !important;
}

.tl-map-panel-tabs div[role=tab] a {
    margin-right: 5px;
}

.tl-map-panel-tabs div[role=tab] a {
    background-color: rgba(235, 235, 235, 0.9) !important;
}

.tl-map-panel-tabs div[role=tab][aria-selected=true] a {
    background-color: rgba(255, 255, 255, 0.9) !important;
}

.tl-map-panel-tabs .tab-content {
    background-color: rgba(255, 255, 255, 0.9);
    margin: 0px;
    padding-left: 10px;
    padding-right: 10px;
    max-height:80vh;
    min-width:330px;
    max-width:80vw;
    overflow-y:auto;
}
.tl-map-search-autocomplete{
  width:450px;
}

</style>
