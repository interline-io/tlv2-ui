<template>
  <div v-if="typeof feedVersion !== 'string' && feedVersion?.id">
    <slot name="title">
      <tl-title title="New Station" />
    </slot>

    <tl-apps-stations-station-editor
      :value="newStation()"
      @create="createStationHandler"
      @cancel="cancelHandler"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { navigateTo } from '#imports'
import { Station, Stop } from '../station'
import { useFeed } from '../composables/useFeed'
import { useStation } from '../composables/useStation'
import { useRouteResolver } from '../../../../composables/useRouteResolver'

const props = defineProps<{
  feedKey: string
  feedVersionKey: string
  clientId?: string
}>()

const { feedKey, feedVersionKey, clientId } = toRefs(props)

const { resolve } = useRouteResolver()

const { feedVersion } = useFeed({
  feedKey,
  feedVersionKey,
  clientId: clientId.value
})

const { createStation, handleError } = useStation({
  feedKey,
  feedVersionKey,
  stationKey: ref('new'),
  clientId: clientId.value
})

const newStation = () => {
  const fvId = typeof feedVersion.value !== 'string' ? feedVersion.value?.id : undefined
  const newStop = new Stop({ feed_version: { id: fvId } })
  const newStation = new Station(newStop).setDefaults()
  return newStation
}

const createStationHandler = (station: Station) => {
  createStation(station.stop)
    .then(() => {
      navigateTo({
        name: resolve('apps-stations-feedKey-feedVersionKey-stations-stationKey'),
        params: {
          feedKey: feedKey.value,
          feedVersionKey: feedVersionKey.value,
          stationKey: station.stop.stop_id
        }
      })
    })
    .catch(handleError)
}

const cancelHandler = () => {
  navigateTo({
    name: resolve('apps-stations-feedKey-feedVersionKey-stations'),
    params: {
      feedKey: feedKey.value,
      feedVersionKey: feedVersionKey.value
    }
  })
}
</script>
