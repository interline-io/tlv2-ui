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
        <o-input
          v-model="level.level_index"
          type="number"
          number
          controls-position="compact"
        />
      </div>
      <p class="help">
        A number representing the relative vertical order of the level.
      </p>
    </div>

    <div class="field">
      <o-field label="Location">
        <o-button class="is-pulled-right" @click="showGeojsonEditor = true">
          Edit GeoJSON
        </o-button>
        <span v-if="!geometry" class="p-2 is-pulled-right">Draw a polygon by clicking on map; click twice to end</span>
        <span v-else class="p-2 is-pulled-right">Click the polygon twice to enter edit mode</span>
      </o-field>

      <o-field>
        <tl-stationEditor-basemap-control v-model="basemap" />
      </o-field>

      <tl-stationEditor-level-map
        :basemap="basemap"
        :zoom="18"
        :center="center"
        :draw-tools="true"
        :draw-default-mode="editFeatures.length > 0 ? 'simple_select' : 'draw_polygon'"
        width="100%"
        height="500px"
        :editable-features="editFeatures"
        :polygons="station.levels.filter((s) => { return s.geometry && s.level_id !== level.level_id }).map((s) => { return s.geometry })"
        :points="station.stops.map((s) => { return s.geometry })"
        :opacity="0.1"
        :search="true"
        @changed="setGeometry"
      />
    </div>
    <div class="block">
      <div class="level mt-5">
        <div class="level-left">
          <div class="level-item">
            <o-button
              class="button is-outlined"
              @click="$emit('cancel')"
            >
              Cancel
            </o-button>
          </div>
        </div>
        <div class="level-right">
          <template v-if="level.id">
            <div class="level-item">
              <o-button
                class="button is-primary"
                :disabled="!valid"
                @click="$emit('update', level)"
              >
                Save
              </o-button>
            </div>
            <div class="level-item">
              <o-button
                class="button is-danger"
                @click="$emit('delete', level)"
              >
                Delete
              </o-button>
            </div>
          </template>
          <template v-else>
            <div class="level-item">
              <o-button
                class="button is-primary"
                :disabled="!valid"
                @click="$emit('create', level)"
              >
                Create Level
              </o-button>
            </div>
          </template>
        </div>
      </div>
    </div>
    <tl-modal
      v-model="showGeojsonEditor"
      title="Edit GeoJSON"
    >
      <o-input
        v-model="geojsonGeometry"
        :variant="geojsonError ? 'danger' : 'primary'"
        :message="geojsonError || ''"
        type="textarea"
        expanded
        rows="20"
        :style="{ 'max-height': '50vh' }"
      />
      <o-button class="is-pulled-right" :disabled="!!geojsonError" :variant="geojsonError ? 'danger' : 'primary'" @click="showGeojsonEditor = false">
        {{ geojsonError ? geojsonError : 'OK' }}
      </o-button>
    </tl-modal>
  </div>
</template>

<script>
import { Level } from './station'

// Helper to recursively strip Z/M dimensions from coordinates
const stripZandM = (coords) => {
  if (Array.isArray(coords[0])) {
    return coords.map(stripZandM)
  }
  return coords.slice(0, 2)
}

const convertToMultiPolygon = (parsed) => {
  const coords = []
  if (parsed.type === 'FeatureCollection') {
    for (const feat of parsed.features) {
      if (feat.geometry.type === 'Polygon') {
        coords.push(stripZandM(feat.geometry.coordinates))
      } else if (feat.geometry.type === 'MultiPolygon') {
        for (const poly of feat.geometry.coordinates) {
          coords.push(stripZandM(poly))
        }
      }
    }
  } else if (parsed.type === 'Feature') {
    if (parsed.geometry.type === 'Polygon') {
      coords.push(stripZandM(parsed.geometry.coordinates))
    } else if (parsed.geometry.type === 'MultiPolygon') {
      for (const poly of parsed.geometry.coordinates) {
        coords.push(stripZandM(poly))
      }
    }
  } else if (parsed.type === 'Polygon') {
    coords.push(stripZandM(parsed.coordinates))
  } else if (parsed.type === 'MultiPolygon') {
    for (const poly of parsed.coordinates) {
      coords.push(stripZandM(poly))
    }
  } else {
    throw new Error('GeoJSON must be a Polygon or MultiPolygon')
  }
  return {
    type: 'MultiPolygon',
    coordinates: coords
  }
}

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
  emits: ['update', 'delete', 'create', 'cancel'],
  data () {
    return {
      level: new Level(this.value).setDefaults(),
      basemap: 'carto',
      showGeojsonEditor: false,
      geojsonError: null,
      geojsonGeometryBuffer: ''
    }
  },
  computed: {
    geojsonGeometry: {
      get () {
        return this.geojsonGeometryBuffer || JSON.stringify(this.geometry, null, 2)
      },
      set (value) {
        this.geojsonGeometryBuffer = value
        let parsed = null
        try {
          parsed = JSON.parse(value)
        } catch {
          this.geojsonError = 'Invalid JSON'
          return
        }
        this.setGeometry(parsed)
      }
    },
    geometry () {
      return this.level.geometry
    },
    editFeatures () {
      if (!this.geometry) { return [] }
      return [
        {
          type: 'Feature',
          properties: {},
          geometry: this.geometry
        }
      ]
    },
    valid () {
      return this.level.level_name
        && this.level.level_name.length > 0
        && this.level.level_index !== null
        && this.level.level_id
        && this.level.level_id.length > 0
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
      try {
        const mp = convertToMultiPolygon(e)
        this.level.geometry = mp
        this.geojsonError = null
      } catch (e) {
        this.geojsonError = e.message || e.toString()
      }
    }
  }
}
</script>
