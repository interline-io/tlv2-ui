<template>
  <div v-if="!$apollo.loading">
    <tl-editor-breadcrumbs
      :feed-key="feedKey"
      :feed-name="feedName"
      :feed-version-key="feedVersionKey"
      :station-key="stationKey"
      :station-name="stationName"
    >
      <li class="is-active">
        <a href="#">New Level</a>
      </li>
    </tl-editor-breadcrumbs>
    <div class="content">
      <h2 class="title is-2">
        New Level
      </h2>

      <tl-editor-level-editor
        :station="station"
        :center="station.geometry.coordinates"
        @create="createLevelHandler"
      />
    </div>
  </div>
</template>

<script>
import StationMixin from './station-mixin'
import { navigateTo } from '#app'

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
      }).catch(this.error)
    }
  }
}
</script>
