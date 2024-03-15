<template>
  <div v-if="station">
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
            <span class="tag">Station</span>
            <nuxt-link
              :to="{name:'editor-feedKey-feedVersionKey-stations-stationKey',params:{feedKey,feedVersionKey,stationKey}}"
            >
              {{ stationName }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
    </slot>

    <slot name="title">
      <tl-title title="Station">
        Station: {{ stationName }}
      </tl-title>
    </slot>

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

    <tl-loading v-if="$apollo.loading" />
    <div v-else>
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
import StationMixin from './station-mixin'
export default {
  mixins: [StationMixin]
}
</script>

  <style scoped>
  .right-pad {
    margin-left:10px
  }
  </style>
