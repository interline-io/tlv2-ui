<template>
  <div>
    <table class="table is-striped">
      <thead>
        <th
          v-for="sp of timepointStops"
          :key="sp.id + sp.visit"
          class="tl-stop-column"
        >
          <nuxt-link v-if="sp.stop" :to="{ name: 'stops-stopKey', params: { stopKey: sp.stop?.onestop_id } }">
            {{ sp.stop?.stop_name }}
          </nuxt-link>
          <div v-else class="skipstop-header">
            ← … →<br>
            {{ sp.skipStops?.length }} time points
          </div>
        </th>
      </thead>
      <tbody>
        <tr
          v-for="row of rows"
          :key="row.trip.id"
        >
          <td
            v-for="pst of row.psts"
            :key="pst.sequence"
          >
            <div v-if="pst.sp?.skipStops?.length ?? 0 > 0" class="skipstop-row">
              …
            </div>
            <div v-else-if="pst.st && pst.st.departure.estimated && showRt" :title="'trip: '+row.trip.trip_id">
              {{ $filters.reformatHM(pst.st.departure.estimated) }} &nbsp;<o-icon
                variant="success"
                size="small"
                icon="wifi"
                :title="'scheduled: '+pst.st.departure.scheduled"
              />
            </div><div v-else-if="pst.st" :title="row.trip.trip_id">
              {{ $filters.reformatHM(pst.st.departure.scheduled) }}
            </div>
            <div v-else>
              -
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import {
  pluckStopTimes,
  MergedPattern
} from './route-departures'

export default {
  props: {
    timepointLimit: {
      type: Number,
      default: 100
    },
    showRt: { type: Boolean, default: false },
    mergedPattern: {
      type:
        Object as PropType<MergedPattern>,
      default () { return null }
    }
  },
  computed: {
    timepointStops() {
      const tps = this.mergedPattern.timepointStops
      if (tps.length > this.timepointLimit) {
        const limitTps = []
        const split = Math.floor(this.timepointLimit / 2.0)
        console.log('tp length:', tps.length, 'limit:', this.timepointLimit, 'split:', split)
        for (let i = 0; i < split; i++) {
          limitTps.push(tps[i])
        }
        const skipStops = new Array<string>()
        for (let i = split; i < (tps.length - split); i++) {
          skipStops.push(tps[i]?.stop?.stop_name ?? '')
        }
        limitTps.push({
          id: 0,
          visit: split,
          skipStops
        })
        for (let i = tps.length - split; i < tps.length; i++) {
          limitTps.push(tps[i])
        }
        return limitTps
      }

      return tps
    },
    rows() {
      const rows = []
      for (const trip of this.mergedPattern.trips) {
        const psts = pluckStopTimes(this.timepointStops, trip.stop_times)
        rows.push({ trip, psts })
      }
      return rows
    }
  },
  methods: {
    pluckStopTimes
  }
}
</script>

<style>
.tl-stop-column {
    min-width: 120px;
}
.skipstop-header {
  text-align:center;
}
.skipstop-row {
  text-align:center;
}
</style>
