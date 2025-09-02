<template>
  <div v-if="station && level">
    <slot name="title">
      <tl-title title="Edit Station">
        Edit Level
      </tl-title>
    </slot>

    <tl-editor-level-editor
      :station="station"
      :value="level"
      :center="station.geometry.coordinates"
      @update="updateLevelHandler"
      @delete="deleteLevelHandler"
    />
  </div>
</template>

<script>
import { navigateTo } from '#imports'
import StationMixin from './station-mixin'

export default {
  mixins: [StationMixin],
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
            name: 'editor-feedKey-feedVersionKey-stations-stationKey',
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
            name: 'editor-feedKey-feedVersionKey-stations-stationKey',
            params: {
              feedKey: this.feedKey,
              feedVersionKey: this.feedVersionKey,
              stationKey: this.stationKey
            }
          })
        })
        .catch(this.setError)
    }
  }
}
</script>
