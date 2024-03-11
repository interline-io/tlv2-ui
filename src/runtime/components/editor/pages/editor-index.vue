<template>
  <div>
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
              {{ feed_version.file }}
            </td>
            <td>
              <nuxt-link
                v-if="feed_version.file"
                :to="{name:'editor-feedKey-feedVersionKey-stations', params: {
                  feedKey:feed.onestop_id || 'unknown',
                  feedVersionKey:feed_version.file || 'unknown'
                }}"
              >
                Edit {{ feed_version.stations ? feed_version.stations.length : '' }} Stations
              </nuxt-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import FeedMixin from './feed-mixin'

export default {
  mixins: [FeedMixin],
  head: {
    title: 'Editor'
  }
}
</script>
