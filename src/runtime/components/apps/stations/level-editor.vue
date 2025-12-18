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
        :key="mapKey"
        :basemap="basemap"
        :zoom="18"
        :center="center"
        :draw-tools="true"
        :draw-default-mode="editFeatures.length > 0 ? 'simple_select' : 'draw_polygon'"
        width="100%"
        height="500px"
        :editable-features="editFeatures"
        :polygons="station.levels.filter((s) => { return s.geometry && s.level_id !== level.level_id }).map((s) => { return s.geometry! })"
        :points="station.stops.filter((s) => { return s.geometry }).map((s) => { return s.geometry! })"
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
              <t-tooltip :text="deleteTooltip">
                <t-button
                  class="button is-danger"
                  :disabled="hasAssociatedStops"
                  @click="showDeleteModal = true"
                >
                  Delete
                </t-button>
              </t-tooltip>
            </div>
            <div class="level-item ml-3">
              <t-button
                class="button is-primary"
                :disabled="!valid"
                @click="$emit('update', level)"
              >
                Save
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

    <!-- Delete Confirmation Modal -->
    <t-modal
      v-model="showDeleteModal"
      title="Delete Level"
    >
      <p class="mb-4">
        Are you sure you want to delete this level? This action cannot be undone.
      </p>
      <div class="buttons is-pulled-right">
        <t-button @click="showDeleteModal = false">
          Cancel
        </t-button>
        <t-button
          variant="danger"
          @click="confirmDelete"
        >
          Delete Level
        </t-button>
      </div>
    </t-modal>

    <t-modal
      v-model="showGeojsonEditor"
      title="Edit GeoJSON"
      @update:model-value="onCloseGeojsonEditor"
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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

interface Props {
  center?: [number, number]
  station: StationData
  value?: LevelData
  hasAssociatedStops?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [0, 0],
  value: () => ({} as LevelData),
  hasAssociatedStops: false
})

const _emit = defineEmits<{
  update: [level: Level]
  delete: [level: Level]
  create: [level: Level]
  cancel: []
}>()

const level = ref(new Level(props.value).setDefaults())
const basemap = ref('carto')
const showGeojsonEditor = ref(false)
const geojsonError = ref<string | null>(null)
const geojsonGeometryBuffer = ref('')
const mapKey = ref(0)
const showDeleteModal = ref(false)

const geometry = computed((): MultiPolygon | null => {
  return level.value.geometry ?? null
})

const geojsonGeometry = computed({
  get (): string {
    return geojsonGeometryBuffer.value || JSON.stringify(geometry.value, null, 2)
  },
  set (value: string) {
    geojsonGeometryBuffer.value = value
    try {
      const parsed = JSON.parse(value)
      const mp = convertToMultiPolygon(parsed)
      // Directly assign to trigger reactivity
      level.value.geometry = mp
      // Force map to re-render with new geometry
      mapKey.value++
      geojsonError.value = null
    } catch (err) {
      geojsonError.value = err instanceof Error ? err.message : 'Invalid JSON'
    }
  }
})

const editFeatures = computed((): Feature[] => {
  if (!geometry.value) { return [] }
  return [
    {
      type: 'Feature',
      properties: {},
      geometry: geometry.value
    }
  ]
})

const valid = computed((): boolean => {
  return !!(level.value.level_name
    && level.value.level_name.length > 0
    && level.value.level_index !== null
    && level.value.level_id
    && level.value.level_id.length > 0)
})

const deleteTooltip = computed((): string => {
  if (props.hasAssociatedStops) {
    return 'This level has associated stops and cannot be deleted. First disassociate all stops/nodes from this level using the Draw Pathways tab.'
  }
  return 'Delete this level (confirmation required)'
})

function setGeometry (e: FeatureCollection | Feature | Polygon | MultiPolygon) {
  try {
    const mp = convertToMultiPolygon(e)
    level.value.geometry = mp
    geojsonError.value = null
  } catch (err) {
    geojsonError.value = err instanceof Error ? err.message : String(err)
  }
}

function onCloseGeojsonEditor (isOpen: boolean) {
  if (!isOpen) {
    // Clear the buffer when closing the editor
    geojsonGeometryBuffer.value = ''
  }
}

function confirmDelete () {
  showDeleteModal.value = false
  _emit('delete', level.value)
}

watch(() => level.value.level_name, (value: string | undefined) => {
  if (value && value.length > 0 && !level.value.id && props.station.stop) {
    const autoname = value.toLowerCase().replace(/\s/g, '-')
    level.value.level_id = `${props.station.stop.stop_id}-${autoname}`
  }
})
</script>
