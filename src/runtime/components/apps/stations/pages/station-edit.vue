<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Edit Station">
        Edit Station: {{ stationName }}
      </tl-title>
    </slot>

    <tl-apps-stations-station-editor
      :center="station.geometry?.coordinates as [number, number]"
      :value="station"
      @update="updateStationHandler"
      @delete="deleteStationHandler"
      @cancel="cancelHandler"
    />
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import { navigateTo } from '#imports'
import type { Station } from '../station'
import { useStation } from '../composables/useStation'
import { useRouteResolver } from '../../../../composables/useRouteResolver'

const props = defineProps<{
  feedKey: string
  feedVersionKey: string
  stationKey: string
  clientId?: string
}>()

const { feedKey, feedVersionKey, stationKey, clientId } = toRefs(props)

const { resolve } = useRouteResolver()

const {
  station,
  stationName,
  handleError,
  updateStation,
  deleteStation
} = useStation({
  feedKey,
  feedVersionKey,
  stationKey,
  clientId: clientId?.value
})

const updateStationHandler = (updatedStation: Station) => {
  if (!station.value) return
  updateStation(updatedStation.stop)
    .then(() => {
      navigateTo({
        name: resolve('apps-stations-feedKey-feedVersionKey-stations-stationKey'),
        params: {
          feedKey: feedKey.value,
          feedVersionKey: feedVersionKey.value,
          stationKey: updatedStation.stop.stop_id
        }
      })
    })
    .catch(handleError)
}

const deleteStationHandler = (stationToDelete: Station) => {
  if (!station.value) return
  deleteStation(stationToDelete.stop)
    .then(() => {
      navigateTo({
        name: resolve('apps-stations-feedKey-feedVersionKey-stations'),
        params: {
          feedKey: feedKey.value,
          feedVersionKey: feedVersionKey.value
        }
      })
    })
    .catch(handleError)
}

const cancelHandler = () => {
  navigateTo({
    name: resolve('apps-stations-feedKey-feedVersionKey-stations-stationKey'),
    params: {
      feedKey: feedKey.value,
      feedVersionKey: feedVersionKey.value,
      stationKey: stationKey.value
    }
  })
}
</script>
