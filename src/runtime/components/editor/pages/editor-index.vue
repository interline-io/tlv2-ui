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
              <nuxt-link
                v-if="feed_version.id"
                :to="{name:editorRoutes.stations, params: {
                  feedKey:feed.onestop_id || 'unknown',
                  feedVersionKey:feed_version.id || 'unknown'
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
