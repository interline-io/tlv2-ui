<template>
  <div>
    <tl-editor-breadcrumbs
      :feed-key="feedKey"
      :feed-name="feedName"
      :feed-version-key="feedVersionKey"
    >
      <li class="is-active">
        <a href="#">New Station</a>
      </li>
    </tl-editor-breadcrumbs>

    <div v-if="feed_version" class="content">
      <h2 class="title is-2">
        New Station
      </h2>
      station: {{ station }}

      <tl-editor-station-editor
        :value="newStation()"
        @create="createStationHandler"
      />
    </div>
  </div>
</template>

<script>
// Note: this uses FeedMixin, not station mixin.
import FeedMixin from '../feed-mixin'
import { Station, Stop } from '../station'
import { navigateTo } from '#app'

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
