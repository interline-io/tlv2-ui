<template>
  <div>
    <Head>
      <Title>Edit Station: {{ station?.stop_name }}</Title>
    </Head>
    <tl-editor-breadcrumbs
      :feed-key="feedKey"
      :feed-name="feedName"
      :feed-version-key="feedVersionKey"
      :station-key="stationKey"
      :station-name="stationName"
    >
      <li class="is-active">
        <a href="#">Edit Station</a>
      </li>
    </tl-editor-breadcrumbs>

    <div v-if="station" class="content">
      <h2 class="title is-2">
        Edit Station
      </h2>

      <tl-editor-station-editor
        :center="station.geometry.coordinates"
        :value="station"
        @update="updateStationHandler"
        @delete="deleteStationCheck"
      />
    </div>
  </div>
</template>

<script>
import StationMixin from '../station-mixin'
import { navigateTo } from '#app'

export default {
  mixins: [StationMixin],
  methods: {
    updateStationHandler (station) {
      this.station.updateStation(this.$apollo, station).then(() => {
        navigateTo({
          name: 'editor-feedKey-feedVersionKey-stations-stationKey',
          params: {
            feedKey: this.feedKey,
            feedVersionKey: this.feedVersionKey,
            stationKey: station.stop.stop_id
          }
        })
      }).catch(this.error)
    },
    deleteStationCheck (station) {
      this.$buefy.dialog.confirm({
        message: `Do you want to delete the station named <strong>${station.stop.stop_name}</strong>?`,
        cancelText: 'No',
        confirmText: 'Yes',
        onConfirm: () => {
          this.deleteStationHandler(station)
        }
      })
    },
    deleteStationHandler (station) {
      this.station.deleteStation(this.$apollo, station).then(() => {
        navigateTo({
          name: 'editor-feedKey-feedVersionKey-stations',
          params: {
            feedKey: this.feedKey,
            feedVersionKey: this.feedVersionKey
          }
        })
      }).catch(this.error)
    }
  }
}
</script>
