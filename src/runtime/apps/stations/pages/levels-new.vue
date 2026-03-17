<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Edit Station">
        New Level
      </tl-title>
    </slot>

    <tl-apps-stations-level-editor
      :station="station"
      :center="station.geometry?.coordinates as [number, number]"
      @create="createLevelHandler"
      @cancel="cancelHandler"
    />
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import { navigateTo } from '#imports'
import type { Level } from '../station'
import { useStation } from '../composables/useStation'
import { useRouteResolver } from '../../../composables/useRouteResolver'

const props = defineProps<{
  feedKey: string
  feedVersionKey: string
  stationKey: string
  clientId?: string
}>()

const { feedKey, feedVersionKey, stationKey, clientId } = toRefs(props)

const {
  station,
  handleError,
  createLevel
} = useStation({ feedKey, feedVersionKey, stationKey, clientId: clientId?.value })

const { resolve } = useRouteResolver()

// Methods
function createLevelHandler (level: Level) {
  if (!station.value) return
  createLevel(level)
    .then(() => {
      navigateTo({
        name: resolve('apps-stations-feedKey-feedVersionKey-stations-stationKey'),
        params: {
          feedKey: feedKey.value,
          feedVersionKey: feedVersionKey.value,
          stationKey: stationKey.value
        }
      })
    })
    .catch(handleError)
}

function cancelHandler () {
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
