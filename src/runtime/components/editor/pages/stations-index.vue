<template>
  <div>
    <slot name="title">
      <tl-title title="Stations" />
    </slot>

    <div class="buttons is-right">
      <nuxt-link
        :to="{name:editorRoutes.stationsNew, params: {feedKey,feedVersionKey}}"
        class="button is-primary"
      >
        New Station
      </nuxt-link>
      <nuxt-link
        :to="{name: editorRoutes.stationsStopAssociations, params: {feedKey,feedVersionKey}}"
        class="button is-primary"
      >
        Review stop ID associations
      </nuxt-link>
      <nuxt-link
        :to="{name: editorRoutes.export, params: {feedKey,feedVersionKey}}"
        class="button is-primary"
      >
        Export GTFS
      </nuxt-link>
    </div>
    <p class="content">
      Or select an existing station in this feed version:
    </p>
    <tl-stop-table
      v-if="feedVersion?.id"
      :feed-version-ids="[feedVersion.id]"
      :location-type="1"
      :show-links="false"
      :client="client"
    >
      <template #stopName="slotProps">
        <nuxt-link
          :to="{name:editorRoutes.stationIndex, params: {feedKey,feedVersionKey,stationKey:slotProps.stop.stop_id}}"
        >
          {{ slotProps.stop.stop_name }}
        </nuxt-link>
      </template>
    </tl-stop-table>
    <!-- <div v-for="station in stations" :key="station.id" class="box is-clearfix">
      <div class="is-pulled-right" />
    </div> -->
  </div>
</template>

<script>
import FeedMixin from './feed-mixin'

export default {
  mixins: [FeedMixin],
  head: {
    title: 'Editor: Stations'
  }
}
</script>
