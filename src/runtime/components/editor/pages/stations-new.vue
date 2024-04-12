<template>
  <div v-if="feedVersion && feedVersion.id">
    <slot name="nav">
      <tl-breadcrumbs />
    </slot>

    <slot name="title">
      <tl-title title="New Station" />
    </slot>

    <tl-editor-station-editor
      :value="newStation()"
      @create="createStationHandler"
    />
  </div>
</template>

<script>
// Note: this uses FeedMixin, not station mixin.
import { Station, Stop } from '../station'
import FeedMixin from './feed-mixin'
import { navigateTo } from '#imports'

export default {
  mixins: [FeedMixin],
  head: {
    title: 'Editor: New Station'
  },
  methods: {
    newStation () {
      const newStop = new Stop({ feed_version: { id: this.feedVersion.id } })
      const newStation = new Station(newStop).setDefaults()
      return newStation
    },
    createStationHandler (station) {
      station.createStation(this.$apollo, station.stop)
        .then(() => {
          navigateTo({
            name: 'editor-feedKey-feedVersionKey-stations-stationKey',
            params: {
              feedKey: this.feedKey,
              feedVersionKey: this.feedVersionKey,
              stationKey: station.stop.stop_id
            }
          })
        })
        .catch(this.setError)
    }
  }
}
</script>
