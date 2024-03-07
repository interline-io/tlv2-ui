<template>
  <div v-if="level">
    <div class="field">
      <label class="label">Name</label>
      <div class="control">
        <input v-model="level.level_name" class="input" type="text">
      </div>
      <p class="help">
        The name for the level.
      </p>
    </div>

    <div class="field">
      <label class="label">ID</label>
      <div class="control">
        <input v-model="level.level_id" class="input" type="text">
      </div>
      <p class="help">
        A unique identifier for the level. No spaces allowed.
      </p>
    </div>

    <div class="field">
      <label class="label">Level Index</label>
      <div class="control">
        <o-input v-model="level.level_index" controls-position="compact" />
      </div>
      <p class="help">
        A number representing the relative vertical order of the level.
      </p>
    </div>

    <div class="field">
      <o-field label="Location">
        <span v-if="!geometry" class="is-pulled-right">Draw a polygon by clicking on map; click twice to end</span>
        <span v-else class="is-pulled-right">Click the polygon twice to enter edit mode</span>
      </o-field>

      <o-field>
        <tl-editor-basemap-control v-model="basemap" />
      </o-field>

      <div class="control">
        <tl-editor-level-map
          :basemap="basemap"
          :zoom="18"
          :center="center"
          :draw-tools="true"
          :draw-default-mode="editFeatures.length > 0 ? 'simple_select' : 'draw_polygon'"
          width="100%"
          height="500px"
          :editable-features="editFeatures"
          :polygons="station.levels.filter((s)=>{return s.geometry && s.level_id !== level.level_id}).map((s)=>{return s.geometry})"
          :points="station.stops.map((s)=>{return s.geometry})"
          :opacity="0.1"
          :search="true"
          @changed="setGeometry"
        />
      </div>
    </div>
    <div class="buttons is-pulled-right">
      <template v-if="level.id">
        <o-button
          class="button is-primary"
          :disabled="!valid"
          @click="$emit('update', level)"
        >
          Save
        </o-button>

        <o-button
          class="button is-danger"
          @click="$emit('delete', level)"
        >
          Delete
        </o-button>
      </template>
      <template v-else>
        <o-button
          class="button is-primary"
          :disabled="!valid"
          @click="$emit('create', level)"
        >
          Create Level
        </o-button>
      </template>
    </div>
  </div>
</template>

<script>
import { Level } from './station'

export default {
  props: {
    center: {
      type: Array,
      default () { return [0, 0] }
    },
    station: {
      type: Object,
      default () {
        return {
          geometry: null,
          id: null,
          feed_version_id: null
        }
      }
    },
    value: {
      type: Object,
      default () { return {} }
    }
  },
  emits: ['update', 'delete', 'create'],
  data () {
    return {
      level: new Level(this.value).setDefaults(),
      basemap: 'carto'
    }
  },
  computed: {
    geometry () {
      return this.level.geometry
    },
    editFeatures () {
      if (!this.geometry) { return [] }
      return [
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: this.geometry.coordinates },
          properties: {}
        }
      ]
    },
    valid () {
      return this.level.level_name &&
      this.level.level_name.length > 0 &&
      this.level.level_index !== null &&
      this.level.level_id &&
      this.level.level_id.length > 0
    }
  },
  watch: {
    'level.level_name' (value) {
      if (value && value.length > 0 && !this.level.id) {
        const autoname = value.toLowerCase().replace(/\s/g, '-')
        this.level.level_id = `${this.station.stop.stop_id}-${autoname}`
      }
    }
  },
  methods: {
    setGeometry (e) {
      if (e.features.length !== 1) {
        return this.error('exactly one feature is required')
      }
      this.level.geometry = e.features[0].geometry
    }
  }
}
</script>
