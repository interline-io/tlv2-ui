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
      :center="station.geometry.coordinates"
      @update="updateLevelHandler"
      @delete="deleteLevelHandler"
      @cancel="cancelHandler"
    />
  </div>
</template>

<script>
import { navigateTo } from '#imports'
import StationMixin from './station-mixin'
import { useRouteResolver } from '../../../../composables/useRouteResolver'

export default {
  mixins: [StationMixin],
  setup () {
    const { resolve } = useRouteResolver()
    return { resolve }
  },
  head: {
    title: 'Editor: Edit Level'
  },
  computed: {
    level () {
      const levels = this.station?.levels
      for (const level of levels) {
        if (level.level_id === this.levelKey) {
          return level
        }
      }
      return null
    }
  },
  methods: {
    updateLevelHandler (level) {
      this.station.updateLevel(this.$apollo, level)
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
    deleteLevelHandler (levelId) {
      this.station.deleteLevel(this.$apollo, levelId)
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
}
</script>
