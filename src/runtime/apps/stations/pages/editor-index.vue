<template>
  <div>
    <slot name="title">
      <tl-title title="Editor" />
    </slot>

    <div class="content">
      <table v-if="feeds" cellspacing="10">
        <thead>
          <tr>
            <th>Feed</th>
            <th>Version</th>
            <th />
          </tr>
        </thead>
        <tbody v-for="feed in feeds" :key="feed.id">
          <tr v-for="feed_version in feed.feed_versions" :key="feed_version.id">
            <td>
              {{ feed.name || feed.onestop_id }}
            </td>
            <td>
              {{ feed_version.sha1 }}
            </td>
            <td>
              <tl-link
                v-if="feed_version.id"
                route-key="apps-stations-feedKey-feedVersionKey-stations"
                :to="{
                  params: {
                    feedKey: feed.onestop_id || 'unknown',
                    feedVersionKey: feed_version.id || 'unknown',
                  } }"
              >
                Edit {{ feed_version.stations ? feed_version.stations.length : '' }} Stations
              </tl-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import { useFeed } from '../composables/useFeed'

const props = defineProps<{
  clientId?: string
}>()

const { clientId } = toRefs(props)

const { feeds } = useFeed({
  clientId: clientId?.value
})
</script>
