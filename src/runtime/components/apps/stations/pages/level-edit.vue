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
      :has-associated-stops="hasAssociatedStops"
      @update="updateLevelHandler"
      @delete="deleteLevelHandler"
      @cancel="cancelHandler"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { navigateTo } from '#imports'
import type { Level } from '../station'
import { useStation } from '../composables/useStation'
import { useRouteResolver } from '../../../../composables/useRouteResolver'
import { useToastNotification } from '../../../../composables/useToastNotification'

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
  handleError,
  updateLevel,
  deleteLevel
} = useStation({ feedKey, feedVersionKey, stationKey, clientId: clientId?.value })

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

const hasAssociatedStops = computed((): boolean => {
  return (level.value?.stops?.length || 0) > 0
})

// Methods
function updateLevelHandler (level: Level) {
  if (!station.value) return
  updateLevel(level)
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
  const { showToast } = useToastNotification()
  deleteLevel(level)
    .then(() => {
      showToast('Level deleted successfully', 'success', 3000)
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
