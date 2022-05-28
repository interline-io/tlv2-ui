<template>
  <div>
    <div v-if="showControls" class="block">
      <b-field grouped expanded>
        <b-field v-if="showDateSelector" label="Departure time">
          <b-datetimepicker
            v-model="displayStartDate"
            rounded
            horizontal-time-picker
            placeholder="Click to select..."
            icon="calendar-today"
            trap-focus
          />
        </b-field>
        <b-field label="‍">
          <div style="padding-top:10px">
            <b-checkbox v-model="useServiceWindow">
              Use typical service date in feed version
            </b-checkbox>
          </div>
        </b-field>
      </b-field>
    </div>

    <div v-if="stops.length > 0">
      <div v-if="filteredStopsGroupRoutes.length === 0">
        No departures scheduled within the next hour in this feed version.
      </div>

      <div v-for="ss of filteredStopsGroupRoutes" :key="ss.stop.id">
        <div v-for="sr of ss.routes" :key="sr.id" class="is-clearfix">
          <div class="is-pulled-left">
            <nuxt-link
              :to="{name:'routes-onestop_id', params:{onestop_id:sr.route.onestop_id}}"
            >
              <tl-route-icon
                :key="sr.route.id"
                :route-type="sr.route.route_type"
                :route-short-name="sr.route.route_short_name"
                :route-long-name="sr.route.route_long_name"
                :route-link="sr.route.route_url"
              />
            </nuxt-link>
          </div>
          <div class="is-pulled-right">
            <b-field grouped group-multiline style="padding-top:20px">
              <b-taglist v-if="sr.trip_headsign" attached>
                <b-tag type="is-dark">
                  to:
                </b-tag>
                <b-tag>
                  {{ sr.trip_headsign }}
                </b-tag>
              </b-taglist>&nbsp;
              <b-tag v-for="st of sr.departures.slice(0,3)" :key="st.trip.id">
                <template v-if="st.departure.estimated">
                  {{ st.departure.estimated | reformatHMS }} <b-icon type="is-danger" size="is-small" icon="wifi" />
                </template><template v-else>
                  {{ st.departure.scheduled | reformatHMS }}
                </template>
              </b-tag>
            </b-field>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { parse, format } from 'date-fns'
import haversine from 'haversine'
import { gql } from 'graphql-tag'
import Filters from './filters'

const query = gql`
query( $ids: [Int!], $where: StopFilter, $serviceDate: Date!, $startTime: Int!, $endTime: Int!, $useServiceWindow: Boolean!) {
  # $serviceDate: Date, $startTime: Int, $endTime: Int, 
  stops(ids: $ids, where: $where) {
    id
    onestop_id
    stop_id
    stop_name
    stop_code
    geometry
    departures(
      where: {
        use_service_window: $useServiceWindow,
        service_date: $serviceDate,
        start_time: $startTime,
        end_time: $endTime
      }
    ) {
      service_date
      arrival_time
      arrival {
        delay
        estimated
        estimated_utc
        scheduled
        stop_timezone
        uncertainty
      }
      departure_time
      departure {
        delay
        estimated
        estimated_utc
        scheduled
        stop_timezone
        uncertainty
      }
      trip {
        id
        trip_id
        trip_headsign
        route {
            id
            onestop_id
            route_short_name
            route_long_name
            route_color
            route_text_color
            route_type
            route_url
        }
      }
    }
  }
}
`

export default {
  mixins: [Filters],
  props: {
    stopIds: { type: Array, required: true },
    showControls: { type: Boolean, default: true },
    showDateSelector: { type: Boolean, default: true }
  },
  data () {
    return {
      endSeconds: 7200,
      startDate: new Date(),
      stops: [],
      showStopInfo: false,
      useServiceWindow: false,
      currentPoint: { type: 'Point', coordinates: [-122.27159857749938, 37.80365531892627] }
    }
  },
  computed: {
    displayStartDate: {
      get () {
        if (this.useServiceWindow) {
          for (const st of this.stops) {
            for (const d of st.departures) {
              if (d.service_date) {
                const dd = parse(d.service_date, 'yyyy-MM-dd', new Date())
                dd.setHours(this.startDate.getHours())
                dd.setMinutes(this.startDate.getMinutes())
                return dd
              }
            }
          }
        }
        return this.startDate
      },
      set (v) {
        this.startDate = v
      }
    },
    filteredStops () {
      return this.stops.filter((s) => {
        return s.departures.length > 0
      }).sort((a, b) => {
        const ad = this.haversine(this.currentPoint, a.geometry)
        const bd = this.haversine(this.currentPoint, b.geometry)
        return ad - bd
      })
    },
    mapUpdate () {
      return 0
    },
    filteredStopsGroupRoutes () {
      const tripKeys = new Set()
      const ret = []
      for (const stop of this.filteredStops) {
        const rmap = {}
        // sort stop times
        const sortedSt = stop.departures.sort((a, b) => {
          const aa = a.departure.estimated || a.departure.scheduled
          const bb = b.departure.estimated || b.departure.scheduled
          if (aa > bb) {
            return 1
          }
          if (aa < bb) {
            return -1
          }
          return 0
        })
        for (const st of sortedSt) {
          const r = st.trip.route
          const hs = st.trip.trip_headsign
          const key = `${r.id}:${hs}`
          if (tripKeys.has(key)) {
            continue
          }
          const a = rmap[key] || { id: r.id, trip_headsign: hs, route: r, departures: [] }
          a.departures.push(st)
          rmap[key] = a
        }
        for (const k of Object.keys(rmap)) {
          tripKeys.add(k)
        }
        if (Object.keys(rmap).length > 0) {
          ret.push({
            stop,
            routes: Object.values(rmap)
          })
        }
      }
      return ret
    }
  },
  methods: {
    haversine (fromPoint, toPoint) {
      const d = haversine({
        latitude: fromPoint.coordinates[1],
        longitude: fromPoint.coordinates[0]
      }, {
        latitude: toPoint.coordinates[1],
        longitude: toPoint.coordinates[0]
      }, { unit: 'meter' })
      return d
    }
  },
  apollo: {
    stops: {
      query,
      variables () {
        return {
          nextSeconds: 3600 * 2,
          ids: this.stopIds,
          useServiceWindow: this.useServiceWindow,
          serviceDate: format(this.startDate, 'yyyy-MM-dd'),
          startTime: this.startDate.getHours() * 3600 + this.startDate.getMinutes() * 60,
          endTime: (this.startDate.getHours() * 3600 + this.startDate.getMinutes() * 60) + this.endSeconds
        }
      }
    }
  }
}
</script>
