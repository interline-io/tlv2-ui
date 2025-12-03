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

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Feature } from 'geojson'
import { Station } from './station'
import type { StationData } from './types'

interface MapChangeEvent {
  features: Feature[]
}

interface Props {
  center?: [number, number]
  value?: StationData
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [-122.431297, 37.773972] as [number, number],
  value: () => ({ levels: [], stops: [] } as StationData)
})

defineEmits<{
  update: [station: Station]
  delete: [station: Station]
  create: [station: Station]
  cancel: []
}>()

const station = ref(new Station(props.value.stop))
const basemap = ref('carto')

const editFeatures = computed((): Feature[] => {
  if (!station.value.stop.geometry) { return [] }
  return [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: station.value.stop.geometry.coordinates },
      properties: {}
    }
  ]
})

const valid = computed((): boolean => {
  return !!(station.value.stop.geometry
    && station.value.stop.stop_name
    && station.value.stop.stop_name.length > 0
    && station.value.stop.stop_id
    && station.value.stop.stop_id.length > 0)
})

watch(() => station.value.stop.stop_name, (value) => {
  if (value && value.length > 0 && station.value.id == null) {
    station.value.stop.stop_id = value.toLowerCase().replace(/\s/g, '-')
  }
})

function setGeometry (e: MapChangeEvent) {
  if (e.features.length !== 1) {
    station.value.stop.geometry = undefined
    return
  }
  station.value.stop.geometry = e.features[0]!.geometry as any
}
</script>
