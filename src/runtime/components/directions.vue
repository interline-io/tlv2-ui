<template>
  <div>
    <!-- SELECTED ITIN -->
    <div v-if="selectedItin">
      <o-button icon-left="arrow-left" @click="selectedItinIdx = null; activeItinIdx = null">
        Back ({{ directions.itineraries.length }} itineraries)
      </o-button>

      <div
        v-for="(leg,legIdx) of selectedItin.legs"
        :key="legIdx"
        class="itin-summary"
      >
        <div class="itin-summary-icons">
          <div class="itin-summary-icons-time">
            {{ formatDateTime(leg.start_time ) }}
          </div>
          <o-icon
            :icon="legModeIcon(leg).icon"
            size="medium"
          />
        </div>
        <div class="itin-summary-text">
          <!-- Yes, flex would be better than a table, but... -->
          <table class="itin-summary-table">
            <tr v-if="leg.from?.name">
              <td class="itin-prop">
                <strong>From:</strong>
              </td>
              <td> {{ leg.from.name }}</td>
            </tr>
            <tr v-if="leg.to?.name">
              <td class="itin-prop">
                <strong>To:</strong>
              </td>
              <td> {{ leg.to.name }}</td>
            </tr>
            <template v-if="leg.trip?.route">
              <tr>
                <td class="itin-prop">
                  <strong>Agency:</strong>
                </td>
                <td>{{ leg.trip.route.agency.agency_name }}</td>
              </tr>
              <tr>
                <td class="itin-prop">
                  <strong>Route:</strong>
                </td>
                <td>{{ [leg.trip.route.route_short_name, leg.trip.route.route_long_name].filter(Boolean).join(' ') }}</td>
              </tr>
              <tr>
                <td class="itin-prop">
                  <strong>Headsign:</strong>
                </td>
                <td>{{ leg.trip.headsign }}</td>
              </tr>
            </template>
          </table>

          <tl-directions-stops v-if="leg.stops" :stops="leg.stops" />

          <div class="itin-duration">
            {{ formatDuration(leg.duration.duration) }} /
            {{ leg.distance.distance.toFixed(2) }} {{ leg.distance.units.toLowerCase() }}
          </div>
        </div>
      </div>

      <!-- End step -->
      <div class="itin-summary">
        <div class="itin-summary-icons">
          <div class="itin-summary-icons-time">
            {{ formatDateTime(selectedItin.end_time) }}
          </div>
        </div>
        <div class="itin-summary-text">
          <strong>Arrived</strong>
        </div>
      </div>
    </div>

    <!-- ITIN CHOOSER -->
    <div v-else>
      <!-- INPUTS -->
      <div class="is-clearfix">
        <o-field addons expanded>
          <o-button
            v-for="(v,k) of modeIcons"
            :key="k"
            expanded
            class="mode-icon"
            :icon-left="v"
            :variant="props.mode === k ? 'primary' : 'default'"
            @click="setMode(k)"
          />
        </o-field>

        <o-field horizontal label="From">
          <o-input :model-value="lonLatStr(fromPlace)" />
        </o-field>
        <o-field horizontal label="To">
          <o-input :model-value="toPlaceStr" />
        </o-field>

        <o-field addons horizontal label="Depart">
          <o-datepicker
            v-model="departAtDate"
          />
          <o-input
            v-model="departAtTime"
            :variant="departAtOut.length === 0 ? 'danger' : ''"
            :message="departAtOut.length === 0 ? 'Invalid time' : ''"
          />
        </o-field>

        <div class="utc-note">
          * currently must be in UTC
        </div>

        <o-button class="is-pulled-right" @click="reset">
          Reset
        </o-button>
      </div>

      <!-- LOADING STATE -->
      <tl-loading v-if="loading">
        Loading...
      </tl-loading>

      <!-- ERROR STATE -->
      <tl-msg-error v-else-if="error">
        Sorry, there was an error loading the directions. Please try again.
      </tl-msg-error>
      <div v-else-if="directions && !directions.success">
        <tl-msg-error>
          Sorry, we couldn't find any directions for your request. Please check your input and try again.
        </tl-msg-error>
      </div>

      <!-- ITIN SUMMARIES -->
      <div v-else-if="directions && directions.success">
        <div v-for="(itin,itinIdx) of (directions.itineraries || []).slice(0,5)" :key="itinIdx">
          <div
            :class="{ 'itin-summary': true, 'itin-summary-active': activeItinIdx === itinIdx }"
            @click="selectedItinIdx = itinIdx; activeItinIdx = itinIdx"
            @mouseover="activeItinIdx = itinIdx"
          >
            <div class="itin-summary-icons">
              <o-icon
                v-for="(icon,iconIdx) of itinModeIcons(itin)"
                :key="iconIdx"
                :icon="icon"
                size="medium"
              />
            </div>
            <div class="itin-summary-text">
              <div class="itin-summary-text-time">
                <strong>
                  {{ formatDateTime(itin.start_time ) }}
                  <o-icon icon="chevron-right" size="small" class="itin-chevron" />
                  {{ formatDateTime(itin.end_time ) }}
                </strong>
              </div>
              <div class="itin-summary-text-legs">
                <span
                  v-for="(rid,ridIdx) of itinLegIcons(itin)"
                  :key="ridIdx"
                >
                  <span
                    class="itin-route-id"
                    size="small"
                  >
                    <o-icon :icon="rid.icon" size="small" />
                    {{ rid.route }}
                  </span>
                  <o-icon icon="chevron-right" size="small" />
                </span>
              </div>
              <div class="itin-duration">
                {{ formatDuration(itin.duration.duration) }} /
                {{ itin.distance.distance.toFixed(2) }} {{ itin.distance.units.toLowerCase() }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLazyQuery } from '@vue/apollo-composable'
import { gql } from 'graphql-tag'
import { parseISO, format } from 'date-fns'
import type { Geometry } from 'geojson'
import { formatDuration } from '../lib/filters'
import { LonLat, lonLatStr } from '../lib/geom'

// Types
interface DirectionsQueryResponse {
  directions: {
    success: boolean
    itineraries?: {
      duration: {
        duration: number
        units: string
      }
      distance: {
        distance: number
        units: string
      }
      from: {
        lon: number
        lat: number
      }
      to: {
        lon: number
        lat: number
      }
      start_time: string
      end_time: string
      legs: {
        duration: {
          duration: number
          units: string
        }
        distance: {
          distance: number
          units: string
        }
        start_time: string
        end_time: string
        from: {
          lon: number
          lat: number
          name?: string
        }
        to: {
          lon: number
          lat: number
          name?: string
        }
        mode: string
        stops?: {
          lon: number
          lat: number
          departure: string
          stop_id: string
          stop_name: string
        }[]
        trip?: {
          trip_id: string
          headsign?: string
          route: {
            route_id: string
            route_short_name?: string
            route_long_name?: string
            route_type: number
            route_color?: string
            agency: {
              agency_id: string
              agency_name: string
            }
          }
        }
        geometry?: Geometry
      }[]
    }[]
  }
}

// Extract individual types from the response type
type DirectionsResponse = DirectionsQueryResponse['directions']
type Itinerary = NonNullable<DirectionsResponse['itineraries']>[0]
type Leg = Itinerary['legs'][0]

interface LegIcon {
  icon: string
  route: string | null
}

const props = withDefaults(defineProps<{
  fromPlace?: LonLat
  toPlace?: LonLat
  mode?: string
  departAt?: string
}>(), {
  fromPlace: null,
  toPlace: null,
  mode: 'WALK',
  departAt: () => new Date().toISOString()
})

const activeItinIdx = ref<number | null>(null)
const selectedItinIdx = ref<number | null>(null)
const departAtDate = ref<Date>(parseISO(props.departAt))
const departAtTime = ref<string>(format(parseISO(props.departAt), 'HH:mm:ss'))

const emit = defineEmits<{
  setMode: [mode: string]
  setPlaces: [places: any]
  setFeatures: [features: any[]]
  setMarkers: [markers: any[]]
  setDepartAt: [departAt: string]
  reset: []
}>()

// Apollo setup

const query = gql`
query ($where:DirectionRequest!) {
  directions(where:$where) {
    success
    itineraries {
      duration {
        duration
        units
      }
      distance {
        distance
        units
      }
      from {
        lon
        lat
      }
      to {
        lon
        lat
      }
      start_time
      end_time
      legs {
        duration {
          duration
          units
        }
        distance {
          distance
          units
        }
        start_time
        end_time
        from {
          lon
          lat
          name
        }
        to {
          lon
          lat
          name
        }
        mode
        stops {
          lon
          lat
          departure
          stop_id
          stop_name
        }
        trip {
          trip_id
          headsign
          route {
            route_id
            route_short_name
            route_long_name
            route_type
            route_color
            agency {
              agency_id
              agency_name
            }
          }
        }
        geometry
      }
    }
  }
}`

// Query

// Setup query variables
const vars = computed(() => ({
  where: {
    from: props.fromPlace,
    to: props.toPlace,
    mode: props.mode,
    depart_at: props.departAt
  }
}))

// Setup query
const { result, loading, error, load, refetch } = useLazyQuery<DirectionsQueryResponse>(query, null, { clientId: 'transitland' })

// Watch for changes
const loadReady = computed(() => {
  return props.fromPlace && props.toPlace && props.mode
})

function loadReload (): void {
  selectedItinIdx.value = null
  activeItinIdx.value = null
  if (loadReady.value) {
    load(query, vars.value) || refetch(vars.value)
  }
}

watch(vars, loadReload)
loadReload()

// Get directions from result
const directions = computed<DirectionsResponse | null>(() => loadReady.value ? result.value?.directions : null)

// Computed properties

const departAtOut = computed(() => {
  if (departAtTime.value.length !== 8) { return '' }
  const dateStr = `${format(departAtDate.value, 'yyyy-MM-dd')}T${departAtTime.value}Z`
  return parseISO(dateStr).toISOString()
})

const fromPlaceStr = computed(() =>
  lonLatStr(props.fromPlace)
)

const toPlaceStr = computed(() =>
  lonLatStr(props.toPlace)
)

const selectedItin = computed<Itinerary | null>(() => {
  if (directions.value && selectedItinIdx.value !== null) {
    return directions.value.itineraries?.[selectedItinIdx.value] || null
  }
  return null
})

const activeOrFirstItin = computed<Itinerary | null>(() => {
  if (!directions.value?.itineraries) { return null }
  let idx = 0
  if (activeItinIdx.value !== null) {
    idx = activeItinIdx.value
  } else if (selectedItinIdx.value !== null) {
    idx = selectedItinIdx.value
  }
  if (idx >= directions.value.itineraries.length) { return null }
  return directions.value.itineraries[idx]
})

const activeFeatures = computed(() => {
  const feats: any[] = []
  let featId = 0
  if (directions.value && activeOrFirstItin.value) {
    for (const leg of activeOrFirstItin.value.legs) {
      if (!leg.geometry) { continue }
      const props: any = {
        'stroke-width': 6,
        'id': featId++,
        'stroke': '#666'
      }
      if (leg.trip) {
        let routeColor = leg.trip.route.route_color || '#ff0000'
        if (routeColor.length === 6) {
          routeColor = '#' + routeColor
        }
        props['stroke-width'] = 6
        props.id = featId++
        props.stroke = routeColor
        props.route_id = leg.trip.route.route_id
      }
      feats.push({
        type: 'Feature',
        id: props.id,
        geometry: leg.geometry,
        properties: props
      })
    }
  }
  return feats
})

// Methods

const modeIcons: Record<string, string> = {
  WALK: 'walk',
  AUTO: 'car',
  TRANSIT: 'bus'
  // LINE: 'map-marker'
}

const routeTypeIcons: Record<number, string> = {
  0: 'subway',
  1: 'subway',
  2: 'train',
  3: 'bus'
}

const formatDateTime = (value: string): string => {
  return format(parseISO(value), 'h:mm aaa')
}

const legModeIcon = (leg: Leg): LegIcon => {
  if (leg.trip && leg.trip.route) {
    const rt = leg.trip.route.route_type
    return {
      icon: routeTypeIcons[rt] || 'walk',
      route: leg.trip.route.route_id
    }
  } else if (leg.mode === 'WALK') {
    return {
      icon: 'walk',
      route: null
    }
  } else if (leg.mode === 'AUTO') {
    return {
      icon: 'car',
      route: null
    }
  }
  return {
    icon: 'walk',
    route: null
  }
}

const itinLegIcons = (itin: Itinerary): LegIcon[] => {
  return itin.legs.map(legModeIcon)
}

const itinModeIcons = (itin: Itinerary): string[] => {
  const icons: Record<string, LegIcon> = {}
  for (const ic of itin.legs.map(legModeIcon)) {
    icons[ic.icon] = ic
  }
  if ('walk' in icons && Object.keys(icons).length > 1) {
    delete icons.walk
  }
  return Object.keys(icons)
}

// Setters

const reset = (): void => {
  emit('reset')
}

const setMode = (m: string): void => {
  console.log('setMode', m)
  emit('setMode', m)
}

// Watchers
watch(activeFeatures, (newFeatures) => {
  emit('setFeatures', newFeatures)
})

watch(departAtOut, (newValue) => {
  if (newValue) {
    emit('setDepartAt', newValue)
  }
})
</script>

<style scoped>
.itin-summary {
  border:solid 1px #fff;
  display:flex;
  flex-direction:row;
  vertical-align: top;
  margin-bottom:10px;
}
.itin-summary-active {
  background:#eee
}
.itin-summary-icons {
  min-width:80px;
  margin:5px;
  padding:5px;
}
.itin-summary-text {
  flex-grow:1;
  margin:5px;
  padding:5px;
}
.itin-summary-icons-time {
  padding:0px;
  margin:0px;
  font-size:12pt;
  font-weight: bold;
  margin-bottom:10px;
}
.itin-duration {
  text-align:right;
  font-size:10pt;
  color:#999;
}
.itin-prop {
  width:90px;
  text-align:left;
}

.utc-note {
  font-size:8pt;
  text-align:right;
  margin:8px;
}
.itin-chevron {
  margin-left:6px;
  margin-right:6px;
}
</style>
