<template>
  <div>
    <div class="field">
      <label class="label">Name</label>
      <div class="control">
        <input v-model="station.stop.stop_name" class="input" type="text">
      </div>
      <p class="help">
        The full name of the station complex. Capitalize and use spaces.
      </p>
    </div>

    <div class="field">
      <label class="label">ID</label>
      <div class="control">
        <input v-model="station.stop.stop_id" class="input" type="text">
      </div>
      <p class="help">
        A unique identifier for the station complex. No spaces allowed.
      </p>
    </div>

    <div class="field">
      <t-field label="Location">
        <span v-if="!station.stop.geometry" class="is-pulled-right">Draw a point by clicking on map</span>
        <span v-else class="is-pulled-right">Click the point twice to enable dragging</span>
      </t-field>
      <t-field>
        <tl-apps-stations-basemap-control v-model="basemap" />
      </t-field>

      <tl-apps-stations-level-map
        :basemap="basemap"
        :center="center"
        :search="true"
        width="100%"
        height="500px"
        :zoom="18"
        :draw-tools="true"
        :editable-features="editFeatures"
        :draw-default-mode="editFeatures.length > 0 ? 'simple_select' : 'draw_point'"
        @changed="setGeometry"
      />
    </div>
    <div class="block">
      <div class="level mt-5">
        <div class="level-left">
          <div class="level-item">
            <t-button
              class="button is-outlined"
              @click="$emit('cancel')"
            >
              Cancel
            </t-button>
          </div>
        </div>
        <div class="level-right">
          <template v-if="station.id">
            <div class="level-item">
              <t-button
                class="button is-primary"
                :disabled="!valid"
                @click="$emit('update', station)"
              >
                Save
              </t-button>
            </div>
            <div class="level-item">
              <t-button
                class="button is-danger"
                @click="$emit('delete', station)"
              >
                Delete
              </t-button>
            </div>
          </template>
          <template v-else>
            <div class="level-item">
              <t-button
                class="button is-primary"
                :disabled="!valid"
                @click="$emit('create', station)"
              >
                Create Station
              </t-button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Station } from './station'

export default {
  props: {
    center: {
      type: Array,
      default () { return [-122.431297, 37.773972] }
    },
    value: {
      type: Object,
      default () { return {} }
    }
  },
  emits: ['update', 'delete', 'create', 'cancel'],
  data () {
    return {
      station: new Station(this.value.stop),
      basemap: 'carto'
    }
  },
  computed: {
    editFeatures () {
      if (!this.station.stop.geometry) { return [] }
      return [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: this.station.stop.geometry.coordinates },
          properties: {}
        }
      ]
    },
    valid () {
      return this.station.stop.geometry
        && this.station.stop.stop_name
        && this.station.stop.stop_name.length > 0
        && this.station.stop.stop_id
        && this.station.stop.stop_id.length > 0
    }
  },
  watch: {
    'station.stop.stop_name' (value) {
      if (value.length > 0 && this.station.id == null) {
        this.station.stop.stop_id = value.toLowerCase().replace(/\s/g, '-')
      }
    }
  },
  methods: {
    setGeometry (e) {
      if (e.features.length !== 1) {
        this.station.stop.geometry = null
        return
      }
      this.station.stop.geometry = e.features[0].geometry
    }
  }
}
</script>
