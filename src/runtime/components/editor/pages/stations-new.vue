<template>
  <div v-if="feedVersion && feedVersion.id">
    <slot name="title">
      <tl-title title="New Station" />
    </slot>

    <tl-editor-station-editor
      :value="newStation()"
      @create="createStationHandler"
      @cancel="cancelHandler"
    />
  </div>
</template>

<script>
// Note: this uses FeedMixin, not station mixin.
import { navigateTo } from '#imports'
import { Station, Stop } from '../station'
import FeedMixin from './feed-mixin'
import { useRouteResolver } from '../../composables/useRouteResolver'

export default {
  mixins: [FeedMixin],
  setup () {
    const { resolve } = useRouteResolver()
    return { resolve }
  },
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
            name: this.resolve('editor-feedKey-feedVersionKey-stations-stationKey'),
            params: {
              feedKey: this.feedKey,
              feedVersionKey: this.feedVersionKey,
              stationKey: station.stop.stop_id
            }
          })
        })
        .catch(this.setError)
    },
    cancelHandler () {
      navigateTo({
        name: this.resolve('editor-feedKey-feedVersionKey-stations'),
        params: {
          feedKey: this.feedKey,
          feedVersionKey: this.feedVersionKey
        }
      })
    }
  }
}
</script>
