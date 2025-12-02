<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Edit Station">
        New Level
      </tl-title>
    </slot>

    <tl-apps-stations-level-editor
      :station="station"
      :center="station.geometry.coordinates"
      @create="createLevelHandler"
      @cancel="cancelHandler"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { navigateTo } from '#imports'
import type { Level } from '../station'
import StationMixin from './station-mixin.vue'
import { useRouteResolver } from '../../../../composables/useRouteResolver'

export default defineComponent({
  mixins: [StationMixin],
  setup () {
    const { resolve } = useRouteResolver()
    return { resolve }
  },
  methods: {
    createLevelHandler (level: Level) {
      this.station.createLevel(this.$apollo, level).then(() => {
        navigateTo({
          name: this.resolve('apps-stations-feedKey-feedVersionKey-stations-stationKey'),
          params: {
            feedKey: this.feedKey,
            feedVersionKey: this.feedVersionKey,
            stationKey: this.stationKey
          }
        })
      }).catch(this.setError)
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
