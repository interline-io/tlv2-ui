<template>
  <div v-if="feedVersion && feedVersion.id">
    <slot name="nav">
      <nav class="breadcrumb box" aria-label="breadcrumbs">
        <ul>
          <li>
            <nuxt-link :to="{name:'editor'}">
              Editor
            </nuxt-link>
          </li>
          <li>
            <span class="tag">Feed</span>
            <a href="#">{{ feedName }}</a>
          </li>
          <li>
            <span class="tag">Version</span>
            <nuxt-link
              :to="{name:'editor-feedKey-feedVersionKey-stations',params:{feedKey,feedVersionKey}}"
            >
              {{ feedVersionName }}
            </nuxt-link>
          </li>
          <li class="is-active">
            <a href="#">New Station</a>
          </li>
        </ul>
      </nav>
    </slot>

    <slot name="title">
      <tl-title title="New Station" />
    </slot>

    {{ newStation () }}

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
      const newStop = new Stop({ feed_version: { id: this.feedVersion.id } })
      const newStation = new Station(newStop).setDefaults()
      return newStation
    },
    createStationHandler (station) {
      station.createStation(this.$apollo, station.stop)
        .then(this.handleError)
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
