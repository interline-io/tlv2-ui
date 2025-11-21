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
      @cancel="cancelHandler"
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
    deleteStationHandler (station) {
      this.station.deleteStation(this.$apollo, station)
        .then(() => {
          this.$oruga.notification.open({
            message: 'Station deleted successfully',
            rootClass: 'toast-notification',
            variant: 'success',
            closable: true,
            position: 'bottom',
            duration: 3000
          })
          navigateTo({
            name: this.editorRoutes.stations,
            params: {
              feedKey: this.feedKey,
              feedVersionKey: this.feedVersionKey
            }
          })
        })
        .catch(this.setError)
    },
    cancelHandler () {
      navigateTo({
        name: this.editorRoutes.stationIndex,
        params: {
          feedKey: this.feedKey,
          feedVersionKey: this.feedVersionKey,
          stationKey: this.stationKey
        }
      })
    }
  }
}
</script>
