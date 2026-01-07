<template>
  <div>
    <table class="table is-fullwidth is-shaded">
      <thead>
        <th>Feed</th>
        <th>Versions</th>
      </thead>
      <tbody>
        <tr v-for="feed of feeds" :key="feed.id">
          <td>
            <tl-link route-key="feeds-feedKey" :to="{ params: { feedKey: feed.onestop_id } }">
              {{ feed.onestop_id }} <span v-if="feed.name">: {{ feed.name }}</span>
            </tl-link>
          </td>
          <td>{{ feed.feed_versions.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'

const props = withDefaults(defineProps<{
  feedIds?: number[]
  client?: string
}>(), {
  feedIds: () => [],
  client: 'default'
})

const feedQuery = gql`
  query($ids:[Int!]) {
    feeds(ids:$ids) {
      id
      onestop_id
      name
      feed_versions {
        id
        sha1
        name
      }
    }
  }
`

const { result } = useQuery(feedQuery, () => ({ ids: props.feedIds }), { clientId: props.client, fetchPolicy: 'no-cache' })
const feeds = computed(() => result.value?.feeds || [])
</script>
