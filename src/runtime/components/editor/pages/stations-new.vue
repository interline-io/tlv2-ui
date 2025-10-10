<template>
  <div v-if="feedVersion && feedVersion.id">
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
import { navigateTo } from '#imports'
import { Station, Stop } from '../station'
import FeedMixin from './feed-mixin'

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
            name: this.editorRoutes.stationIndex,
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
