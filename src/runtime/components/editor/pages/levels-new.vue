<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Edit Station">
        New Level
      </tl-title>
    </slot>

    <tl-editor-level-editor
      :station="station"
      :center="station.geometry.coordinates"
      @create="createLevelHandler"
    />
  </div>
</template>

<script>
import { navigateTo } from '#imports'
import StationMixin from './station-mixin'

export default {
  mixins: [StationMixin],
  head: {
    title: 'Editor: New Level'
  },
  methods: {
    createLevelHandler (level) {
      this.station.createLevel(this.$apollo, level).then(() => {
        navigateTo({
          name: 'editor-feedKey-feedVersionKey-stations-stationKey',
          params: {
            feedKey: this.feedKey,
            feedVersionKey: this.feedVersionKey,
            stationKey: this.stationKey
          }
        })
      }).catch(this.setError)
    }
  }
}
</script>
