/**
 * Statistics about departure times within a time window
 */
export interface DepartureStats {
  first_departure_time: number
  last_departure_time: number
  headway_min: number
  headway_max: number
  headway_average: number
  headway_median: number
  headway_count: number
  departure_count: number
  departures: number[]
}

/**
 * Calculate departure statistics for a set of departure times within a time window
 * @param departureTimes - Array of departure times in seconds
 * @param startTime - Start of time window in seconds
 * @param endTime - End of time window in seconds
 * @returns Statistics about departures and headways
 */
export function departureStats (
  departureTimes: number[],
  startTime: number,
  endTime: number
): DepartureStats {
  const d = departureTimes.sort()
  const dfilt = departureTimes.filter((s) => {
    return s >= startTime && s < endTime
  })
  const hws: number[] = []
  let hwavg = 0.0
  for (let i = 0; i < d.length - 1; i++) {
    const current = d[i]
    const next = d[i + 1]
    if (current === undefined || next === undefined) continue
    const hw = next - current
    if (
      current >= startTime
      && current < endTime
      && hw >= 30
    ) {
      hws.push(hw)
      hwavg = hwavg + hw
    }
  }
  if (hws.length > 0) {
    hwavg = hwavg / hws.length
  }
  const hwmid = median(hws)
  return {
    first_departure_time: Math.min(...dfilt),
    last_departure_time: Math.max(...dfilt),
    headway_min: Math.min(...hws),
    headway_max: Math.max(...hws),
    headway_average: hwavg,
    headway_median: hwmid,
    headway_count: hws.length,
    departure_count: dfilt.length,
    departures: dfilt
  }
}

/**
 * Calculate the median of an array of numbers
 */
const median = (arr: number[]): number => {
  if (arr.length === 0) return 0
  const mid = Math.floor(arr.length / 2)
  const nums = [...arr].sort((a, b) => a - b)
  const midVal = nums[mid]
  const prevMidVal = nums[mid - 1]
  if (midVal === undefined) return 0
  return arr.length % 2 !== 0 ? midVal : ((prevMidVal ?? 0) + midVal) / 2
}
