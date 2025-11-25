<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Edit Station">
        Edit Station: {{ stationName }}
      </tl-title>
    </slot>

    <tl-stationEditor-station-editor
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
import { useRouteResolver } from '../../../../composables/useRouteResolver'

export default {
  mixins: [StationMixin],
  setup () {
    const { resolve } = useRouteResolver()
    return { resolve }
  },
  methods: {
    updateStationHandler (station) {
      this.station.updateStation(this.$apollo, station.stop)
        .then(() => {
          navigateTo({
            name: this.resolve('stationEditor-feedKey-feedVersionKey-stations-stationKey'),
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
            name: this.resolve('stationEditor-feedKey-feedVersionKey-stations'),
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
        name: this.resolve('stationEditor-feedKey-feedVersionKey-stations-stationKey'),
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
