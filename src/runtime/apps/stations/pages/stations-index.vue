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
      v-if="typeof feedVersion !== 'string' && feedVersion?.id"
      :feed-version-ids="[feedVersion.id]"
      :location-type="1"
      :client="clientId"
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

<script setup lang="ts">
import { toRefs } from 'vue'
import { useFeed } from '../composables/useFeed'

const props = defineProps<{
  feedKey: string
  feedVersionKey: string
  clientId?: string
}>()

const { feedKey, feedVersionKey, clientId } = toRefs(props)

const { feedVersion } = useFeed({
  feedKey,
  feedVersionKey,
  clientId: clientId.value
})
</script>
