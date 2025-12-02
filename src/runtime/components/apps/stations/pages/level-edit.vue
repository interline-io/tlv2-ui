<template>
  <div v-if="station && level">
    <slot name="title">
      <tl-title title="Edit Station">
        Edit Level
      </tl-title>
    </slot>

    <tl-apps-stations-level-editor
      :station="station"
      :value="level"
      :center="station.geometry?.coordinates as [number, number]"
      @update="updateLevelHandler"
      @delete="deleteLevelHandler"
      @cancel="cancelHandler"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { navigateTo } from '#imports'
import { useApolloClient } from '@vue/apollo-composable'
import type { Level } from '../station'
import { useStation } from '../composables/useStation'
import { useRouteResolver } from '../../../../composables/useRouteResolver'

const props = defineProps<{
  feedKey: string
  feedVersionKey: string
  stationKey: string
  levelKey: string
  clientId?: string
}>()

const { feedKey, feedVersionKey, stationKey, clientId } = toRefs(props)

const {
  station,
  handleError
} = useStation({ feedKey, feedVersionKey, stationKey, clientId: clientId?.value })

const { resolveClient } = useApolloClient()
const { resolve } = useRouteResolver()

// Computed properties
const level = computed((): Level | null => {
  const levels = station.value?.levels
  if (!levels) return null
  for (const lv of levels) {
    if (lv.level_id === props.levelKey) {
      return lv
    }
  }
  return null
})

// Methods
function updateLevelHandler (level: Level) {
  if (!station.value) return
  const apollo = resolveClient(clientId?.value)
  ;(station.value.updateLevel(apollo, level) as Promise<any>)
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

function deleteLevelHandler (level: Level) {
  if (!station.value) return
  const apollo = resolveClient(clientId?.value)
  ;(station.value.deleteLevel(apollo, level) as Promise<any>)
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
