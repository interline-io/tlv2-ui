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

<script lang="ts">
import { defineComponent } from 'vue'
import { navigateTo } from '#imports'
import type { Level } from '../station'
import StationMixin from './station-mixin.vue'
import { useRouteResolver } from '../../../../composables/useRouteResolver'

export default defineComponent({
  mixins: [StationMixin],
  setup () {
    const { resolve } = useRouteResolver()
    return { resolve }
  },
  computed: {
    level (): Level | null {
      const levels = this.station?.levels
      if (!levels) return null
      for (const level of levels) {
        if (level.level_id === this.levelKey) {
          return level
        }
      }
      return null
    }
  },
  methods: {
    updateLevelHandler (level: Level) {
      if (!this.station) return
      const station = this.station as any
      station.updateLevel((this.$apollo as any), level)
        .then(() => {
          navigateTo({
            name: this.resolve('apps-stations-feedKey-feedVersionKey-stations-stationKey'),
            params: {
              feedKey: this.feedKey,
              feedVersionKey: this.feedVersionKey,
              stationKey: this.stationKey
            }
          })
        })
        .catch(this.setError)
    },
    deleteLevelHandler (level: Level) {
      if (!this.station) return
      const station = this.station as any
      station.deleteLevel((this.$apollo as any), level)
        .then(() => {
          navigateTo({
            name: this.resolve('apps-stations-feedKey-feedVersionKey-stations-stationKey'),
            params: {
              feedKey: this.feedKey,
              feedVersionKey: this.feedVersionKey,
              stationKey: this.stationKey
            }
          })
        })
        .catch(this.setError)
    },
    cancelHandler () {
      navigateTo({
        name: this.resolve('apps-stations-feedKey-feedVersionKey-stations-stationKey'),
        params: {
          feedKey: this.feedKey,
          feedVersionKey: this.feedVersionKey,
          stationKey: this.stationKey
        }
      })
    }
  }
})
</script>
