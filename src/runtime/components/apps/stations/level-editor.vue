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
        <t-input
          v-model="level.level_index"
          type="number"
        />
      </div>
      <p class="help">
        A number representing the relative vertical order of the level.
      </p>
    </div>

    <div class="field">
      <div class="level mb-2">
        <div class="level-left">
          <div class="level-item">
            <label class="label mb-0">Location</label>
          </div>
          <div class="level-item">
            <tl-apps-stations-basemap-control v-model="basemap" />
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <span v-if="!geometry" class="mr-3">Draw a polygon by clicking on map; click twice to end</span>
            <span v-else class="mr-3">Click the polygon twice to enter edit mode</span>
          </div>
          <div class="level-item">
            <t-button @click="showGeojsonEditor = true">
              Edit GeoJSON
            </t-button>
          </div>
        </div>
      </div>

      <tl-apps-stations-level-map
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
            <t-button
              class="button is-outlined"
              @click="$emit('cancel')"
            >
              Cancel
            </t-button>
          </div>
        </div>
        <div class="level-right">
          <template v-if="level.id">
            <div class="level-item">
              <t-button
                class="button is-primary"
                :disabled="!valid"
                @click="$emit('update', level)"
              >
                Save
              </t-button>
            </div>
            <div class="level-item">
              <t-button
                class="button is-danger"
                @click="$emit('delete', level)"
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
                @click="$emit('create', level)"
              >
                Create Level
              </t-button>
            </div>
          </template>
        </div>
      </div>
    </div>
    <t-modal
      v-model="showGeojsonEditor"
      title="Edit GeoJSON"
    >
      <t-textarea
        v-model="geojsonGeometry"
        :variant="geojsonError ? 'danger' : 'primary'"
        expanded
        :rows="20"
        :style="{ 'max-height': '50vh' }"
      />
      <t-button class="is-pulled-right" :disabled="!!geojsonError" :variant="geojsonError ? 'danger' : 'primary'" @click="showGeojsonEditor = false">
        {{ geojsonError ? geojsonError : 'OK' }}
      </t-button>
    </t-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { MultiPolygon, Feature, FeatureCollection, Polygon } from 'geojson'
import { Level } from './station'
import type { LevelData, StationData } from './types'

type Coordinates = number[] | Coordinates[]

// Helper to recursively strip Z/M dimensions from coordinates
const stripZandM = (coords: Coordinates): number[] | number[][] | number[][][] => {
  if (Array.isArray(coords[0])) {
    return (coords as Coordinates[]).map(stripZandM) as number[][] | number[][][]
  }
  return (coords as number[]).slice(0, 2)
}

const convertToMultiPolygon = (parsed: FeatureCollection | Feature | Polygon | MultiPolygon): MultiPolygon => {
  const coords: number[][][][] = []
  if (parsed.type === 'FeatureCollection') {
    for (const feat of (parsed as FeatureCollection).features) {
      if (feat.geometry.type === 'Polygon') {
        coords.push(stripZandM(feat.geometry.coordinates) as number[][][])
      } else if (feat.geometry.type === 'MultiPolygon') {
        for (const poly of feat.geometry.coordinates) {
          coords.push(stripZandM(poly) as number[][][])
        }
      }
    }
  } else if (parsed.type === 'Feature') {
    if ((parsed as Feature).geometry.type === 'Polygon') {
      coords.push(stripZandM((parsed as Feature<Polygon>).geometry.coordinates) as number[][][])
    } else if ((parsed as Feature).geometry.type === 'MultiPolygon') {
      for (const poly of (parsed as Feature<MultiPolygon>).geometry.coordinates) {
        coords.push(stripZandM(poly) as number[][][])
      }
    }
  } else if (parsed.type === 'Polygon') {
    coords.push(stripZandM((parsed as Polygon).coordinates) as number[][][])
  } else if (parsed.type === 'MultiPolygon') {
    for (const poly of (parsed as MultiPolygon).coordinates) {
      coords.push(stripZandM(poly) as number[][][])
    }
  } else {
    throw new Error('GeoJSON must be a Polygon or MultiPolygon')
  }
  return {
    type: 'MultiPolygon',
    coordinates: coords
  }
}

export default defineComponent({
  props: {
    center: {
      type: Array as unknown as PropType<[number, number]>,
      default: () => [0, 0] as [number, number]
    },
    station: {
      type: Object as PropType<StationData>,
      required: true
    },
    value: {
      type: Object as PropType<LevelData>,
      default: () => ({} as LevelData)
    }
  },
  emits: ['update', 'delete', 'create', 'cancel'],
  data () {
    return {
      level: new Level(this.value).setDefaults(),
      basemap: 'carto',
      showGeojsonEditor: false,
      geojsonError: null as string | null,
      geojsonGeometryBuffer: ''
    }
  },
  computed: {
    geojsonGeometry: {
      get (): string {
        return this.geojsonGeometryBuffer || JSON.stringify(this.geometry, null, 2)
      },
      set (value: string) {
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
    geometry (): MultiPolygon | null {
      return this.level.geometry ?? null
    },
    editFeatures (): Feature[] {
      if (!this.geometry) { return [] }
      return [
        {
          type: 'Feature',
          properties: {},
          geometry: this.geometry
        }
      ]
    },
    valid (): boolean {
      return !!(this.level.level_name
        && this.level.level_name.length > 0
        && this.level.level_index !== null
        && this.level.level_id
        && this.level.level_id.length > 0)
    }
  },
  watch: {
    'level.level_name' (value: string) {
      if (value && value.length > 0 && !this.level.id && this.station.stop) {
        const autoname = value.toLowerCase().replace(/\s/g, '-')
        this.level.level_id = `${this.station.stop.stop_id}-${autoname}`
      }
    }
  },
  methods: {
    setGeometry (e: FeatureCollection | Feature | Polygon | MultiPolygon) {
      try {
        const mp = convertToMultiPolygon(e)
        this.level.geometry = mp
        this.geojsonError = null
      } catch (err) {
        this.geojsonError = err instanceof Error ? err.message : String(err)
      }
    }
  }
})
</script>
