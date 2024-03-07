<template>
  <div>
    <Head>
      <Title>Station: {{ station?.stop?.stop_name }}</Title>
    </Head>
    <tl-editor-breadcrumbs
      :feed-key="feedKey"
      :feed-name="feedName"
      :feed-version-key="feedVersionKey"
      :station-key="stationKey"
      :station-name="stationName"
    />
    <div v-if="station" class="content">
      <h2 class="title is-2">
        <div class="tag is-large">
          Station
        </div> {{ station.stop.stop_name }}
      </h2>
      <div class="box">
        <h4 class="title is-4 is-clearfix">
          Station Info
          <nuxt-link
            :to="{name:'editor-feedKey-feedVersionKey-stations-stationKey-edit', params: {feedKey,feedVersionKey,stationKey}}"
            class="button is-primary is-outlined is-pulled-right right-pad"
          >
            Edit Station Info
          </nuxt-link>
        </h4>
        <div class="is-clearfix">
          <div class="is-pulled-right">
            <tl-editor-level-map
              :zoom="12"
              :points="[station.geometry]"
              :center="station.geometry.coordinates"
              :show-attribution="false"
            />
          </div>
          <strong>ID:</strong> {{ station.stop.stop_id }} <br>
          <strong>Name:</strong> {{ station.stop.stop_name }} <br>
          <strong>Database ID:</strong> {{ station.stop.id }} <br>
        </div>
      </div>

      <tl-editor-station-mode-tabs :station="station" :feed-key="feedKey" :feed-version-key="feedVersionKey" :station-key="stationKey" />

      <h4 class="title is-4 is-clearfix">
        Levels
      </h4>
      <div v-if="station.levels.length === 0">
        No levels
      </div>
      <div>
        <tl-editor-station-levels-viewer-sorter :levels="station.levels" :station="station">
          <template #bottom-button-bar>
            <nuxt-link
              :to="{name:'editor-feedKey-feedVersionKey-stations-stationKey-levels-new', params: {feedKey,feedVersionKey,stationKey}}"
              class="button is-primary is-outlined is-pulled-right right-pad"
            >
              New Level
            </nuxt-link>
          </template>
        </tl-editor-station-levels-viewer-sorter>
      </div>
    </div>
  </div>
</template>

<script>
import StationMixin from '../station-mixin'
export default {
  mixins: [StationMixin]
}
</script>

  <style scoped>
  .right-pad {
    margin-left:10px
  }
  </style>
