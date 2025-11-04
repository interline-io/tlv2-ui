<template>
  <div
    :class="['navbar-item', 'has-dropdown', 'is-hoverable']"
  >
    <a class="navbar-link  is-arrowless">
      <o-input
        v-model="search"
        expanded
        style="width:160px;"
        type="text"
        :icon-right="search.length > 0 ? 'cancel' : 'magnify'"
        icon-right-clickable
        data-1p-ignore
        @icon-right-click="close"
        @keydown.esc="close"
      />
    </a>
    <div
      class="navbar-dropdown is-right"
    >
      <!-- Feeds -->
      <a v-if="loading" class="navbar-item">Loading...</a>

      <a v-else-if="search.length < minLength" class="navbar-item">Start typing</a>

      <a v-else-if="feedLinks.length === 0 && routeLinks.length === 0 && operatorLinks.length === 0" class="navbar-item">No results</a>

      <a v-for="item in feedLinks" :key="item.name" class="navbar-item">
        Feed:
        <nuxt-link :to="{ name: 'feeds-feedKey', params: { feedKey: item.onestop_id } }">
          {{ item.name || item.onestop_id }}
        </nuxt-link>
      </a>
      <hr v-if="feedLinks.length > 0" class="navbar-divider">

      <!-- Operators -->
      <a v-for="item in operatorLinks" :key="item.name" class="navbar-item">
        Operator:
        <nuxt-link :to="{ name: 'operators-operatorKey', params: { operatorKey: item.onestop_id } }">
          {{ item.name || item.onestop_id }}
        </nuxt-link>
      </a>
      <hr v-if="operatorLinks.length > 0" class="navbar-divider">

      <!-- Routes -->
      <a v-for="item in routeLinks" :key="item.name" class="navbar-item">
        Route:
        <nuxt-link :to="{ name: 'routes-routeKey', params: { routeKey: item.onestop_id } }">
          {{ [item.route_short_name, item.route_long_name].filter(Boolean).join(' ') }}
        </nuxt-link>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gql } from 'graphql-tag'
import { useDebounceFn } from '@vueuse/core'
import { ref, computed, watch, reactive, nextTick } from 'vue'
import { useLazyQuery } from '@vue/apollo-composable'

const minLength = 3
const asyncDebounceTime = 200
const search = ref('')
const operatorLinks = computed(() => {
  return result.value?.operators || []
})

const feedLinks = computed(() => {
  return result.value?.feeds || []
})

const routeLinks = computed(() => {
  return result.value?.routes || []
})

// Hover and close handlers

function close () {
  search.value = ''
}

////////////////////////////////
// Setup graphql

const query = gql`
query ($search: String!, $limit: Int=10) {
    feeds(limit: $limit, where:{search:$search}) {
        id
        name
        onestop_id
        search_rank
    }
    operators(limit: $limit, where:{search:$search, merged: true}) {
        onestop_id
        name
        short_name
        search_rank
    }
    routes(limit: $limit, where:{search:$search}) {
        id
        route_id
        route_short_name
        route_long_name
        onestop_id
        feed_onestop_id
        feed_version_sha1
        agency {
            id
            agency_name
        }
        search_rank
    }
}
`

const { result, loading, error, load, refetch } = useLazyQuery(query, {}, { clientId: 'transitland' })

function loadReload () {
  if (search.value.length < minLength) {
    result.value = []
    return
  }
  const vars = {
    search: search.value
  }
  console.log('loading...', vars)
  load(query, vars) || refetch(vars)
}

watch(search, useDebounceFn(loadReload, asyncDebounceTime))
</script>

<style scoped lang="scss">
.tl-nav-search-bar {
  .navbar-dropdown {
    width:500px;
  }
}
</style>
