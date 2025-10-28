<template>
  <div>
    <o-field grouped expanded class="block">
      <o-field label="Stop Buffer Radius (m)" expanded class="pr-6">
        <o-slider
          v-model="radius"
          size="medium"
          :min="100"
          :max="1000"
          :step="100"
          ticks
          lazy
        >
          <template v-for="val in [100,200,400,800,1000]" :key="val">
            <o-slider-tick :value="val">
              {{ val }}
            </o-slider-tick>
          </template>
        </o-slider>
      </o-field>

      <o-field label="Summary Level" expanded>
        <o-select v-model="layer">
          <option v-for="(v,k) of layerInfo" :key="k" :value="k">
            {{ v.name }}
          </option>
        </o-select>
      </o-field>

      <o-field label="Show on Map" expanded>
        <o-dropdown
          v-model="showOnMap"
          multiple
          aria-role="list"
        >
          <template #trigger>
            <button class="button" type="button" icon="menu-down">
              <span>
                {{ showOnMap.map((s)=>{return titleize(s)}).join(", ") }}
              </span>
            </button>
          </template>

          <o-dropdown-item value="buffer" aria-role="listitem">
            <span>Stop Buffer</span>
          </o-dropdown-item>

          <o-dropdown-item value="hull" aria-role="listitem">
            <span>Stop Hull</span>
          </o-dropdown-item>

          <o-dropdown-item value="census" aria-role="listitem">
            <span>Census Geographies</span>
          </o-dropdown-item>
        </o-dropdown>
      </o-field>
    </o-field>

    <div class="block">
      <o-field grouped>
        <o-field label="Download GeoJSON">
          <tl-geojson-downloader v-if="routeFeatures.length > 0" :features="routeFeatures" label="Routes" :filename="routeName" />
          <tl-geojson-downloader v-if="stopFeatures.length > 0" :features="stopFeatures" label="Stops" :filename="routeName + ' - Stops'" />
          <tl-geojson-downloader v-if="bufferFeatures.length > 0" :features="bufferFeatures" label="Stop Buffer" :filename="routeName + ' - Stop Buffer'" />
          <tl-geojson-downloader v-if="hullFeatures.length > 0" :features="hullFeatures" label="Stop Hull" :filename="routeName + '- Stop Hull'" />
          <tl-geojson-downloader v-if="censusFeatures.length > 0" :features="censusFeatures" label="Census Geographies" :filename="routeName + '- Census Geographies'" />
        </o-field>
      </o-field>
    </div>

    <tl-buffer-viewer :route-ids="routeIds" :agency-ids="agencyIds" :radius="radius" @set-buffer-features="bufferFeatures = $event" @set-hull-features="hullFeatures = $event" />
    <tl-census-viewer :route-ids="routeIds" :agency-ids="agencyIds" :radius="radius" :layer="layer" @set-features="censusFeatures = $event" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Feature } from 'geojson'

interface LayerInfo {
  name: string
  plural: string
}

type MapLayerType = 'buffer' | 'hull' | 'census'

const props = withDefaults(defineProps<{
  routeName?: string
  stopIds?: number[] | null
  routeIds?: number[] | null
  agencyIds?: number[] | null
  routeFeatures?: Feature[]
  stopFeatures?: Feature[]
}>(), {
  routeName: 'export',
  stopIds: null,
  routeIds: null,
  agencyIds: null,
  routeFeatures: () => [],
  stopFeatures: () => []
})

// Emits
const emit = defineEmits<{
  setFeatures: [features: Feature[]]
}>()

// Reactive data
const showOnMap = ref<MapLayerType[]>(['census', 'hull', 'buffer'])
const censusFeatures = ref<Feature[]>([])
const bufferFeatures = ref<Feature[]>([])
const hullFeatures = ref<Feature[]>([])
const radius = ref<number>(400.0)
const layer = ref<string>('tract')

const layerInfo: Record<string, LayerInfo> = {
  tract: { name: 'Tract', plural: 'Tracts' },
  county: { name: 'County', plural: 'Counties' },
  // bg: { name: 'Block Group', plural: 'Block Groups' }
  state: { name: 'State', plural: 'States' },
  // city: { name: 'City (Census Designated Place)', plural: 'Cities' },
  // cd: { name: 'Congressional District', plural: 'Congressional Districts' }
}

// Utility functions
const titleize = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Computed properties
const features = computed<Feature[]>(() => {
  const result: Feature[] = []

  if (showOnMap.value.includes('buffer')) {
    result.push(...bufferFeatures.value)
  }
  if (showOnMap.value.includes('hull')) {
    result.push(...hullFeatures.value)
  }
  if (showOnMap.value.includes('census')) {
    result.push(...censusFeatures.value)
  }

  return result
})

// Watch for features changes and emit
watch(features, (newFeatures) => {
  emit('setFeatures', newFeatures)
}, { immediate: true })
</script>
