<template>
  <div v-if="props.stationArea">
    <tl-transit-transfers-breadcrumbs
      :station-area="props.stationArea"
    />

    <tl-title :title="`${props.stationArea.properties.name}: Transfers – Individual`" />

    <tl-transit-transfers-scenario-with-controls
      :station-hubs="[]"
      :station-area="props.stationArea"
      :show-transfer-controls="true"
      :show-trip-controls="true"
    >
      <template #default="{ scenario, scenarioResult, station }">
        {{ (currentScenario = scenario, currentStation = station, '') }}
        <o-notification
          v-if="scenarioResult && scenarioResult.transferGroups.length === 0"
          variant="warning"
          :closeable="false"
        >
          <span>No incoming trips match the current location and filters.</span>
        </o-notification>
        <div v-else-if="scenarioResult && scenario && station">
          <tl-transit-transfers-time-scoring-histogram
            :scenario="scenario as any"
            :transfer-groups="scenarioResult.transferGroups"
          />

          <hr>

          <div class="is-pulled-right pb-4">
            <csv-download :data="getCsvData(scenarioResult)" />
          </div>

          <br>

          <table class="table is-narrow is-fullwidth">
            <thead>
              <tr>
                <th />
                <th>
                  <div>Agency</div>
                </th>
                <th>
                  <div>Route</div>
                </th>
                <th>
                  <div>Category / Sub-category</div>
                </th>
                <th>
                  <div>Headsign</div>
                </th>
                <th>
                  <div>Arrival</div>
                </th>
                <th>
                  <div>Departure</div>
                </th>
                <!-- <th>
                <div>Until Departure</div>
              </th> -->
                <th>
                  <div>Walking</div>
                </th>
                <th />
                <template v-if="scenario?.useStopObservations && hasAtLeastOneStopObservation(scenarioResult)">
                  <th style="min-width:100px">
                    <div>Wait:<br>Scheduled</div>
                  </th>
                  <th style="min-width:100px">
                    <div>Wait:<br>Observed</div>
                  </th>
                </template>
                <th v-else>
                  <div>Wait</div>
                </th>
              </tr>
            </thead>
            <tbody v-if="scenarioResult.transferGroups.length === 0">
              <tr class="incomingRow">
                <td />
                <td colspan="100">
                  <em>No incoming trips match the current filters</em>
                </td>
              </tr>
            </tbody>
            <tbody
              v-for="tripGroup in scenarioResult.transferGroups.slice(0, transferDisplayLimit)"
              :key="tripGroup.id"
            >
              <tr class="incomingRow">
                <td>Incoming</td>
                <td>{{ tripGroup.agency_name }}</td>
                <td>{{ tripGroup.route_name }}</td>
                <td>
                  <route-category-abbr
                    :key="tripGroup.route?.id"
                    :category="tripGroup.route?.route_attribute?.category"
                    :subcategory="tripGroup.route?.route_attribute?.subcategory"
                  />
                </td>
                <!-- Incoming Trip: Headsign -->
                <td>
                  {{ tripGroup.trip_headsign }}
                  <span
                    v-if="tripGroup.schedule_relationship === 'ADDED'"
                    class="has-text-warning"
                  >
                    <i
                      class="mdi mdi-rss mdi-16px"
                      title="Added trip detected using real-time stop observation"
                    />
                  </span>
                </td>
                <!-- Incoming Trip: Arrival Time -->
                <td class="td-arrival">
                  <tl-transit-transfers-time-event
                    :schedule-relationship="tripGroup.schedule_relationship"
                    :scheduled-time="tripGroup.scheduled_arrival_time"
                    :observed-time="tripGroup.observed_arrival_time"
                    transfer-leg="Arrival"
                  >
                    <template #canceled>
                      <span class="has-text-danger is-italic">Canceled</span>
                    </template>
                  </tl-transit-transfers-time-event>
                </td>
                <td />
                <td />
                <td />
                <td />
                <td v-if="scenario?.useStopObservations && hasAtLeastOneStopObservation(scenarioResult)" />
              </tr>
              <tr v-if="(tripGroup as any).length === 0">
                <td />
                <td colspan="4">
                  <em>No departures match the current filters</em>
                </td>
              </tr>
              <template v-if="tripGroup.schedule_relationship === 'CANCELED'">
                <tr>
                  <td />
                  <td colspan="4">
                    <span class="has-text-danger is-italic">Incoming trip was canceled.</span>
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr
                  v-for="toTrip in tripGroup.transfers"
                  :key="toTrip.id"
                >
                  <td />
                  <td>{{ toTrip.agency_name }}</td>
                  <td>{{ toTrip.route_name }}</td>
                  <td>
                    <route-category-abbr
                      :key="tripGroup.route?.id"
                      :category="toTrip.route?.route_attribute?.category"
                      :subcategory="toTrip.route?.route_attribute?.subcategory"
                    />
                  </td>
                  <!-- Outgoing trip: Headsign -->
                  <td>
                    {{ toTrip.trip_headsign }}
                    <span
                      v-if="toTrip.schedule_relationship === 'ADDED'"
                      class="has-text-warning"
                    >
                      <i
                        class="mdi mdi-rss mdi-16px"
                        title="Added trip detected using real-time stop observation"
                      />
                    </span>
                  </td>
                  <td />
                  <!-- Outgoing trip: departure time -->
                  <td class="td-arrival">
                    <tl-transit-transfers-time-event
                      :schedule-relationship="toTrip.schedule_relationship"
                      :scheduled-time="toTrip.scheduled_departure_time"
                      :observed-time="toTrip.observed_departure_time"
                      transfer-leg="Departure"
                    >
                      <template #canceled>
                        <span class="has-text-danger is-italic">Canceled</span>
                      </template>
                    </tl-transit-transfers-time-event>
                  </td>
                  <!-- Walking Time -->
                  <template v-if="toTrip.schedule_relationship === 'CANCELED'">
                    <td />
                    <td />
                    <td />
                    <td />
                  </template>
                  <template v-else>
                    <td>
                      <span
                        v-if="toTrip.transfer_override"
                        class="abbr tooltip"
                        v-bind="{ 'data-tooltip': 'Walking time set using manual override. Click to change the value.' }"
                      >
                        <span
                          @click="openOverrideModal(tripGroup.stop_key, toTrip.stop_key, toTrip.transfer_walking_time)"
                        >{{ secondsToDuration(toTrip.transfer_walking_time) }}</span>
                        <o-icon
                          style="padding-left:10px"
                          variant="primary"
                          icon="timer-outline"
                          size="small"
                          @click="unsetTransferOverride(scenario, tripGroup.stop_key, toTrip.stop_key)"
                        />
                      </span>
                      <span
                        v-else-if="toTrip.transfer_uses_pathways"
                        class="abbr tooltip"
                        v-bind="{ 'data-tooltip': 'Walking time calculated using pathways. Click to override walking time.' }"
                      >
                        <span
                          @click="openOverrideModal(tripGroup.stop_key, toTrip.stop_key, toTrip.transfer_walking_time)"
                        >{{ secondsToDuration(toTrip.transfer_walking_time) }}</span>
                      </span>
                      <span
                        v-else
                        class="abbr tooltip"
                        v-bind="{ 'data-tooltip': 'Walking time calculated by straight-line distance at 1m/s. Click to override walking time.' }"
                      >
                        <span
                          @click="openOverrideModal(tripGroup.stop_key, toTrip.stop_key, toTrip.transfer_walking_time)"
                        >{{ secondsToDuration(toTrip.transfer_walking_time) }}</span>
                      </span>
                    &nbsp;
                    </td>
                    <!-- Map button -->
                    <td>
                      <span
                        v-if="toTrip.transfer_edges.length > 0"
                        class="button is-small"
                        @click="openMap(toTrip, toTrip.transfer_edges)"
                      >
                        Map
                      </span>
                    </td>
                    <!-- Wait Time(s) -->
                    <template v-if="scenario?.useStopObservations">
                      <td :class="tripDisplayClass(scenario, toTrip.scheduled_buffer_time)">
                        {{ secondsToDuration(toTrip.scheduled_buffer_time) }}
                      </td>
                      <td
                        v-if="toTrip.observed_buffer_time"
                        :class="tripDisplayClass(scenario, toTrip.observed_buffer_time)"
                      >
                        {{ secondsToDuration(toTrip.observed_buffer_time) }}
                        <span class="has-text-warning is-pulled-right"><i
                          class="mdi mdi-rss mdi-16px"
                          title="Wait time calculated using real-time stop observations"
                        /></span>
                      </td>
                    </template>
                    <template v-else>
                      <td :class="tripDisplayClass(scenario, toTrip.buffer_time)">
                        {{ secondsToDuration(toTrip.buffer_time) }}
                      </td>
                    </template>
                  </template>
                </tr>
                <tr v-if="tripGroup.hidden_transfers.length > 0">
                  <td />
                  <td colspan="4">
                    <strong>... and {{ tripGroup.hidden_transfers.length }} subsequent transfer{{ tripGroup.hidden_transfers.length > 1 ? 's' : '' }} to
                      {{ tripGroup.hidden_transfers.map((t) => { return `${t.route_name}: ${t.trip_headsign}` }).join(', ') }} not displayed.
                    </strong>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>

          <o-notification
            v-if="scenarioResult.transferGroups.length > transferDisplayLimit"
            variant="warning"
          >
            <o-button
              variant="primary"
              class="is-pulled-right"
              @click="transferDisplayLimit = 100000"
            >
              Show all
            </o-button>
            <p>
              Displaying transfer details for first {{ transferDisplayLimit }} of {{ scenarioResult.transferGroups.length }}
              total incoming trips. You may display more, but your browser may slow down. Note that all trips are always
              included in the bar chart histogram, even if they are not all listed simultaneously in the detailed table
              view.
            </p>
          </o-notification>
        </div>
      </template>
    </tl-transit-transfers-scenario-with-controls>
  </div>

  <tl-modal v-model="showMap">
    <tl-transit-transfers-platform-pathway
      :station="currentStation"
      :edges="transferEdges"
      :trip="showTrip"
      @close="showMap = false"
    />
  </tl-modal>

  <tl-modal
    v-model="showOverrideModal"
    title="Override transfer walking time"
  >
    <p class="content">
      This form allows you to override the transfer time between two trips. You can select either a single destination stop or "All Stops" to set a manual transfer time for all transfers from the incoming trip.
    </p>
    <tl-transit-transfers-time-override
      :key="overrideFromStop + overrideToStop + overrideValue"
      :from-stop="overrideFromStop"
      :to-stop="overrideToStop"
      :time="overrideValue"
      @set-time="(fromStop: number | null, toStop: number | string | null, time: number | null) => saveTransferOverride(currentScenario, fromStop, toStop, time)"
    />
  </tl-modal>

  <!-- Modals moved outside the conditional div to ensure they work properly -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { secondsToDuration, secondsToString } from '../../utils/time-format'
import type { StationHub } from '../types'
import { navigateTo, useRoute } from '#app'

interface Props {
  stationArea: StationHub
}

const props = defineProps<Props>()
const route = useRoute()

// Store scenario and station from slot props for modal access
const currentScenario = ref<any>(null)
const currentStation = ref<any>(null)

// Local state for modals and UI
const transferDisplayLimit = ref(25)
const transferEdges = ref<any[]>([])
const showMap = ref<boolean>(false)
const showTrip = ref<any>(null)
const showOverrideModal = ref(false)
const overrideFromStop = ref<any>(null)
const overrideToStop = ref<any>(null)
const overrideValue = ref(0)

// These will be provided by slot props - just placeholders for reactive computeds that use them
function hasAtLeastOneStopObservation (scenarioResult: any) {
  if (!scenarioResult) return false
  for (const d of scenarioResult.outgoingDepartures) {
    if (d.observed_arrival_time) {
      return true
    }
  }
  return false
}

function getCsvData (scenarioResult: any) {
  if (!scenarioResult) return []
  const rows: any[] = []
  for (const tg of scenarioResult.transferGroups) {
    const baseRow = {
      from_agency_id: tg.agency_id,
      from_agency_name: tg.agency_name,
      from_route_id: tg.route_id,
      from_route_name: tg.route_name,
      from_stop_id: tg.stop_id,
      from_stop_name: tg.stop_name,

      from_trip_id: tg.trip_id,
      from_trip_headsign: tg.trip_headsign,
      from_schedule_relationship: tg.schedule_relationship,
      from_scheduled_arrival_time: tg.scheduled_arrival_time,
      from_observed_arrival_time: tg.observed_arrival_time,
      from_scheduled_arrival_time_str: secondsToString(tg.scheduled_arrival_time),
      from_observed_arrival_time_str: secondsToString(tg.observed_arrival_time),

      from_group_count: ((tg as any).length)
    }
    for (const dep of tg.transfers) {
      const depRow = Object.assign({}, baseRow, {
        to_agency_id: dep.agency_id,
        to_agency_name: dep.agency_name,
        to_route_id: dep.route.route_id,
        to_route_name: dep.route_name,
        to_stop_id: dep.stop_id,
        to_stop_name: dep.stop_name,

        to_trip_id: dep.trip_id,
        to_trip_headsign: dep.trip_headsign,
        to_schedule_relationship: dep.schedule_relationship,
        to_scheduled_departure_time: dep.scheduled_departure_time,
        to_observed_departure_time: dep.observed_departure_time,
        to_scheduled_departure_time_str: secondsToString(dep.scheduled_departure_time),
        to_observed_departure_time_str: secondsToString(dep.observed_departure_time),

        transfer_walking_time: dep.transfer_walking_time,
        scheduled_buffer_time: dep.scheduled_buffer_time,
        observed_buffer_time: dep.observed_buffer_time
      })
      rows.push(depRow)
    }
    if ((tg as any).length === 0) {
      rows.push(baseRow)
    }
  }
  return rows
}

function openMap (transfer: any, edges: any) {
  showTrip.value = transfer
  transferEdges.value = edges
  showMap.value = true
}

function openOverrideModal (fromStop: any, toStop: any, t: number) {
  overrideFromStop.value = fromStop
  overrideToStop.value = toStop
  overrideValue.value = Math.trunc(t)
  showOverrideModal.value = true
}

// These functions need access to scenario from slot props
// They will be called from template with scenario available in scope
function unsetTransferOverride (scenario: any, fromStop: any, toStop: any) {
  if (!scenario) return
  scenario.transferOverrides.unset(fromStop, toStop)
  const newQs = scenario.transferOverrides.getQueryString()
  navigateTo({ query: { ...route.query, transferOverrides: newQs } })
}

function saveTransferOverride (scenario: any, fromStop: any, toStop: any, time: number | null) {
  if (!scenario || time === null) return
  scenario.transferOverrides.set(fromStop, toStop, time)
  const newQs = scenario.transferOverrides.getQueryString()
  navigateTo({ query: { ...route.query, transferOverrides: newQs } })
  showOverrideModal.value = false
}

function tripDisplayClass (scenario: any, seconds: number) {
  const bp = scenario?.transferScoringBreakpoints
  if (!bp) return 'trip'
  if (seconds < bp[0]!) {
    return 'trip trip-missed'
  } else if (seconds < bp[1]!) {
    return 'trip trip-missed'
  } else if (seconds < bp[2]!) {
    return 'trip trip-close'
  } else if (seconds < bp[3]!) {
    return 'trip trip-acceptable'
  } else if (seconds <= bp[4]!) {
    return 'trip trip-unacceptable'
  } else {
    return 'trip trip-not-considered'
  }
}
</script>

<style scoped>
.incomingRow {
  background-color: var(--bulma-background);
  font-weight: bold;
}

.incomingRow td {
  border-bottom: solid 1px black;
}

.dotted-underline {
  border-bottom: 1px dotted;
}

.td-arrival {
  width: 140px;
  min-width: 140px;
}

.trip {
  font-size: 1.3em;
  font-weight: 600;
  text-align: center;
}
.trip-missed {
  background: var(--trip-missed) !important;
}
.trip-close {
  background: var(--trip-close) !important;
}
.trip-acceptable {
  background: var(--trip-acceptable) !important;
}
.trip-unacceptable {
  background: var(--trip-unacceptable) !important;
}
.trip-not-considered {
  background: var(--trip-not-considered) !important;
}

.tooltip {
  position: relative;
}

.tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
  line-height: 1.4;
  white-space: normal;
  width: max-content;
  max-width: 300px;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 1000;
}

.tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 2px;
  border: 6px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 1000;
}

.tooltip:hover::after,
.tooltip:hover::before {
  opacity: 1;
  visibility: visible;
}
</style>
