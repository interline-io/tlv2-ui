<template>
  <div v-if="station">
    <slot name="title">
      <tl-title title="Station">
        Station: {{ stationName }}
      </tl-title>
    </slot>

    <div class="box">
      <h4 class="title is-4 is-clearfix">
        Station Info
        <tl-link
          route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-edit"
          :to="{ params: { feedKey, feedVersionKey, stationKey } }"
          class="button is-primary is-outlined is-pulled-right right-pad"
        >
          Edit Station Info
        </tl-link>
      </h4>
      <div class="is-clearfix">
        <div class="is-pulled-right">
          <tl-apps-stations-level-map
            :zoom="12"
            :points="[station.geometry!]"
            :center="station.geometry?.coordinates as [number, number]"
            :show-attribution="false"
          />
        </div>
        <strong>ID:</strong> {{ station.stop.stop_id }} <br>
        <strong>Name:</strong> {{ station.stop.stop_name }} <br>
        <strong>Database ID:</strong> {{ station.stop.id }} <br>
      </div>
    </div>

    <tl-apps-stations-station-mode-tabs
      :station="station"
      :feed-key="feedKey"
      :feed-version-key="feedVersionKey"
      :station-key="stationKey"
      :stop-associations-enabled="stopAssociationsEnabled"
    />

    <t-loading v-if="loading" :active="true" />
    <div v-else>
      <h4 class="title is-4 is-clearfix">
        Levels
      </h4>

      <div v-if="station.levels.length === 0">
        No levels
      </div>
      <div>
        <tl-apps-stations-station-levels-viewer-sorter :station="station">
          <template #bottom-button-bar>
            <tl-link
              route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-levels-new"
              :to="{ params: { feedKey, feedVersionKey, stationKey } }"
              class="button is-primary is-outlined is-pulled-right right-pad"
            >
              New Level
            </tl-link>
          </template>
        </tl-apps-stations-station-levels-viewer-sorter>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import { useStation } from '../composables/useStation'

const props = defineProps<{
  feedKey: string
  feedVersionKey: string
  stationKey: string
  clientId?: string
}>()

const { feedKey, feedVersionKey, stationKey, clientId } = toRefs(props)

const {
  station,
  stationName,
  stopAssociationsEnabled,
  loading
} = useStation({
  feedKey,
  feedVersionKey,
  stationKey,
  clientId: clientId?.value
})
</script>

  <style scoped>
  .right-pad {
    margin-left:10px
  }
  </style>
