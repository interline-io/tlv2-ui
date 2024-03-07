<template>
  <div>
    <tl-editor-breadcrumbs
      :feed-key="feedKey"
      :feed-name="feedName"
      :feed-version-key="feedVersionKey"
    >
      <li class="is-active">
        <a href="#">Stations</a>
      </li>
    </tl-editor-breadcrumbs>

    <div v-if="!$apollo.loading" class="content">
      <h2 class="title is-2">
        Stations
      </h2>
      <div class="buttons is-right">
        <nuxt-link
          :to="{name:'editor-feedKey-feedVersionKey-stations-new', params: {feedKey,feedVersionKey}}"
          class="button is-primary"
        >
          New Station
        </nuxt-link>
        <nuxt-link
          :to="{name: 'editor-feedKey-feedVersionKey-stations-stop-associations', params: {feedKey,feedVersionKey}}"
          class="button is-primary"
        >
          Review stop ID associations
        </nuxt-link>
      </div>
      <p class="content is-medium">
        Or select an existing station in this feed version:
      </p>
      <div v-for="station in stations" :key="station.id" class="box is-clearfix">
        <nuxt-link
          :to="{name:'editor-feedKey-feedVersionKey-stations-stationKey', params: {feedKey,feedVersionKey, stationKey:station.station_id}}"
        >
          {{ station.stationName }}
        </nuxt-link>
        <div class="is-pulled-right" />
      </div>
    </div>
  </div>
</template>

<script>
import FeedMixin from '../feed-mixin'

export default {
  mixins: [FeedMixin],
  head: {
    title: 'Editor: Stations'
  }
}
</script>
