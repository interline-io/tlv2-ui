<template>
  <div>
    <h2 class="title is-4">
      Feed Admin
    </h2>

    <tl-apps-admin-feed :id="feedId" />

    <hr>

    <h3 class="title is-5">
      Feed Versions
    </h3>

    <t-notification v-if="error" variant="danger">
      {{ error.message }}
    </t-notification>

    <div v-if="loading" class="has-text-centered p-5">
      <t-loading active />
    </div>

    <table v-else-if="feedVersions.length" class="table is-fullwidth is-hoverable is-narrow">
      <thead>
        <tr>
          <th>Name</th>
          <th>SHA1</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="fv of feedVersions" :key="fv.id">
          <td>{{ fv.name || '(unnamed)' }}</td>
          <td>
            <code>{{ fv.sha1?.substring(0, 12) }}</code>
          </td>
          <td>
            <NuxtLink
              :to="`/admin/feeds/${feedId}/versions/${fv.id}`"
              class="button is-small"
            >
              Admin
            </NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else class="has-text-grey">
      No feed versions found.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'

const route = useRoute()
const feedId = computed(() => route.params.feedId?.toString() || '')

const feedVersionsQuery = gql`
  query ($feedId: Int!) {
    feeds(ids: [$feedId]) {
      feed_versions(limit: 50) {
        id
        name
        sha1
        description
      }
    }
  }
`

const { result, loading, error } = useQuery(
  feedVersionsQuery,
  () => ({ feedId: Number(feedId.value) }),
  { fetchPolicy: 'cache-and-network' }
)
const feedVersions = computed(() => result.value?.feeds?.[0]?.feed_versions || [])
</script>
