<template>
  <div>
    <o-field grouped>
      <o-button>
        <o-icon icon="fullscreen" @click="showModal=true" />
      </o-button>
      <o-select v-model="showKey">
        <option v-for="[k,mergedPattern] of Object.entries(directionTables)" :key="k" :value="k">
          To: {{ mergedPattern.title }}
        </option>
      </o-select>

      <o-datepicker
        v-model="displayServiceDate"
        placeholder="Click to select..."
        icon="calendar-today"
        trap-focus
      />

      <o-field>
        <o-dropdown position="bottom-left" append-to-body aria-role="menu" trap-focus menu-class="tl-feeds-table">
          <template #trigger="{ active }">
            <o-button label="Options" :icon-left="active ? 'menu-up' : 'menu-down'" />
          </template>

          <div aria-role="menu-item" style="padding:20px">
            <o-field label="Group by">
              <o-checkbox v-model="groupByRoute">
                Route
              </o-checkbox>
            </o-field>
            <o-field>
              <o-checkbox v-model="groupByHeadsign">
                Headsign
              </o-checkbox>
            </o-field>
            <o-field>
              <o-checkbox v-model="groupByStopPattern">
                Stop Pattern
              </o-checkbox>
            </o-field>
          </div>
        </o-dropdown>
      </o-field>
    </o-field>

    <tl-loading v-if="$apollo.loading" />
    <tl-msg-error v-else-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else-if="routes.length > 0">
      <div
        v-if="activeTable"
        class="tl-timepoint-overflow"
      >
        <tl-route-departures-table
          :merged-pattern="activeTable"
          :timepoint-limit="6"
        />
      </div>

      <tl-modal
        v-model="showModal"
        title="Route Schedule"
      >
        <tl-route-departures-table :merged-pattern="activeTable" :timepoint-limit="100" />
      </tl-modal>
    </div>
  </div>
</template>

<script lang="ts">
import { gql } from 'graphql-tag'
import { parseISO, format, add, isBefore } from 'date-fns'
import { MergedPattern, Route, Trip, timepointTables } from './route-departures'

const q = gql`
query($ids: [Int!], $service_date: Date!) {
    routes(ids: $ids) {
        id
        onestop_id
        trips(limit: 1000, where: { service_date: $service_date}) {
            id
            trip_id
            trip_headsign
            direction_id
            stop_pattern_id
            stop_times(limit: 1000) {
                stop_sequence
                stop_headsign
                timepoint
                departure {
                  scheduled
                  estimated
                }
                stop {
                    id
                    stop_name
                    onestop_id
                }
            }
        }
    }
}
`

interface DirectionTables {[key: string]: MergedPattern}

export default {
  props: {
    routeId: { type: Number, default: 0 }
  },
  data () {
    const serviceDate: Date = new Date()
    return {
      showModalMergedPattern: {},
      showKey: 'inbound',
      routes: new Array<Route>(),
      showModal: false,
      groupByRoute: true,
      groupByDirection: true,
      groupByHeadsign: false,
      groupByStopPattern: false,
      error: '',
      serviceDate
    }
  },
  apollo: {
    routes: {
      query: q,
      error (e) { this.error = String(e) },
      variables () {
        return {
          ids: [this.routeId],
          service_date: format(this.serviceDate, 'yyyy-MM-dd')
        }
      }
    }
  },
  computed: {
    displayServiceDate: {
      get () {
        if (this.serviceDate) {
          return this.serviceDate
        }
        // Get default date
        // const days = this.fvsls.map((s) => { return s.start_date }).sort()
        // if (days.length > 0) {
        //   return serviceDate(days[0].substr(0, 10))
        // }
        // return serviceDate('2020-01-01')
        return parseISO('2020-01-01')
      },
      set (v: Date) {
        this.serviceDate = v
      }
    },
    activeTable() {
      return this.directionTables[this.showKey]
    },
    directionTables(): DirectionTables {
      if (this.routes.length === 0) {
        return {}
      }
      const groupedTrips = new Map<string, Array<Trip>>()
      for (const route of this.routes) {
        for (const trip of route.trips) {
          const key = []
          if (this.groupByRoute) {
            key.push(route.id)
          }
          if (this.groupByDirection) {
            key.push(trip.direction_id)
          }
          if (this.groupByHeadsign) {
            key.push(trip.trip_headsign)
          }
          if (this.groupByStopPattern) {
            key.push(trip.stop_pattern_id)
          }
          const ks = key.join('|')
          const a = groupedTrips.get(ks) || []
          a.push(trip)
          groupedTrips.set(ks, a)
        }
      }
      const ret: DirectionTables = {}
      for (const [k, v] of groupedTrips.entries()) {
        ret[k] = timepointTables(v)
      }
      return ret
    }
  },
  watch: {
    directionTables () {
      const keys = Object.keys(this.directionTables)
      keys.sort()
      this.showKey = keys.length > 0 ? keys[0] : ''
    }
  }
}
</script>

<style>
.tl-stop-column {
  min-width:120px;
}
.tl-timepoint-overflow {
  width:100% !important;
  overflow-x:scroll;
}

</style>
