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
    <tl-apps-stations-stop-table
      v-if="feedVersion?.id"
      :feed-version-ids="[feedVersion.id]"
      :location-type="1"
      :client="client"
    >
      <template #stopName="slotProps">
        <tl-link
          route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey"
          :to="{ params: { feedKey, feedVersionKey, stationKey: slotProps.stop.stop_id } }"
        >
          {{ slotProps.stop.stop_name }}
        </tl-link>
      </template>
    </tl-apps-stations-stop-table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FeedMixin from './feed-mixin.vue'

export default defineComponent({
  mixins: [FeedMixin]
})
</script>
