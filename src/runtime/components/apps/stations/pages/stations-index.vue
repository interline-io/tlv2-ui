<template>
  <div>
    <slot name="title">
      <tl-title title="Stations" />
    </slot>

    <div class="buttons is-right">
      <tl-link
        route-key="apps-stations-feedKey-feedVersionKey-stations-new"
        :to="{ params: { feedKey, feedVersionKey } }"
        class="button is-primary"
      >
        New Station
      </tl-link>
      <tl-link
        route-key="apps-stations-feedKey-feedVersionKey-stations-stop-associations"
        :to="{ params: { feedKey, feedVersionKey } }"
        class="button is-primary"
      >
        Review stop ID associations
      </tl-link>
      <tl-link
        route-key="apps-stations-feedKey-feedVersionKey-export"
        :to="{ params: { feedKey, feedVersionKey } }"
        class="button is-primary"
      >
        Export GTFS
      </tl-link>
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
      :limit="1000"
      :show-selected-route-type="false"
    >
      <template #stopName="slotProps">
        <tl-link
          route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey"
          :to="{ params: { feedKey, feedVersionKey, stationKey: slotProps.stop.stop_id } }"
        >
          {{ slotProps.stop.stop_name }}
        </tl-link>
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
