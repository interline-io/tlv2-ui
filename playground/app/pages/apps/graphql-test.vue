<template>
  <div class="container">
    <section class="section">
      <h1 class="title">
        GraphQL Test
      </h1>
      <p class="subtitle">
        Verify auth + GraphQL connectivity
      </p>

      <t-notification v-if="!user.loggedIn" variant="warning">
        Not logged in. Sign in to test authenticated requests.
      </t-notification>

      <div class="block buttons">
        <button class="button is-primary" :class="{ 'is-loading': meLoading }" @click="runMeQuery">
          Query me { }
        </button>
        <button class="button is-info" :class="{ 'is-loading': feedsLoading }" @click="runFeedsQuery">
          Query feeds { }
        </button>
      </div>

      <t-notification v-if="meErrorMsg" variant="danger">
        me: {{ meErrorMsg }}
      </t-notification>

      <div v-if="meData" class="block">
        <table class="table">
          <tbody>
            <tr>
              <th>ID</th>
              <td>{{ meData.id }}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{{ meData.name }}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{{ meData.email }}</td>
            </tr>
            <tr>
              <th>Roles</th>
              <td>{{ meData.roles?.join(', ') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <t-notification v-if="feedsErrorMsg" variant="danger">
        feeds: {{ feedsErrorMsg }}
      </t-notification>

      <div v-if="feedsData && feedsData.length" class="block">
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>ID</th>
              <th>onestop_id</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="feed in feedsData" :key="feed.id">
              <td>{{ feed.id }}</td>
              <td>{{ feed.onestop_id }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { useUser } from '../../../../src/runtime/composables/useUser'

const user = useUser()
const meEnabled = ref(false)
const feedsEnabled = ref(false)

const meQuery = gql`
  query {
    me {
      id
      name
      email
      roles
    }
  }
`

const feedsQuery = gql`
  query {
    feeds {
      id
      onestop_id
    }
  }
`

const { result: meResult, loading: meLoading, error: meError, refetch: meRefetch } = useQuery(meQuery, null, () => ({
  enabled: meEnabled.value,
  fetchPolicy: 'no-cache'
}))
const meData = computed(() => meResult.value?.me || null)
const meErrorMsg = computed(() => meError.value?.message || '')

const { result: feedsResult, loading: feedsLoading, error: feedsError, refetch: feedsRefetch } = useQuery(feedsQuery, null, () => ({
  enabled: feedsEnabled.value,
  fetchPolicy: 'no-cache'
}))
const feedsData = computed(() => feedsResult.value?.feeds || null)
const feedsErrorMsg = computed(() => feedsError.value?.message || '')

function runMeQuery () {
  if (meEnabled.value) {
    meRefetch()
  } else {
    meEnabled.value = true
  }
}

function runFeedsQuery () {
  if (feedsEnabled.value) {
    feedsRefetch()
  } else {
    feedsEnabled.value = true
  }
}
</script>
