<template>
  <div v-if="station">
    <tl-apps-stations-station-mode-tabs
      :station="station"
      :feed-key="feedKey"
      :feed-version-key="feedVersionKey"
      :station-key="stationKey"
      :stop-associations-enabled="stopAssociationsEnabled"
    />

    <div v-if="ready" class="simulator-layout">
      <!-- Controls column -->
      <div class="simulator-controls">
        <nav class="panel station-editor-panel">
          <p class="panel-heading">
            Route
          </p>
          <div class="panel-block is-block">
            <div class="field">
              <label class="label is-small">Starting point</label>
              <div class="select is-fullwidth is-small">
                <select v-model="fromStopId">
                  <option :value="null">
                    Select starting point...
                  </option>
                  <optgroup v-if="entrances.length > 0" label="Entrances / Exits">
                    <option v-for="s in entrances" :key="s.id" :value="s.id">
                      {{ s.stop_name || s.stop_id }}
                    </option>
                  </optgroup>
                  <optgroup v-if="routeOptions.length > 0" label="Routes">
                    <option v-for="opt in routeOptions" :key="`route-from-${opt.value}`" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </optgroup>
                  <optgroup v-if="unroutedPlatforms.length > 0" label="Other Platforms">
                    <option v-for="s in unroutedPlatforms" :key="s.id" :value="s.id">
                      {{ s.stop_name || s.stop_id }}
                    </option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div class="field">
              <label class="label is-small">Destination</label>
              <div class="select is-fullwidth is-small">
                <select v-model="toStopId">
                  <option :value="null">
                    Select destination...
                  </option>
                  <optgroup v-if="entrances.length > 0" label="Entrances / Exits">
                    <option v-for="s in entrances" :key="s.id" :value="s.id">
                      {{ s.stop_name || s.stop_id }}
                    </option>
                  </optgroup>
                  <optgroup v-if="routeOptions.length > 0" label="Routes">
                    <option v-for="opt in routeOptions" :key="`route-to-${opt.value}`" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </optgroup>
                  <optgroup v-if="unroutedPlatforms.length > 0" label="Other Platforms">
                    <option v-for="s in unroutedPlatforms" :key="s.id" :value="s.id">
                      {{ s.stop_name || s.stop_id }}
                    </option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div class="field">
              <label class="label is-small">Routing profile</label>
              <div class="select is-fullwidth is-small">
                <select v-model="selectedProfile">
                  <option v-for="name in profileNames" :key="name" :value="name">
                    {{ name }}
                  </option>
                </select>
              </div>
            </div>

            <div v-if="sameEndpoints" class="notification is-warning is-light mt-3 p-3">
              <p class="is-size-7">
                Starting point and destination can't be the same. Pick two different locations.
              </p>
            </div>
            <div v-else-if="fromStopId && toStopId && steps.length === 0" class="notification is-warning is-light mt-3 p-3">
              <p class="is-size-7">
                No route found between these stops with the selected profile.
              </p>
            </div>
          </div>
        </nav>

        <nav v-if="steps.length > 0" class="panel station-editor-panel">
          <p class="panel-heading">
            User Interface
          </p>
          <div class="panel-block is-block">
            <div class="buttons has-addons is-fullwidth">
              <button
                class="button is-small view-mode-btn"
                :class="displayMode === 'paged' ? 'is-primary' : 'is-light'"
                title="Turn-by-turn pages"
                @click="displayMode = 'paged'"
              >
                <span class="icon">
                  <i class="mdi mdi-view-carousel" />
                </span>
                <span>Turn-by-turn pages</span>
              </button>
              <button
                class="button is-small view-mode-btn"
                :class="displayMode === 'scroll' ? 'is-primary' : 'is-light'"
                title="Single itinerary"
                @click="displayMode = 'scroll'"
              >
                <span class="icon">
                  <i class="mdi mdi-timeline-text" />
                </span>
                <span>Scrolling itinerary</span>
              </button>
            </div>
          </div>
        </nav>

        <nav v-if="steps.length > 0" class="panel station-editor-panel">
          <p class="panel-heading">
            Summary
          </p>
          <div class="panel-block is-block is-size-7">
            <p><strong>{{ steps.length }}</strong> step{{ steps.length !== 1 ? 's' : '' }}</p>
            <p v-if="totalTimeStr">
              Estimated: <strong>{{ totalTimeStr }}</strong>
            </p>
            <div class="buttons is-flex-direction-column mt-3" style="gap: 0.4rem;">
              <tl-link
                route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways"
                :to="{
                  params: { feedKey, feedVersionKey, stationKey },
                  query: { selectedStop: String(fromStopId) },
                }"
                class="button is-small is-fullwidth is-outlined is-primary"
              >
                View route in Draw Pathways
              </tl-link>
              <tl-link
                v-if="currentPathwayId"
                route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-pathways"
                :to="{
                  params: { feedKey, feedVersionKey, stationKey },
                  query: { selectedPathway: String(currentPathwayId) },
                }"
                class="button is-small is-fullwidth is-outlined is-primary"
              >
                Edit step {{ currentStepIndex + 1 }} pathway
              </tl-link>
            </div>
          </div>
        </nav>
      </div>

      <!-- Phone frame column -->
      <div class="simulator-phone-area">
        <div class="phone-frame">
          <div class="phone-top-bar">
            <div class="phone-notch-pill" />
          </div>

          <div class="phone-screen">
            <div class="phone-status-bar">
              <span>9:41</span>
              <span class="phone-status-icons">▲ ● ●</span>
            </div>

            <!-- Empty: no stops selected -->
            <div v-if="!fromStopId || !toStopId" class="phone-empty-state">
              <div class="phone-empty-icon">
                ⬡
              </div>
              <p class="phone-empty-text">
                Select a starting point and destination to see step-by-step wayfinding instructions.
              </p>
            </div>

            <!-- Same endpoint selected -->
            <div v-else-if="sameEndpoints" class="phone-empty-state phone-no-route">
              <div class="phone-empty-icon">
                ↺
              </div>
              <p class="phone-empty-text">
                You're already there! Pick a different starting point or destination.
              </p>
            </div>

            <!-- Empty: no route found -->
            <div v-else-if="steps.length === 0" class="phone-empty-state phone-no-route">
              <div class="phone-empty-icon">
                ✕
              </div>
              <p class="phone-empty-text">
                No route found between the selected stops.
              </p>
            </div>

            <!-- Route display -->
            <div v-else class="phone-content">
              <div class="phone-app-bar">
                <span class="phone-app-title">Wayfinding</span>
                <span class="phone-app-subtitle">{{ stationName }}</span>
              </div>

              <div class="phone-route-summary">
                <span class="phone-route-endpoint">{{ fromStop?.stop_name || 'Start' }}</span>
                <span class="phone-route-arrow">→</span>
                <span class="phone-route-endpoint">{{ toStop?.stop_name || 'End' }}</span>
              </div>

              <!-- Paged: step-by-step with back/next navigation -->
              <template v-if="displayMode === 'paged'">
                <div class="phone-progress-track">
                  <div class="phone-progress-fill" :style="{ width: `${progressPercent}%` }" />
                </div>

                <div class="phone-step-display">
                  <p class="phone-step-counter">
                    Step {{ currentStepIndex + 1 }} of {{ steps.length }}
                  </p>

                  <!-- Entry map: geographic overview when starting from an entrance -->
                  <template v-if="currentStep.mapStep === 'entry' && entryMapCoords">
                    <tl-apps-stations-station-simulator-map
                      :door-coords="entryMapCoords.door"
                      :other-coords="entryMapCoords.other"
                      type="entry"
                    />
                    <p class="phone-step-instruction">
                      {{ currentStep.instruction }}
                    </p>
                  </template>

                  <!-- Exit map: geographic overview when arriving at an exit -->
                  <template v-else-if="currentStep.mapStep === 'exit' && exitMapCoords">
                    <tl-apps-stations-station-simulator-map
                      :door-coords="exitMapCoords.door"
                      :other-coords="exitMapCoords.other"
                      type="exit"
                    />
                    <p class="phone-step-instruction">
                      {{ currentStep.instruction }}
                    </p>
                  </template>

                  <!-- Normal step display -->
                  <template v-else>
                    <!-- Sign board: shown prominently when signposted_as is set -->
                    <div v-if="currentStep.signposted" class="phone-signage">
                      <span class="phone-signage-label">Follow signs for</span>
                      <div class="phone-signage-board">
                        → {{ currentStep.signposted }}
                      </div>
                    </div>

                    <div class="phone-step-icon-area">
                      <img
                        v-if="currentStep.iconUrl"
                        :src="currentStep.iconUrl"
                        :alt="currentStep.iconLabel"
                        class="phone-step-icon-img"
                      >
                      <i v-else-if="currentStep.mdiIcon" :class="`mdi mdi-${currentStep.mdiIcon} phone-step-icon-mdi`" />
                      <span v-else class="phone-step-icon-fallback">→</span>
                    </div>

                    <p class="phone-step-instruction">
                      {{ currentStep.instruction }}
                    </p>
                    <p v-if="currentStep.detail" class="phone-step-detail">
                      {{ currentStep.detail }}
                    </p>
                    <p v-if="currentStep.timeStr" class="phone-step-time">
                      {{ currentStep.timeStr }}
                    </p>
                  </template>
                </div>

                <div class="phone-nav-bar">
                  <button
                    class="phone-nav-btn"
                    :disabled="currentStepIndex === 0"
                    @click="currentStepIndex--"
                  >
                    ← Back
                  </button>
                  <button
                    v-if="currentStepIndex < steps.length - 1"
                    class="phone-nav-btn phone-nav-next"
                    @click="currentStepIndex++"
                  >
                    Next →
                  </button>
                  <span v-else class="phone-arrived">
                    You have arrived ✓
                  </span>
                </div>
              </template>

              <!-- Scroll: full itinerary as a scrollable timeline -->
              <div v-else class="phone-scroll-view">
                <div
                  v-for="(step, i) in steps"
                  :key="i"
                  class="scroll-step"
                >
                  <div class="scroll-step-marker">
                    <div class="scroll-step-dot">
                      {{ i + 1 }}
                    </div>
                    <div v-if="i < steps.length - 1" class="scroll-step-line" />
                  </div>
                  <div class="scroll-step-body">
                    <!-- Entry map -->
                    <template v-if="step.mapStep === 'entry' && entryMapCoords">
                      <tl-apps-stations-station-simulator-map
                        :door-coords="entryMapCoords.door"
                        :other-coords="entryMapCoords.other"
                        type="entry"
                      />
                      <p class="scroll-instruction">
                        {{ step.instruction }}
                      </p>
                    </template>
                    <!-- Exit map -->
                    <template v-else-if="step.mapStep === 'exit' && exitMapCoords">
                      <tl-apps-stations-station-simulator-map
                        :door-coords="exitMapCoords.door"
                        :other-coords="exitMapCoords.other"
                        type="exit"
                      />
                      <p class="scroll-instruction">
                        {{ step.instruction }}
                      </p>
                    </template>
                    <!-- Normal step -->
                    <template v-else>
                      <div v-if="step.signposted" class="scroll-signage">
                        → {{ step.signposted }}
                      </div>
                      <div class="scroll-row">
                        <img
                          v-if="step.iconUrl"
                          :src="step.iconUrl"
                          :alt="step.iconLabel"
                          class="scroll-icon"
                        >
                        <i v-else-if="step.mdiIcon" :class="`mdi mdi-${step.mdiIcon} scroll-icon-mdi`" />
                        <div>
                          <p class="scroll-instruction">
                            {{ step.instruction }}
                          </p>
                          <p v-if="step.detail" class="scroll-detail">
                            {{ step.detail }}
                          </p>
                        </div>
                      </div>
                      <p v-if="step.timeStr" class="scroll-time">
                        {{ step.timeStr }}
                      </p>
                    </template>
                  </div>
                </div>

                <!-- Arrived indicator -->
                <div class="scroll-step">
                  <div class="scroll-step-marker">
                    <div class="scroll-step-dot scroll-arrived-dot">
                      ✓
                    </div>
                  </div>
                  <div class="scroll-step-body scroll-arrived-label">
                    You have arrived
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="phone-bottom-bar">
            <div class="phone-home-indicator" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRefs } from 'vue'
import { useHead } from '#imports'
import type { Stop, Station } from '../station'
import { Pathway } from '../station'
import { Profiles } from '../../../lib/pathways/graph'
import { PathwayModeIcons } from '../../../lib/pathways/pathway-icons'
import { useStation } from '../composables/useStation'
import { getBasicRouteType } from '../../../lib/gtfs/routetypes'

const ROUTE_TYPE_MDI: Record<number, string> = {
  0: 'tram', 1: 'subway', 2: 'train', 3: 'bus', 4: 'ferry',
  5: 'tram', 6: 'gondola', 7: 'tram', 11: 'tram', 12: 'train'
}

function routeTypeMdiIcon (routeType: number | undefined): string {
  if (routeType == null) { return '' }
  const { routeType: rt, parentType } = getBasicRouteType(routeType)
  const code = parentType ? parentType.code : rt.code
  return ROUTE_TYPE_MDI[code] ?? ''
}

interface Props {
  feedKey: string
  feedVersionKey: string
  stationKey: string
  clientId?: string
}

const props = defineProps<Props>()
const { feedKey, feedVersionKey, stationKey, clientId } = toRefs(props)

const {
  ready,
  station,
  stationName,
  stopAssociationsEnabled
} = useStation({ feedKey, feedVersionKey, stationKey, clientId: clientId?.value })

useHead(computed(() => ({
  title: station.value?.stop?.stop_name ? `${station.value.stop.stop_name} — Simulator` : 'Simulator'
})))

const fromStopId = ref<number | null>(null)
const toStopId = ref<number | null>(null)
const selectedProfile = ref('Pathways: Default')
const currentStepIndex = ref(0)
const displayMode = ref<'paged' | 'scroll'>('paged')

const profileNames = Object.keys(Profiles)

const entrances = computed(() =>
  (station.value?.stops ?? []).filter(s => s.location_type === 2)
)

const platforms = computed(() =>
  (station.value?.stops ?? []).filter(s => s.location_type === 0)
)

// Each option in the route selector: a route label that resolves to a specific platform stop ID.
// If a route serves multiple platforms (e.g. two tracks), each gets its own option with a
// platform disambiguator derived from platform_code or stop_name.
interface RouteOption {
  value: number // platform stop ID used for A* routing
  label: string // display label shown in the dropdown
}

// Collect route_stops from a stop AND its boarding area children (type=4).
// Some feeds attach route_stops to boarding areas rather than their parent platform.
// Accepts an explicit station ref to allow reuse outside of computed context.
function platformRouteStops (platform: Stop, s?: Station | null): Stop['route_stops'] {
  const stationRef = s !== undefined ? s : station.value
  const all = [...(platform.route_stops ?? [])]
  for (const child of platform.children ?? []) {
    if (child.location_type === 4 && child.id) {
      const childStop = stationRef?.getStop(child.id)
      if (childStop) { all.push(...(childStop.route_stops ?? [])) }
    }
  }
  return all
}

const routeOptions = computed((): RouteOption[] => {
  // Build map of routeId → { route metadata, platforms[] }
  type RouteEntry = { route: NonNullable<Stop['route_stops'][0]['route']>, platforms: Stop[] }
  const byRoute = new Map<number, RouteEntry>()
  for (const platform of platforms.value) {
    for (const rs of platformRouteStops(platform)) {
      if (!rs.route?.id) { continue }
      const entry = byRoute.get(rs.route.id)
      if (entry) {
        if (!entry.platforms.some(p => p.id === platform.id)) { entry.platforms.push(platform) }
      } else {
        byRoute.set(rs.route.id, { route: rs.route, platforms: [platform] })
      }
    }
  }

  const options: RouteOption[] = []
  for (const { route, platforms: rPlatforms } of byRoute.values()) {
    const routeName = route.route_short_name || route.route_long_name || `Route ${route.id}`
    const prefix = route.agency?.agency_name ? `${route.agency.agency_name}: ` : ''
    if (rPlatforms.length === 1) {
      options.push({ value: rPlatforms[0]!.id!, label: `${prefix}${routeName}` })
    } else {
      // Multiple platforms serve this route — disambiguate with platform_code or stop_name
      for (const p of rPlatforms) {
        const disambig = p.platform_code ? `Track ${p.platform_code}` : (p.stop_name || `Platform ${p.id}`)
        options.push({ value: p.id!, label: `${prefix}${routeName} – ${disambig}` })
      }
    }
  }
  return options.sort((a, b) => a.label.localeCompare(b.label))
})

const unroutedPlatforms = computed(() =>
  platforms.value.filter(p => platformRouteStops(p).length === 0)
)

const fromStop = computed(() =>
  fromStopId.value && station.value ? station.value.getStop(fromStopId.value) : null
)

const toStop = computed(() =>
  toStopId.value && station.value ? station.value.getStop(toStopId.value) : null
)

const pathwayIndex = computed((): Record<number, Pathway> => {
  const idx: Record<number, Pathway> = {}
  for (const pw of station.value?.pathways ?? []) {
    if (pw.id) {
      idx[pw.id] = pw
    }
  }
  return idx
})

interface SimStep {
  instruction: string
  detail: string
  signposted: string
  timeStr: string
  iconUrl: string
  iconLabel: string
  mdiIcon?: string
  pathwayId: number | undefined
  mapStep?: 'entry' | 'exit'
}

// ── Mini-map coordinate helpers ───────────────────────────────────────────────

interface MapCoords {
  door: [number, number]
  other: [number, number]
}

const entryMapCoords = computed((): MapCoords | null => {
  if (fromStop.value?.location_type !== 2) { return null }
  const doorC = fromStop.value.geometry?.coordinates
  const otherC = toStop.value?.geometry?.coordinates
  if (!doorC || !otherC) { return null }
  return { door: [doorC[0]!, doorC[1]!], other: [otherC[0]!, otherC[1]!] }
})

const exitMapCoords = computed((): MapCoords | null => {
  if (toStop.value?.location_type !== 2) { return null }
  const doorC = toStop.value.geometry?.coordinates
  const otherC = fromStop.value?.geometry?.coordinates
  if (!doorC || !otherC) { return null }
  return { door: [doorC[0]!, doorC[1]!], other: [otherC[0]!, otherC[1]!] }
})

// Build a boarding or alighting SimStep for a routed platform stop, or null if not applicable.
function boardingStep (stop: Stop, s: Station | null, action: 'board' | 'alight'): SimStep | null {
  if (stop.location_type !== 0 && stop.location_type !== 4) { return null }
  const routeStops = platformRouteStops(stop, s)
  if (routeStops.length === 0) { return null }
  const routeType = routeStops[0]?.route?.route_type
  const names = [...new Set(
    routeStops
      .map(rs => rs.route?.route_short_name || rs.route?.route_long_name)
      .filter((n): n is string => !!n)
  )].join(', ')
  const instruction = action === 'board'
    ? (names ? `Board ${names}` : 'Board')
    : (names ? `Alight from ${names}` : 'Alight')
  return { instruction, detail: '', signposted: '', timeStr: '', iconUrl: '', iconLabel: '', mdiIcon: routeTypeMdiIcon(routeType), pathwayId: undefined }
}

function makeIconUrl (mode: number): { url: string, label: string } {
  const m = PathwayModeIcons[mode]
  if (!m) { return { url: '', label: '' } }
  return { url: `/icons/${m.altIcon ?? m.icon}.png`, label: m.label }
}

function generateStep (pw: Pathway, fromId: number, cost: number): SimStep {
  const mode = pw.pathway_mode ?? 1
  const reversed = pw.from_stop.id !== fromId
  const from = reversed ? pw.to_stop : pw.from_stop
  const to = reversed ? pw.from_stop : pw.to_stop
  const signposted = reversed ? pw.reverse_signposted_as : pw.signposted_as

  const fromLevel = from.level.level_index
  const toLevel = to.level.level_index
  const levelChange = fromLevel != null && toLevel != null && fromLevel !== toLevel
  const goingUp = levelChange && toLevel! > fromLevel!

  // Only show destination name for named, non-generic stops
  const toName = to.stop_name && to.location_type !== 3 ? to.stop_name : null

  let instruction = ''
  let detail = ''

  switch (mode) {
    case 1: // Walkway
      instruction = toName ? `Walk to ${toName}` : 'Walk forward'
      break
    case 2: // Stairs
      instruction = levelChange
        ? (goingUp ? 'Take the stairs up' : 'Take the stairs down')
        : 'Take the stairs'
      if (toLevel != null) { detail = `Level ${toLevel}` }
      break
    case 3: // Moving sidewalk
      instruction = 'Take the moving walkway'
      break
    case 4: // Escalator
      instruction = levelChange
        ? (goingUp ? 'Take the escalator up' : 'Take the escalator down')
        : 'Take the escalator'
      if (toLevel != null) { detail = `Level ${toLevel}` }
      break
    case 5: // Elevator
      instruction = 'Take the elevator'
      if (toLevel != null) { detail = `Level ${toLevel}` }
      break
    case 6: // Fare gate
      instruction = 'Pass through the fare gate'
      break
    case 7: // Exit gate
      instruction = 'Pass through the exit gate'
      break
    default:
      instruction = 'Continue'
  }

  const icon = makeIconUrl(mode)
  return {
    instruction,
    detail,
    signposted: signposted ?? '',
    timeStr: cost > 0 ? `~${Math.round(cost)}s` : '',
    iconUrl: icon.url,
    iconLabel: icon.label,
    pathwayId: pw.id
  }
}

const sameEndpoints = computed(() =>
  fromStopId.value !== null && fromStopId.value === toStopId.value
)

const routeResult = computed(() => {
  const s = station.value
  if (!fromStopId.value || !toStopId.value || !s) { return null }
  if (sameEndpoints.value) { return null }
  const profile = Profiles[selectedProfile.value]
  if (!profile) { return null }
  return s.findRoute(fromStopId.value, toStopId.value, profile)
})

const steps = computed((): SimStep[] => {
  const result = routeResult.value
  const s = station.value
  if (!result || result.path.length === 0 || !s) { return [] }

  const stepsArr: SimStep[] = []
  const idx = pathwayIndex.value

  // Entry map: shown first when starting from an entrance/exit
  if (fromStop.value?.location_type === 2 && entryMapCoords.value) {
    const name = fromStop.value.stop_name
    stepsArr.push({
      instruction: name ? `Enter at ${name}` : 'Enter the station',
      detail: '', signposted: '', timeStr: '', iconUrl: '', iconLabel: '',
      pathwayId: undefined, mapStep: 'entry'
    })
  }

  // Alight step: if starting from a routed platform (user alighting a vehicle)
  if (fromStop.value) {
    const step = boardingStep(fromStop.value, s, 'alight')
    if (step) { stepsArr.push(step) }
  }

  for (const edge of result.edges ?? []) {
    if (edge.pathway_id) {
      const pw = idx[edge.pathway_id]
      if (pw && edge.from_stop_id) {
        stepsArr.push(generateStep(pw, edge.from_stop_id, edge.cost))
      }
    } else if (edge.from_stop_id && edge.to_stop_id) {
      // Implicit edge (e.g. boarding area → parent platform virtual edge)
      const fromStopObj = s.getStop(edge.from_stop_id)
      const toStopObj = s.getStop(edge.to_stop_id)
      if (fromStopObj && toStopObj) {
        // Skip the boarding area ↔ parent platform virtual edge — it's an internal
        // graph detail, not a meaningful wayfinding step for the user.
        const isBoardingAreaToParent
          = (fromStopObj.location_type === 4 && fromStopObj.parent?.id === toStopObj.id)
            || (toStopObj.location_type === 4 && toStopObj.parent?.id === fromStopObj.id)
        if (!isBoardingAreaToParent) {
          const pw = new Pathway({ pathway_mode: 1, is_bidirectional: 1, from_stop: fromStopObj, to_stop: toStopObj })
          stepsArr.push(generateStep(pw, edge.from_stop_id, edge.cost))
        }
      }
    }
  }

  // Board step: if destination is a routed platform
  if (toStop.value) {
    const step = boardingStep(toStop.value, s, 'board')
    if (step) { stepsArr.push(step) }
  }

  // Exit map: shown last when ending at an entrance/exit
  if (toStop.value?.location_type === 2 && exitMapCoords.value) {
    const name = toStop.value.stop_name
    stepsArr.push({
      instruction: name ? `Exit at ${name}` : 'Exit the station',
      detail: '', signposted: '', timeStr: '', iconUrl: '', iconLabel: '',
      pathwayId: undefined, mapStep: 'exit'
    })
  }

  return stepsArr
})

const currentStep = computed((): SimStep =>
  steps.value[currentStepIndex.value] ?? { instruction: '', detail: '', signposted: '', timeStr: '', iconUrl: '', iconLabel: '', pathwayId: undefined }
)

const progressPercent = computed((): number => {
  if (steps.value.length === 0) { return 0 }
  return ((currentStepIndex.value + 1) / steps.value.length) * 100
})

const totalTimeStr = computed((): string => {
  const totalCost = routeResult.value?.distance // A* cost in seconds (traversal_time)
  if (!totalCost) { return '' }
  const secs = Math.round(totalCost)
  const mins = Math.floor(secs / 60)
  const sec = secs % 60
  if (mins > 0) { return sec > 0 ? `${mins} min ${sec} sec` : `${mins} min` }
  return `${secs} sec`
})

const currentPathwayId = computed(() =>
  steps.value[currentStepIndex.value]?.pathwayId
)

watch([fromStopId, toStopId, selectedProfile], () => {
  currentStepIndex.value = 0
})

watch(displayMode, (newMode) => {
  if (newMode === 'paged') {
    currentStepIndex.value = 0
  }
})
</script>

<style scoped>
.simulator-layout {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 0;
  align-items: flex-start;
}

.simulator-controls {
  width: 280px;
  flex-shrink: 0;
}

.simulator-phone-area {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}

/* ── Phone frame ── */
.phone-frame {
  width: 340px;
  border: 3px solid #1a1a1a;
  border-radius: 36px;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
}

.phone-top-bar {
  height: 36px;
  background: #1a1a1a;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 0;
}

.phone-notch-pill {
  width: 84px;
  height: 22px;
  background: #1a1a1a;
  border-radius: 0 0 14px 14px;
}

.phone-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 560px;
  background: #f5f5f5;
}

.phone-status-bar {
  height: 24px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.6rem;
  font-weight: bold;
  background: white;
  color: #333;
}

.phone-status-icons {
  font-size: 0.5rem;
  letter-spacing: 2px;
}

.phone-bottom-bar {
  height: 30px;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #e8e8e8;
}

.phone-home-indicator {
  width: 110px;
  height: 5px;
  background: #1a1a1a;
  border-radius: 3px;
}

/* ── Empty states ── */
.phone-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  gap: 1rem;
}

.phone-empty-icon {
  font-size: 3rem;
  opacity: 0.3;
}

.phone-empty-text {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.5;
}

.phone-no-route .phone-empty-icon {
  opacity: 0.6;
}

/* ── Route content ── */
.phone-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.phone-app-bar {
  background: #1565c0;
  color: white;
  padding: 10px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.phone-app-title {
  font-size: 0.65rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.phone-app-subtitle {
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.phone-route-summary {
  background: #1e88e5;
  color: white;
  padding: 7px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
}

.phone-route-endpoint {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.phone-route-arrow {
  opacity: 0.7;
  flex-shrink: 0;
}

.phone-progress-track {
  height: 3px;
  background: #d0d0d0;
}

.phone-progress-fill {
  height: 100%;
  background: #1e88e5;
  transition: width 0.3s ease;
}

/* ── Sign board ── */
.phone-signage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  margin-bottom: 0.25rem;
}

.phone-signage-label {
  font-size: 0.62rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.phone-signage-board {
  background: #1a1a1a;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  padding: 6px 18px;
  border-radius: 4px;
  letter-spacing: 0.03em;
  max-width: 100%;
  text-align: center;
}

/* ── Step display ── */
.phone-step-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem 1rem 0.75rem;
  gap: 0.4rem;
  text-align: center;
  background: white;
}

.phone-step-counter {
  font-size: 0.68rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.phone-step-icon-area {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 72px;
  height: 72px;
  margin: 0.5rem 0;
  background: #f0f4ff;
  border-radius: 50%;
}

.phone-step-icon-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.phone-step-icon-fallback {
  font-size: 2rem;
  color: #1e88e5;
}

.phone-step-icon-mdi {
  font-size: 2.5rem;
  color: #1e88e5;
}

.phone-step-instruction {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  margin-top: 0.25rem;
}

.phone-step-detail {
  font-size: 0.9rem;
  color: #555;
  margin-top: 0.1rem;
}

.phone-step-time {
  font-size: 0.72rem;
  color: #888;
  background: #f0f0f0;
  padding: 2px 10px;
  border-radius: 10px;
  margin-top: 0.5rem;
}

/* ── Navigation ── */
.phone-nav-bar {
  padding: 0.6rem 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  border-top: 1px solid #e8e8e8;
  background: white;
}

.phone-nav-btn {
  flex: 1;
  padding: 8px 6px;
  border: 2px solid #1e88e5;
  border-radius: 8px;
  background: white;
  color: #1e88e5;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  appearance: none;
}

.phone-nav-btn:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}

.phone-nav-btn.phone-nav-next {
  background: #1e88e5;
  color: white;
}

.phone-nav-btn.phone-nav-next:disabled {
  background: #ccc;
  border-color: #ccc;
}

.phone-arrived {
  flex: 1;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 600;
  color: #2e7d32;
  padding: 8px;
  background: #e8f5e9;
  border-radius: 8px;
}

/* ── Sidebar view-mode buttons ── */
.view-mode-btn {
  flex: 1;
  justify-content: center;
}

/* ── Scroll / narrative view ── */
.phone-scroll-view {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 0.75rem 0.5rem;
}

.scroll-step {
  display: flex;
  gap: 0.6rem;
}

.scroll-step-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 24px;
}

.scroll-step-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #1e88e5;
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.scroll-arrived-dot {
  background: #2e7d32;
  font-size: 0.75rem;
}

.scroll-step-line {
  flex: 1;
  width: 2px;
  background: #d0d0d0;
  margin-top: 3px;
  min-height: 12px;
}

.scroll-step-body {
  flex: 1;
  min-width: 0;
  padding-bottom: 0.75rem;
}

.scroll-arrived-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #2e7d32;
  padding-top: 2px;
}

.scroll-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.15rem;
}

.scroll-icon {
  width: 26px;
  height: 26px;
  object-fit: contain;
  flex-shrink: 0;
  margin-top: 1px;
}

.scroll-icon-mdi {
  font-size: 1.2rem;
  color: #1e88e5;
  flex-shrink: 0;
  margin-top: 2px;
}

.scroll-instruction {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
}

.scroll-detail {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.1rem;
}

.scroll-time {
  font-size: 0.65rem;
  color: #999;
  margin-top: 0.2rem;
  background: #f0f0f0;
  display: inline-block;
  padding: 1px 7px;
  border-radius: 8px;
}

.scroll-signage {
  background: #1a1a1a;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 3px;
  margin-bottom: 0.3rem;
  display: inline-block;
  letter-spacing: 0.02em;
}
</style>
