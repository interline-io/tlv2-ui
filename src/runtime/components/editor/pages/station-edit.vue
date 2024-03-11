<template>
  <div v-if="station">
    <tl-editor-station-editor
      :center="station.geometry.coordinates"
      :value="station"
      @update="updateStationHandler"
      @delete="deleteStationCheck"
    />
  </div>
</template>

<script>
import { navigateTo } from '#app'
import StationMixin from './station-mixin'

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
