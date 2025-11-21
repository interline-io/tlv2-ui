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
      :has-associated-stops="hasAssociatedStops"
      @update="updateLevelHandler"
      @delete="deleteLevelHandler"
      @cancel="cancelHandler"
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
      const levels = this.station?.levels || []
      for (const level of levels) {
        if (level.level_id === this.levelKey) {
          return level
        }
      }
      return null
    },
    hasAssociatedStops () {
      return (this.level?.stops?.length || 0) > 0
    }
  },
  methods: {
    updateLevelHandler (level) {
      this.station.updateLevel(this.$apollo, level)
        .then(() => {
          navigateTo({
            name: this.editorRoutes.stationIndex,
            params: {
              feedKey: this.feedKey,
              feedVersionKey: this.feedVersionKey,
              stationKey: this.stationKey
            }
          })
        })
        .catch(this.setError)
    },
    deleteLevelHandler (level) {
      this.station.deleteLevel(this.$apollo, level)
        .then(() => {
          this.$oruga.notification.open({
            message: 'Level deleted successfully',
            rootClass: 'toast-notification',
            variant: 'success',
            closable: true,
            position: 'bottom',
            duration: 3000
          })
          navigateTo({
            name: this.editorRoutes.stationIndex,
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
        name: this.editorRoutes.stationIndex,
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
