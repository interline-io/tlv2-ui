<template>
  <div>
    <nav id="analyst-breadcrumbs" class="box">
      <div class="columns">
        <div class="column is-half">
          <div class="label">
            <h5 class="title is-5">
              Selected Station:
            </h5>
          </div>
          <div>
            {{ props.stationArea.properties.name }}
          </div>
          <div>
            <tl-link
              class="button is-outline"
              route-key="analyst-transit-transfers"
              :to="{ query: route.query }"
            >
              Change Station
            </tl-link>
          </div>
        </div>
        <div class="column is-half">
          <div class="label">
            <h5 class="title is-5">
              Selected Report:
            </h5>
          </div>
          <div v-for="(report, reportId) in reports" :key="reportId">
            <tl-link
              :route-key="reportId"
              :to="{
                params: { stationKey: props.stationArea.properties.id },
                query: ['analyst-transit-transfers-stationKey-maps', 'analyst-transit-transfers-stationKey-routes'].includes(reportId) ? queryParamsWithoutTripFilters : route.query,
              }"
              class="button is-outline is-fullwidth"
              :class="[route.name == resolve(reportId) ? 'is-active is-primary' : '', report.disabled ? 'is-disabled' : '']"
              :title="report.disabled ? 'This report is currently disabled' : ''"
            >
              {{ report.name }}
            </tl-link>
          </div>
        </div>
      </div>
    </nav>
    <br>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRouteResolver } from '../../composables/useRouteResolver'
import type { StationHub } from './types'

interface Props {
  stationArea: StationHub
}

const props = defineProps<Props>()

const route = useRoute()
const { resolve } = useRouteResolver()

interface Report {
  name: string
  disabled: boolean
}

const reports: Record<string, Report> = {
  'analyst-transit-transfers-stationKey-maps': { name: 'Maps & Platforms', disabled: false },
  'analyst-transit-transfers-stationKey-routes': { name: 'Routes', disabled: false },
  'analyst-transit-transfers-stationKey-transfers': { name: 'Transfers — Individual', disabled: false },
  'analyst-transit-transfers-stationKey-transfersummary': { name: 'Transfers - Summary', disabled: false },
  'analyst-transit-transfers-stationKey-transferscomparison': { name: 'Transfers - Overview of Different Service Conditions', disabled: true }
}
// ...existing code...

const queryParamsWithoutTripFilters = computed<Record<string, any>>(() => {
  // trip filters aren't relevant to the "Maps & Platforms" and "Routes" reports
  // we don't want to retain these query params, otherwise they may be carried on
  // unexpectedly to another page the user visits later on
  return Object.fromEntries(Object.entries(route.query).filter(([key]) => {
    return !['excludeIncomingTrips', 'excludeOutgoingTrips'].includes(key)
  }))
})
</script>

<style scoped>
#analyst-breadcrumbs {
  margin-top: 20px;
}
.tag {
  margin-left: 1em;
}
.button.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
