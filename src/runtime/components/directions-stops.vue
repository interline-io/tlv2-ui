<template>
  <div>
    <table v-if="stops.length > 0" class="itin-departure-table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Stop</th>
          <th>Stop ID</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(stop,stopIdx) of stops.slice(0,1)" :key="stopIdx">
          <td>{{ formatDateTime(stop.departure) }}</td>
          <td>{{ stop.stop_name }}</td>
          <td>{{ stop.stop_id }}</td>
        </tr>
        <template v-if="expandStops">
          <tr v-for="(stop,stopIdx) of stops.slice(1,-1)" :key="stopIdx">
            <td>{{ formatDateTime(stop.departure) }}</td>
            <td>{{ stop.stop_name }}</td>
            <td>{{ stop.stop_id }}</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td />
            <td>
              <o-button size="small" @click="expandStops = !expandStops">
                ... {{ stops.length - 2 }} stops ...
              </o-button>
            </td>
            <td />
          </tr>
        </template>
        <tr v-for="(stop,stopIdx) of stops.slice(-1)" :key="stopIdx">
          <td>{{ formatDateTime(stop.departure) }}</td>
          <td>{{ stop.stop_name }}</td>
          <td>{{ stop.stop_id }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import { parseISO, format } from 'date-fns'
import { ref } from 'vue'

type Stop = {
  departure: string
  stop_name: string
  stop_id: string
}

const expandStops = ref(false)

const { stops } = defineProps({
  stops: { type: Array<Stop>, default () { return [] } }
})

function formatDateTime (value: string): string {
  return format(parseISO(value), 'h:mm aaa')
}
</script>

<style scoped>
.itin-departure-table {
  width:100%;
  border-collapse:collapse;
}
.itin-departure-table th {
  border-bottom:solid 1px #ccc;
}
.itin-departure-table td, .itin-departure-table th {
  padding:5px;
  padding-left:0px;
}
</style>
