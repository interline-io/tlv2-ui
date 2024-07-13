import { NeedlemanWunsch } from './nw'

export interface Stop {
  id: number;
  stop_name: string;
  onestop_id: string;
}

export interface StopTimeEvent {
  scheduled: string;
  estimated: string;
}

export interface StopTime {
  departure: StopTimeEvent;
  timepoint: number;
  stop_sequence: number;
  stop: Stop;
}

export interface Trip {
  id: number;
  trip_headsign: string;
  stop_pattern_id: number;
  direction_id: number;
  stop_times: Array<StopTime>;
  timepoints: Array<StopTime>;
}

export interface StopPosition {
  id: number;
  visit: number;
  stop?: Stop;
  skipStops?: Array<string>;
}

export interface Route {
  id: number;
  trips: Array<Trip>;
}

export interface MergedPattern {
  title: string;
  timepointStops: Array<StopPosition>;
  trips: Array<Trip>;
}

export interface PluckedStopTime {
  sequence: number;
  st?: StopTime;
  sp: StopPosition;
}

export function pluckStopTimes(stopPositionPattern: Array<StopPosition>, sts: Array<StopTime>): Array<PluckedStopTime> {
  const ret = new Array<PluckedStopTime>()
  let j = 0
  for (let i = 0; i < stopPositionPattern.length; i++) {
    const sp = stopPositionPattern[i]
    let found = false
    if (sp.id > 0) {
      for (let jj = j; jj < sts.length; jj++) {
        const st = sts[jj]
        if (st.stop.id === sp.id) {
          ret.push({
            sequence: i,
            st,
            sp
          })
          j = j + 1
          found = true
          break
        }
      }
    }
    if (!found) {
      ret.push({
        sequence: i,
        sp
      })
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

function hasTimepoints(sts: Array<StopTime>): boolean {
  for (const st of sts) {
    if (st.timepoint > 0) {
      return true
    }
  }
  return false
}

export function timepointTables(trips: Array<Trip>): MergedPattern {
  // Filter out trips with no stop times
  const filteredTrips = trips.filter((t) => { return t.stop_times.length > 0 })

  // Check visits to all timepoints across all trips
  const seenAllPatterns = new Map<number, number>()
  for (const t of trips) {
    const seen = new Map<number, number>()
    const hastp = hasTimepoints(t.stop_times)
    for (const st of t.stop_times) {
      if (!st.timepoint && hastp) {
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
    for (const t of filteredTrips) {
      for (const st of t.stop_times) {
        // Only consider first visit to common stop
        if (st.stop.id === sortStop) {
          tripSortStop.set(t.id, parseHMS(st.departure.scheduled))
          break
        }
      }
    }
  }
  const sortedTrips = filteredTrips.sort((a, b) => {
    const at = tripSortStop.get(a.id) || firstStopDeparture(a.stop_times)
    const bt = tripSortStop.get(b.id) || firstStopDeparture(b.stop_times)
    return at - bt
  })

  // Convert stop patterns to StopPositions
  // This is so the alignment is not confused by multiple visits to the same stop
  const stopPositionPatterns = new Map<number, Array<StopPosition>>()
  const stopLookup = new Map<number, Stop>()
  for (const t of sortedTrips) {
    if (stopPositionPatterns.has(t.stop_pattern_id)) {
      continue
    }
    for (const st of t.stop_times) {
      stopLookup.set(st.stop.id, st.stop)
    }
    const stopPositionPattern = new Array<StopPosition>()
    const seen = new Map<number, number>()
    const hastp = hasTimepoints(t.stop_times)
    for (const st of t.stop_times) {
      if (!st.timepoint && hastp) {
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
  let mergedStops = new Array<string>()
  for (const stopPositionPattern of sortedPatterns) {
    // convert to `<id>:<visit>`
    const spString = stopPositionPattern.map((s) => { return s.id + ':' + s.visit })
    // console.log('pattern:', stopPositionPattern)
    // console.log('  spString:', spString)
    const alignment = NeedlemanWunsch(mergedStops, spString, { G: 2, P: 1, M: -100 })
    const alignA = alignment.a
    const alignB = alignment.b
    // console.log('  alignA:', alignA)
    // console.log('  alignB:', alignB)

    // TODO: Exclude stop pattern if there are no common stops??
    // const commonCount = 0
    // for (let i = 0; i < alignA.length; i++) {
    //   if (alignA[i] === alignB[i]) {
    //     commonCount += 1
    //   }
    // }
    // console.log('  common count:', commonCount)

    // Merge alignA and alignB together
    const mergedAlignment = Array<string>()
    for (let i = 0; i < alignA.length; i++) {
      const a = alignA[i]
      const b = alignB[i]
      if (a !== '-') {
        mergedAlignment.push(a)
      } else if (b !== '-') {
        mergedAlignment.push(b)
      }
    }
    // console.log('  mergedAlignment: ', mergedAlignment)
    mergedStops = mergedAlignment
  }
  // console.log('mergedStops:', mergedStops)

  // Convert `<id>:<visit>` back to StopPositions
  const mergedStopPositions = new Array<StopPosition>()
  for (const s of mergedStops) {
    const ss = s.split(':')
    const sid = Number(ss[0])
    const svisit = Number(ss[1])
    // console.log(ss, sid, svisit)
    mergedStopPositions.push({
      id: sid,
      visit: svisit,
      stop: stopLookup.get(sid)!
    })
  }

  // Sort headsigns by frequency
  const headsignCount = new Map<string, number>()
  for (const trip of sortedTrips) {
    const a = headsignCount.get(trip.trip_headsign) ?? 0
    headsignCount.set(trip.trip_headsign, a + 1)
  }
  const headsignUniqueKeys = [...headsignCount.keys()].sort((a, b) => {
    const at = headsignCount.get(a) ?? 0
    const bt = headsignCount.get(b) ?? 0
    return bt - at
  })
  const title = headsignUniqueKeys.join(', ')

  // OK
  return {
    title,
    timepointStops: mergedStopPositions,
    trips: sortedTrips
  }
}
