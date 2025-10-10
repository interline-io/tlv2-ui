<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Edit Station">
        Edit Station: {{ stationName }}
      </tl-title>
    </slot>

    <tl-editor-station-editor
      :center="station.geometry.coordinates"
      :value="station"
      @update="updateStationHandler"
      @delete="deleteStationHandler"
    />
  </div>
</template>

<script>
import { navigateTo } from '#imports'
import StationMixin from './station-mixin'

export default {
  mixins: [StationMixin],
  methods: {
    updateStationHandler (station) {
      this.station.updateStation(this.$apollo, station.stop)
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
      this.station.deleteStation(this.$apollo, station)
        .then(() => {
          navigateTo({
            name: this.editorRoutes.stations,
            params: {
              feedKey: this.feedKey,
              feedVersionKey: this.feedVersionKey
            }
          })
        })
        .catch(this.setError)
    }
  }
}
</script>
