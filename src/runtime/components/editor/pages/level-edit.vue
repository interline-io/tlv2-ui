<template>
  <div v-if="!$apollo.loading">
    <tl-editor-breadcrumbs
      :feed-key="feedKey"
      :feed-name="feedName"
      :feed-version-key="feedVersionKey"
      :station-key="stationKey"
      :station-name="stationName"
      :level-id="level.level_id"
      :level-name="level.level_name"
    >
      <li class="is-active">
        <a href="#">Edit Level</a>
      </li>
    </tl-editor-breadcrumbs>
    <div v-if="station" class="content">
      <h2 class="title is-2">
        Edit Level
      </h2>
      <tl-editor-level-editor
        :station="station"
        :value="level"
        :center="station.geometry.coordinates"
        @update="updateLevelHandler"
        @delete="deleteLevelHandler"
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
    title: 'Editor: Edit Level'
  },
  computed: {
    level () {
      const levels = this.station.levels
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
      this.station.updateLevel(this.$apollo, level).then(() => {
        navigateTo({
          name: 'editor-feedKey-feedVersionKey-stations-stationKey',
          params: {
            feedKey: this.feedKey,
            feedVersionKey: this.feedVersionKey,
            stationKey: this.stationKey
          }
        })
      }).catch(this.error)
    },
    deleteLevelHandler (levelId) {
      this.station.deleteLevel(this.$apollo, levelId).then(() => {
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
