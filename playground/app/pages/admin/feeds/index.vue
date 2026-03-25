<template>
  <div>
    <h2 class="title is-4">
      Feeds
    </h2>

    <t-notification v-if="error" variant="danger">
      {{ error.message }}
    </t-notification>

    <div v-if="loading" class="has-text-centered p-5">
      <t-loading active />
    </div>

    <table v-else-if="feeds.length" class="table is-fullwidth is-hoverable is-striped">
      <thead>
        <tr>
          <th>Name</th>
          <th>Onestop ID</th>
          <th>Versions</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <template v-for="feed of feeds" :key="feed.id">
          <tr>
            <td>{{ feed.name || '(unnamed)' }}</td>
            <td>
              <code>{{ feed.onestop_id }}</code>
            </td>
            <td>{{ feed.feed_versions?.length || 0 }}</td>
            <td>
              <NuxtLink
                :to="`/admin/feeds/${feed.id}`"
                class="button is-small"
              >
                Admin
              </NuxtLink>
            </td>
          </tr>
          <!-- Nested feed versions -->
          <tr
            v-for="fv of feed.feed_versions || []"
            :key="fv.id"
            class="is-size-7"
          >
            <td class="pl-5">
              <t-icon icon="file-outline" size="small" class="mr-1" />
              {{ fv.name || fv.sha1?.substring(0, 8) }}
            </td>
            <td>
              <code>{{ fv.sha1?.substring(0, 12) }}</code>
            </td>
            <td />
            <td>
              <NuxtLink
                :to="`/admin/feeds/${feed.id}/versions/${fv.id}`"
                class="button is-small"
              >
                Admin
              </NuxtLink>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <p v-else class="has-text-grey">
      No feeds found.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'

const feedsQuery = gql`
  query {
    feeds(limit: 100) {
      id
      name
      onestop_id
      feed_versions(limit: 10) {
        id
        name
        sha1
      }
    }
  }
`

const { result, loading, error } = useQuery(feedsQuery, null, { fetchPolicy: 'cache-and-network' })
const feeds = computed(() => result.value?.feeds || [])
</script>
