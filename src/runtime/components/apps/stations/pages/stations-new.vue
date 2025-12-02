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
import { toRefs, getCurrentInstance } from 'vue'
import { navigateTo } from '#imports'
import { Station, Stop } from '../station'
import { useFeed } from '../composables/useFeed'
import { useRouteResolver } from '../../../../composables/useRouteResolver'

const props = defineProps<{
  feedKey: string
  feedVersionKey: string
  clientId?: string
}>()

const { feedKey, feedVersionKey, clientId } = toRefs(props)

const { resolve } = useRouteResolver()
const instance = getCurrentInstance()

const { feedVersion } = useFeed({
  feedKey,
  feedVersionKey,
  clientId: clientId.value
})

const newStation = () => {
  const fvId = typeof feedVersion.value !== 'string' ? feedVersion.value?.id : undefined
  const newStop = new Stop({ feed_version: { id: fvId } })
  const newStation = new Station(newStop).setDefaults()
  return newStation
}

const createStationHandler = (station: Station) => {
  const apollo = instance?.appContext.config.globalProperties.$apollo as any
  // @ts-expect-error - Vue Apollo global injection
  station.createStation(apollo, station.stop)
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
    .catch((err: Error) => {
      console.error('Error creating station:', err)
    })
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
