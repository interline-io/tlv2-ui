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

<script lang="ts">
import { defineComponent } from 'vue'
import FeedMixin from './feed-mixin.vue'

export default defineComponent({
  mixins: [FeedMixin]
})
</script>
