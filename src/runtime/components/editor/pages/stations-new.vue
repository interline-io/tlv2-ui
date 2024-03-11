<template>
  <div v-if="feed_version">
    <tl-editor-station-editor
      :value="newStation()"
      @create="createStationHandler"
    />
  </div>
</template>

<script>
// Note: this uses FeedMixin, not station mixin.
import { navigateTo } from '#app'
import { Station, Stop } from '../station'
import FeedMixin from './feed-mixin'

export default {
  mixins: [FeedMixin],
  head: {
    title: 'Editor: New Station'
  },
  methods: {
    newStation () {
      return new Station(new Stop({ feed_version: { id: this.feed_version.id } })).setDefaults()
    },
    createStationHandler (station) {
      station.createStation(this.$apollo, station.stop).then(() => {
        navigateTo({
          name: 'editor-feedKey-feedVersionKey-stations-stationKey',
          params: {
            feedKey: this.feedKey,
            feedVersionKey: this.feedVersionKey,
            stationKey: station.stop.stop_id
          }
        })
      }).catch(this.error)
    }
  }
}
</script>
