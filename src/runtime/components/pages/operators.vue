<template>
  <div class="container">
    <slot name="title">
      <tl-title :title="staticTitle" :description="staticDescription" />
    </slot>

    <slot name="description" />

    <!-- key is to force update -->
    <tl-operators-table
      :key="adm0Name || 'default'"
      v-model:search="search"
      v-model:adm0-name="adm0Name"
      v-model:adm1-name="adm1Name"
      v-model:city-name="cityName"
      v-model:merged="merged"
      @clear="clearQuery"
    />

    <slot name="add-operator" />
  </div>
</template>

<script setup lang="ts">
/**
 * Operators Page Component
 *
 * This component provides a page for browsing and filtering operators.
 * It manages query parameters for filtering by location, search terms, and merge status.
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'nuxt/app'

// Composables
const route = useRoute()
const router = useRouter()

// Computed properties
const _filteringByOperatorLocation = computed<boolean>(() => {
  return !!(route.query.adm0_name || route.query.adm1_name || route.query.city_name)
})

const staticTitle = computed<string>(() => {
  return 'Browse all operators'
})

const staticDescription = computed<string>(() => {
  return 'Operators group together source feeds and other relevant data'
})

// Query parameter computed properties with getters and setters
const search = computed<string | undefined | null>({
  get () {
    return typeof route.query.search === 'string' ? route.query.search : undefined
  },
  set (v: string | undefined | null) {
    router.replace({ query: { ...route.query, search: v || undefined } })
  }
})

const adm0Name = computed<string | undefined | null>({
  get () {
    return typeof route.query.adm0_name === 'string' ? route.query.adm0_name : undefined
  },
  set (v: string | undefined | null) {
    router.replace({ query: { ...route.query, adm0_name: v || undefined } })
  }
})

const adm1Name = computed<string | undefined | null>({
  get () {
    return typeof route.query.adm1_name === 'string' ? route.query.adm1_name : undefined
  },
  set (v: string | undefined | null) {
    router.replace({ query: { ...route.query, adm1_name: v || undefined } })
  }
})

const cityName = computed<string | undefined | null>({
  get () {
    return typeof route.query.city_name === 'string' ? route.query.city_name : undefined
  },
  set (v: string | undefined | null) {
    router.replace({ query: { ...route.query, city_name: v || undefined } })
  }
})

const merged = computed<boolean | undefined>({
  get () {
    const value = route.query.merged
    return value === 'true' ? true : value === 'false' ? false : undefined
  },
  set (v: boolean | undefined) {
    const queryValue = v === undefined ? undefined : String(v)
    router.replace({ query: { ...route.query, merged: queryValue } })
  }
})

// Methods
function clearQuery (): void {
  router.replace({ query: {} })
}
</script>
