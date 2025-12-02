<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Edit Station">
        Edit Station: {{ stationName }}
      </tl-title>
    </slot>

    <tl-apps-stations-station-editor
      :center="station.geometry.coordinates"
      :value="station"
      @update="updateStationHandler"
      @delete="deleteStationHandler"
      @cancel="cancelHandler"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { navigateTo } from '#imports'
import type { Station } from '../station'
import StationMixin from './station-mixin.vue'
import { useRouteResolver } from '../../../../composables/useRouteResolver'

export default defineComponent({
  mixins: [StationMixin],
  setup () {
    const { resolve } = useRouteResolver()
    return { resolve }
  },
  methods: {
    updateStationHandler (station: Station) {
      this.station.updateStation(this.$apollo, station.stop)
        .then(() => {
          navigateTo({
            name: this.resolve('apps-stations-feedKey-feedVersionKey-stations-stationKey'),
            params: {
              feedKey: this.feedKey,
              feedVersionKey: this.feedVersionKey,
              stationKey: station.stop.stop_id
            }
          })
        })
        .catch(this.setError)
    },
    deleteStationCheck (station: Station) {
      this.$buefy.dialog.confirm({
        message: `Do you want to delete the station named <strong>${station.stop.stop_name}</strong>?`,
        cancelText: 'No',
        confirmText: 'Yes',
        onConfirm: () => {
          this.deleteStationHandler(station)
        }
      })
    },
    deleteStationHandler (station: Station) {
      this.station.deleteStation(this.$apollo, station)
        .then(() => {
          navigateTo({
            name: this.resolve('apps-stations-feedKey-feedVersionKey-stations'),
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
        name: this.resolve('apps-stations-feedKey-feedVersionKey-stations-stationKey'),
        params: {
          feedKey: this.feedKey,
          feedVersionKey: this.feedVersionKey,
          stationKey: this.stationKey
        }
      })
    }
  }
})
</script>
