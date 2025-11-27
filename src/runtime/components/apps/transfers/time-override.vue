<template>
  <div>
    <tl-loading v-if="loading" />
    <div v-else-if="error">
      <tl-msg variant="danger">
        {{ error }}
      </tl-msg>
    </div>
    <div v-else>
      <table class="table property-list tl-props">
        <tbody>
          <tr :key="fromStopKey">
            <td>From Stop</td>
            <td>
              <t-radio v-model="fromStopCopy" :native-value="from.id" name="fromStopCopy">
                {{ from.stop_name }} (id: {{ from.stop_id }})
              </t-radio>
              <ul>
                <li class="served-by">
                  <i>Served by:</i>
                </li>
                <li v-for="rs of from.route_stops || []" :key="rs.route.id">
                  {{ rs.route.agency.agency_name }}: {{ rs.route.route_short_name || rs.route.route_long_name }}
                </li>
              </ul>
            </td>
          </tr>
          <tr :key="toStopKey">
            <td>To Stop</td>
            <td>
              <t-radio v-model="toStopCopy" native-value="*" name="toStopCopy">
                All Stops
              </t-radio>
              <br>
              <t-radio v-model="toStopCopy" :native-value="to.id" name="toStopCopy">
                {{ to.stop_name }} (id: {{ to.stop_id }})
              </t-radio>
              <ul>
                <li class="served-by">
                  <i>Served by:</i>
                </li>
                <li v-for="rs of to.route_stops || []" :key="rs.route.id">
                  {{ rs.route.agency.agency_name }}: {{ rs.route.route_short_name || rs.route.route_long_name }}
                </li>
              </ul>
            </td>
          </tr>
          <tr>
            <td>Time</td>
            <td style="width:500px">
              {{ secondsToDuration(timeCopy) }}
              <br>
              <o-slider
                :model-value="timeCopy ?? undefined"
                size="medium"
                :min="0"
                :max="600"
                @update:model-value="timeCopy = $event ?? null"
              >
                <template
                  v-for="val in [0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600]"
                  :key="val"
                >
                  <o-slider-tick
                    :value="val"
                  >
                    {{ secondsToDuration(val) }}
                  </o-slider-tick>
                </template>
              </o-slider>
            </td>
          </tr>
        </tbody>
      </table>

      <span @click="setTime">
        <t-button
          class="is-primary is-pulled-right"
        >
          Save
        </t-button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { secondsToDuration } from '../../../lib/time-format'

interface Stop {
  id: number
  stop_name: string
  stop_id: string
  route_stops?: Array<{
    route: {
      id: number
      route_short_name: string
      route_long_name: string
      agency: {
        id: number
        agency_id: string
        agency_name: string
      }
    }
  }>
}

interface Props {
  fromStop?: number | null
  toStop?: number | null
  time?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  fromStop: null,
  toStop: null,
  time: null
})

const emit = defineEmits({
  setTime: (_fromStop: number | null, _toStop: number | string | null, _time: number | null) => true
})

const q = gql`
query ($ids: [Int!]!) {
  stops(ids: $ids) {
    id
    stop_name
    stop_id
    route_stops {
      route {
        id
        route_short_name
        route_long_name
        agency {
          id
          agency_id
          agency_name
        }
      }
    }
  }
}
`

const { result, loading, error } = useQuery(q, () => ({
  ids: [props.fromStop, props.toStop]
}))

const stops = computed<Stop[]>(() => result.value?.stops || [])

const fromStopCopy = ref<number | null>(props.fromStop)
const toStopCopy = ref<number | string | null>(props.toStop)
const timeCopy = ref<number | null>(props.time)

const fromStopKey = computed<string>(() => String(props.fromStop ?? 'from'))
const toStopKey = computed<string>(() => String(props.toStop ?? 'to'))

const from = computed<Partial<Stop>>(() => {
  for (const v of stops.value) {
    if (v.id === props.fromStop) {
      return v
    }
  }
  return {}
})

const to = computed<Partial<Stop>>(() => {
  for (const v of stops.value) {
    if (v.id === props.toStop) {
      return v
    }
  }
  return {}
})

function setTime (): void {
  emit('setTime', fromStopCopy.value, toStopCopy.value, timeCopy.value)
}
</script>

<style scoped>
ul li {
  padding-left:40px;
}
.served-by {
  font-size:10pt;
}
</style>
