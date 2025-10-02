<template>
  <div>
    <div v-if="hws.found">
      <div class="table-container">
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Headways</th>
              <th v-if="showMorning">
                <span class="centered">7-9am</span>
              </th>
              <th v-if="showMidday">
                <span class="centered">9am-4pm</span>
              </th>
              <th v-if="showAfternoon">
                <span class="centered">4-6pm</span>
              </th>
              <th v-if="showNight">
                <span class="centered">6pm-7am</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Weekday
              </td>
              <td v-if="showMorning">
                {{ formatHeadway(hws.weekday, 'morning') }}
              </td>
              <td v-if="showMidday">
                {{ formatHeadway(hws.weekday, 'midday') }}
              </td>
              <td v-if="showAfternoon">
                {{ formatHeadway(hws.weekday, 'afternoon') }}
              </td>
              <td v-if="showNight">
                {{ formatHeadway(hws.weekday, 'night') }}
              </td>
            </tr>
            <tr>
              <td>
                Saturday
              </td>
              <td v-if="showMorning">
                {{ formatHeadway(hws.saturday, 'morning') }}
              </td>
              <td v-if="showMidday">
                {{ formatHeadway(hws.saturday, 'midday') }}
              </td>
              <td v-if="showAfternoon">
                {{ formatHeadway(hws.saturday, 'afternoon') }}
              </td>
              <td v-if="showNight">
                {{ formatHeadway(hws.saturday, 'night') }}
              </td>
            </tr>
            <tr>
              <td>
                Sunday
              </td>
              <td v-if="showMorning">
                {{ formatHeadway(hws.sunday, 'morning') }}
              </td>
              <td v-if="showMidday">
                {{ formatHeadway(hws.sunday, 'midday') }}
              </td>
              <td v-if="showAfternoon">
                {{ formatHeadway(hws.sunday, 'afternoon') }}
              </td>
              <td v-if="showNight">
                {{ formatHeadway(hws.sunday, 'night') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      No headways information available.
    </div>
  </div>
</template>

<script>
import { parseHMS, median, formatDuration } from '../lib/filters'

function departureFilter (values, vmin, vmax) {
  const ret = []
  for (let i = 0; i < values.length - 1; i++) {
    const a = values[i]
    const b = values[i + 1]
    const diff = (b - a)
    if (a >= vmin && diff > 30) {
      ret.push(diff)
    }
    if (b > vmax) {
      break
    }
  }
  return ret
}

export function formatHeadway (hw, tod) {
  if (!hw) {
    return ''
  }
  const deps = hw[tod] || []
  if (deps.length === 0) {
    return ''
  } else if (deps.length < 3) {
    return `${deps.length + 1} trips`
  }
  const amin = Math.min(...deps)
  const amax = Math.max(...deps)
  const amid = median(deps)
  if (amin && amax) {
    const diff = Math.abs(amax - amin)
    if (diff > 2 * 3600) {
      return 'varies'
    } else if (diff > 10 * 60) {
      return `${formatDuration(amin)} - ${formatDuration(amax)}`
    }
  }
  if (amid) {
    return formatDuration(amid)
  }
  return ''
}

export default {
  props: {
    headways: { type: Array, default () { return [] } },
    showMorning: { type: Boolean, default: true },
    showMidday: { type: Boolean, default: true },
    showAfternoon: { type: Boolean, default: true },
    showNight: { type: Boolean, default: true }
  },
  computed: {
    hws () {
      const hwlookup = {
        1: 'weekday',
        6: 'saturday',
        7: 'sunday'
      }
      const ret = { weekday: {}, saturday: {}, sunday: {}, found: false }
      // sort by direction_id desc, so direction_id = 0 will be preferred
      const headwaysSorted = (this.headways || []).slice(0).sort((a, b) => { return b.direction_id - a.direction_id })
      for (const headway of headwaysSorted) {
        const deps = (headway.departures || []).map((s) => { return parseHMS(s) })
        if (deps.length > 1) {
          ret.found = true
        }
        const hwMorning = departureFilter(deps, 7 * 3600, 9 * 3600)
        hwMorning.sort()
        const hwMidday = departureFilter(deps, 9 * 3600, 16 * 3600)
        hwMidday.sort()
        const hwAfternoon = departureFilter(deps, 16 * 3600, 18 * 3600)
        hwAfternoon.sort()
        let hwNight = departureFilter(deps, 0, 7 * 3600)
        hwNight = hwNight.concat(departureFilter(deps, 18 * 3600, 100 * 3600))
        hwNight.sort()
        const hw = {
          morning: hwMorning,
          midday: hwMidday,
          afternoon: hwAfternoon,
          night: hwNight
        }
        ret[hwlookup[headway.dow_category]] = hw
      }
      return ret
    }
  },
  methods: {
    formatHeadway,
    parseHMS
  }
}
</script>
