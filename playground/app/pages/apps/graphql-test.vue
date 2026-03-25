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

      <div class="block">
        <button class="button is-primary" :class="{ 'is-loading': loading }" @click="runQuery">
          Query me { }
        </button>
      </div>

      <t-notification v-if="errorMsg" variant="danger">
        {{ errorMsg }}
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { useUser } from '#imports'

const user = useUser()
const enabled = ref(false)

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

const { result, loading, error, refetch } = useQuery(meQuery, null, () => ({
  enabled: enabled.value,
  fetchPolicy: 'no-cache'
}))
const meData = computed(() => result.value?.me || null)
const errorMsg = computed(() => error.value?.message || '')

function runQuery () {
  if (enabled.value) {
    refetch()
  } else {
    enabled.value = true
  }
}
</script>
