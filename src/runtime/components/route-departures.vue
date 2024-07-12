<template>
  <div>
    <div v-for="route of routes" :key="route.id">
      <div v-for="[k,mergedPattern] of Object.entries(directionTables(route.trips))" :key="k">
        <div class="title is-3">
          {{ $filters.capitalize(k) }}
        </div>
        <table class="table is-striped">
          <thead>
            <th v-for="sp of mergedPattern.timepointStops" :key="sp.id+sp.visit">
              <nuxt-link :to="{name:'stops-stopKey', params: {stopKey: sp.stop?.onestop_id}}">
                {{ sp.stop?.stop_name }}
              </nuxt-link>
            </th>
          </thead>
          <tbody>
            <tr v-for="trip of mergedPattern.trips" :key="trip.id">
              <td v-for="pst of pluckStopTimes(mergedPattern.timepointStops, trip.stop_times)" :key="pst.sequence">
                <span v-if="pst.st">
                  <template v-if="pst.st.departure.estimated">
                    {{ $filters.reformatHMS(pst.st.departure.estimated) }} &nbsp;<o-icon variant="success" size="small" icon="wifi" />
                  </template><template v-else>
                    {{ $filters.reformatHMS(pst.st.departure.scheduled) }} &nbsp;<o-icon variant="success" size="small" icon="blank" />
                  </template>
                </span>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { gql } from 'graphql-tag'
import { NeedlemanWunsch } from './nw'

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

interface Stop {
  id: number;
  stop_name: string;
  onestop_id: string;
}

interface StopTimeEvent {
  scheduled: string;
  estimated: string;
}

interface StopTime {
  departure: StopTimeEvent;
  timepoint: number;
  stop_sequence: number;
  stop: Stop;
}

interface PluckedStopTime {
  sequence: number;
  st?: StopTime;
}

interface Trip {
  id: number;
  stop_pattern_id: number;
  direction_id: number;
  stop_times: Array<StopTime>;
  timepoints: Array<StopTime>;
}

interface StopPosition {
  id: number;
  visit: number;
  stop?: Stop;
}

interface Route {
  id: number;
  trips: Array<Trip>;
}

interface MergedPattern {
  timepointStops: Array<StopPosition>;
  trips: Array<Trip>;
}

function pluckStopTimes(stopPositionPattern: Array<StopPosition>, sts: Array<StopTime>): Array<PluckedStopTime> {
  const ret = new Array<PluckedStopTime>()
  let j = 0
  for (let i = 0; i < stopPositionPattern.length; i++) {
    const sp = stopPositionPattern[i]
    let found = false
    for (let jj = j; jj < sts.length; jj++) {
      const st = sts[jj]
      if (st.stop.id === sp.id) {
        ret.push({
          sequence: i,
          st
        })
        j = j + 1
        found = true
        break
      }
    }
    if (!found) {
      ret.push({ sequence: i })
    }
  }
  return ret
}

function parseHMS(value: string): number {
  const a = (value || '').split(':').map((s) => {
    return parseInt(s)
  })
  if (a.length !== 3) {
    return 0
  }
  return a[0] * 3600 + a[1] * 60 + a[2]
}

function firstStopDeparture(sts: Array<StopTime>): number {
  if (sts.length === 0) {
    return 0
  }
  return parseHMS(sts[0].departure.scheduled)
}

function timepointTables(trips: Array<Trip>): MergedPattern {
  // Check visits to all timepoints across all trips
  const seenAllPatterns = new Map<number, number>()
  for (const t of trips) {
    const seen = new Map<number, number>()
    for (const st of t.stop_times) {
      if (!st.timepoint) {
        continue
      }
      // Only count first visit to this stop as a hit
      const visit = seen.get(st.stop.id) ?? 0
      if (visit === 0) {
        const allVisits = seenAllPatterns.get(st.stop.id) ?? 0
        seenAllPatterns.set(st.stop.id, allVisits + 1)
      }
      seen.set(st.stop.id, visit + 1)
    }
  }

  // Sort by departure from most common stop, falling back to first stop departure
  const tripSortStop = new Map<number, number>()
  const seenAllPatternsKeys = [...seenAllPatterns.entries()].sort((a, b) => b[1] - a[1])
  if (seenAllPatternsKeys.length > 0) {
    const sortStop = seenAllPatternsKeys[0][0]
    for (const t of trips) {
      for (const st of t.stop_times) {
        // Only consider first visit to common stop
        if (st.stop.id === sortStop) {
          tripSortStop.set(t.id, parseHMS(st.departure.scheduled))
          break
        }
      }
    }
  }
  const tripDir = trips.sort((a, b) => {
    const at = tripSortStop.get(a.id) || firstStopDeparture(a.stop_times)
    const bt = tripSortStop.get(b.id) || firstStopDeparture(b.stop_times)
    return at - bt
  })

  // Convert stop patterns to StopPositions
  // This is so the alignment is not confused by multiple visits to the same stop
  const stopPositionPatterns = new Map<number, Array<StopPosition>>()
  const stopLookup = new Map<number, Stop>()
  for (const t of tripDir) {
    if (stopPositionPatterns.has(t.stop_pattern_id)) {
      continue
    }
    for (const st of t.stop_times) {
      stopLookup.set(st.stop.id, st.stop)
    }
    const stopPositionPattern = new Array<StopPosition>()
    const seen = new Map<number, number>()
    for (const st of t.stop_times) {
      if (!st.timepoint) {
        continue
      }
      const visit = seen.get(st.stop.id) ?? 0
      stopPositionPattern.push({ id: st.stop.id, visit })
      seen.set(st.stop.id, visit + 1)
    }
    stopPositionPatterns.set(t.stop_pattern_id, stopPositionPattern)
  }

  // Sort patterns by length desc
  const sortedPatterns = Array.from(stopPositionPatterns.values())
  sortedPatterns.sort((a, b) => { return b.length - a.length })

  // Merge stop patterns using Needleman-Wunsch algorithm
  let commonCount = 0
  let mergedStops = new Array<string>()
  for (const stopPositionPattern of sortedPatterns) {
    // convert to `<id>:<visit>`
    const spString = stopPositionPattern.map((s) => { return s.id + ':' + s.visit })
    console.log('pattern:', stopPositionPattern)
    console.log('  spString:', spString)
    const alignment = NeedlemanWunsch(mergedStops, spString)
    const alignA = alignment.a
    const alignB = alignment.b
    console.log('  alignA:', alignA)
    console.log('  alignB:', alignB)

    // TODO: Exclude stop pattern if there are no common stops??
    for (let i = 0; i < alignA.length; i++) {
      if (alignA[i] === alignB[i]) {
        commonCount += 1
      }
    }
    console.log('  common count:', commonCount)

    // Merge alignA and alignB together
    const mergedAlignment = Array<string>()
    for (let i = 0; i < alignA.length; i++) {
      const a = alignA[i]
      const b = alignB[i]
      if (a === b) {
        commonCount += 1
      }
      if (a !== '-') {
        mergedAlignment.push(a)
      } else if (b !== '-') {
        mergedAlignment.push(b)
      }
    }
    console.log('  mergedAlignment: ', mergedAlignment)
    mergedStops = mergedAlignment
  }
  console.log('mergedStops:', mergedStops)

  // Convert `<id>:<visit>` back to StopPositions
  const mergedStopPositions = new Array<StopPosition>()
  for (const s of mergedStops) {
    const ss = s.split(':')
    const sid = Number(ss[0])
    const svisit = Number(ss[1])
    console.log(ss, sid, svisit)
    mergedStopPositions.push({
      id: sid,
      visit: svisit,
      stop: stopLookup.get(sid)!
    })
  }
  return {
    timepointStops: mergedStopPositions,
    trips: tripDir
  }
}

export default {
  props: {
    routeId: { type: Number, default: 0 }
  },
  data () {
    return { routes: new Array<Route>() }
  },
  apollo: {
    routes: {
      query: q,
      variables () {
        return {
          ids: [this.routeId],
          service_date: '2024-07-11'
        }
      }
    }
  },
  methods: {
    pluckStopTimes,
    directionTables(trips: Array<Trip>): {inbound: MergedPattern, outbound: MergedPattern} {
      const inbound = timepointTables(trips.filter((t) => { return t.direction_id === 0 }))
      const outbound = timepointTables(trips.filter((t) => { return t.direction_id === 1 }))
      return {
        inbound,
        outbound
      }
    }
  }

}
</script>
