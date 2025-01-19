<template>
  <div>
    <o-field grouped expanded class="block">
      <o-field label="Stop Buffer Radius (m)" expanded class="pr-6">
        <o-slider
          v-model="radius"
          size="medium"
          :min="0"
          :max="2000"
          :step="100"
          ticks
          lazy
        >
          <template v-for="val in [400,1000,2000]" :key="val">
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

    <tl-loading v-if="$apollo.loading" />
    <div v-else class="block">
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

<script>

export default {
  props: {
    routeName: { type: String, default: 'export' },
    stopIds: { type: Array, default () { return null } },
    routeIds: { type: Array, default () { return null } },
    agencyIds: { type: Array, default () { return null } },
    routeFeatures: { type: Array, default () { return [] } },
    stopFeatures: { type: Array, default () { return [] } }
  },
  data () {
    return {
      showOnMap: ['census', 'hull', 'buffer'],
      censusFeatures: [],
      bufferFeatures: [],
      hullFeatures: [],
      radius: 400.0,
      layer: 'tract',
      layerInfo: {
        tract: { name: 'Tract', plural: 'Tracts' },
        county: { name: 'County', plural: 'Counties' }
        // bg: { name: 'Block Group', plural: 'Block Groups' }
        // state: { name: 'State', plural: 'States' },
        // city: { name: 'City (Census Designated Place)', plural: 'Cities' },
        // cd: { name: 'Congressional District', plural: 'Congressional Districts' }
      }
    }
  },
  computed: {
    features () {
      if (this.$apollo.loading) { return [] }
      let ret = []
      if (this.showOnMap.includes('buffer')) {
        ret = ret.concat(this.bufferFeatures)
      }
      if (this.showOnMap.includes('hull')) {
        ret = ret.concat(this.hullFeatures)
      }
      if (this.showOnMap.includes('census')) {
        ret = ret.concat(this.censusFeatures)
      }
      return ret
    }
  },
  watch: {
    features () {
      this.$emit('setFeatures', this.features)
    }
  },
  methods: {
    titleize (s) {
      return s.substr(0, 1).toUpperCase() + s.substr(1)
    }
  }
}
</script>
