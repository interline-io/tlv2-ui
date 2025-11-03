<template>
  <div>
    <slot name="title">
      <tl-title :title="staticTitle" :description="staticDescription" />
    </slot>

    <slot name="description" />
    <div v-if="sortedPlaces.length > 1 && showSortBy" class="field">
      <label for="sortBy" class="label">Sort places by</label>
      <o-radio v-model="sortBy" native-value="alphabetical">
        Alphabetical
      </o-radio>
      <o-radio v-model="sortBy" native-value="count">
        Count
      </o-radio>
    </div>

    <o-loading v-model:active="loading" :full-page="false" />

    <p
      v-for="place of sortedPlaces"
      :key="place.adm0_name"
      class="content"
    >
      <template v-if="(placeLevelInt > 1) ? (place.adm0_name && place.adm1_name && place.city_name) : true">
        <nuxt-link to="/places">
          <o-icon icon="earth" title="earth" size="small" />
        </nuxt-link> /
        <nuxt-link :to="{ name: 'places-adm0', params: { adm0: place.adm0_name } }">
          {{ place.adm0_name }}
        </nuxt-link>
        <template v-if="placeLevelInt > 0">
          /
          <nuxt-link :to="{ name: 'places-adm0-adm1', params: { adm0: place.adm0_name, adm1: place.adm1_name } }">
            {{
              place.adm1_name }}
          </nuxt-link>
        </template>
        <template v-if="placeLevelInt > 1">
          /
          <nuxt-link
            :to="{ name: 'places-adm0-adm1-city', params: { adm0: place.adm0_name, adm1: place.adm1_name, city: place.city_name || 'asd' } }"
          >
            {{ place.city_name }}
          </nuxt-link>
        </template>
                &nbsp; <span class="tag">{{ place.count?.toLocaleString() }} operators</span>
      </template>
      <template v-else-if="sortedPlaces.length == 1">
        <!-- if there is only one adm0/adm1 record to display -->
        <nuxt-link :to="{ name: 'places-adm0', params: { adm0: place.adm0_name } }">
          {{ place.adm0_name }}
        </nuxt-link> /
        <nuxt-link :to="{ name: 'places-adm0-adm1', params: { adm0: place.adm0_name, adm1: place.adm1_name } }">
          {{ place.adm1_name }}
        </nuxt-link>
        &nbsp; <span class="tag">{{ place.count?.toLocaleString() }} operators</span>
      </template>
    </p>

    <h3 v-if="placeLevelInt > 1" class="is-3 title">
      Operators
    </h3>
    <p class="content">
      <ul v-if="placeLevelInt > 1">
        <li
          v-for="operator of allOperators"
          :key="operator.onestop_id"
          class="pl-4"
        >
          <nuxt-link :to="{ name: 'operators-operatorKey', params: { operatorKey: operator.onestop_id } }">
            {{ operator.name }}
            <template v-if="operator.short_name">
              ({{ operator.short_name }})
            </template>
          </nuxt-link>
        </li>
      </ul>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
// @ts-ignore - #imports is a Nuxt virtual module
import { createError } from '#imports'

// Types
interface PlaceResponse {
  adm0_name?: string
  adm1_name?: string
  city_name?: string
  count?: number
  operators?: {
    onestop_id: string
    name: string
    short_name?: string
  }[]
}

// Extract individual types from the response type
type Place = PlaceResponse
type Operator = NonNullable<PlaceResponse['operators']>[0]

interface PlaceFilter {
  adm0_name?: string
  adm1_name?: string
  city_name?: string
}

interface QueryVariables {
  level: string
  where: PlaceFilter
  include_operators: boolean
}

// Props
const props = withDefaults(defineProps<{
  placeLevel?: string
  adm0?: string | null
  adm1?: string | null
  city?: string | null
  showSortBy?: boolean
}>(), {
  placeLevel: 'ADM0',
  adm0: null,
  adm1: null,
  city: null,
  showSortBy: true
})

// GraphQL Query
const PLACES_QUERY = gql`
  query($level: PlaceAggregationLevel, $where: PlaceFilter, $include_operators: Boolean!) {
    places(level: $level, where: $where) {
      adm0_name
      adm1_name
      city_name
      count
      operators @include(if: $include_operators) {
        onestop_id
        name
        short_name
      }
    }
  }
`

// Reactive data
const sortBy = ref<'alphabetical' | 'count'>('alphabetical')

// Computed properties
const placeLevelInt = computed<number>(() => {
  if (props.placeLevel === 'ADM0_ADM1') {
    return 1
  }
  if (props.placeLevel === 'ADM0_ADM1_CITY') {
    return 2
  }
  return 0
})

const queryVariables = computed<QueryVariables>(() => {
  const variables: QueryVariables = {
    level: props.placeLevel || 'ADM0',
    include_operators: placeLevelInt.value > 0,
    where: {}
  }

  if (props.adm0) {
    variables.where.adm0_name = props.adm0
  }
  if (props.adm1) {
    variables.where.adm1_name = props.adm1
  }
  if (props.city) {
    variables.where.city_name = props.city
  }

  return variables
})

// Apollo Query
const { result, loading } = useQuery<{ places: PlaceResponse[] }>(
  PLACES_QUERY,
  queryVariables,
  {
    clientId: 'transitland'
  }
)

const places = computed<Place[]>(() => result.value?.places || [])

// Watch for empty places and throw 404 error
watch([places, loading], ([newPlaces, isLoading]) => {
  // Only check after loading is complete and if we have query filters
  if (!isLoading && (props.adm0 || props.adm1 || props.city)) {
    if (newPlaces.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Place not found',
        fatal: true
      })
    }
  }
})

const placeTitleName = computed<string>(() => {
  if (props.city && props.adm1 && props.adm0) {
    return `${props.city}, ${props.adm1}, ${props.adm0}`
  } else if (props.adm1 && props.adm0) {
    return `${props.adm1}, ${props.adm0}`
  } else if (props.adm0) {
    return props.adm0
  }
  return ''
})

const staticDescription = computed<string>(() => {
  if (placeTitleName.value?.length > 0) {
    return `Find transit operators and source data feeds in ${placeTitleName.value}`
  }
  return 'Find transit operators and source data feeds'
})

const staticTitle = computed<string>(() => {
  if (placeTitleName.value) {
    return `Browse places: ${placeTitleName.value}`
  }
  return 'Browse places'
})

const allOperators = computed<Operator[]>(() => {
  const operatorMap: Record<string, Operator> = {}

  for (const place of places.value) {
    for (const operator of place.operators || []) {
      operatorMap[operator.onestop_id] = operator
    }
  }

  return Object.values(operatorMap).sort((a, b) => {
    const nameA = a.name || a.short_name || ''
    const nameB = b.name || b.short_name || ''
    return nameA.localeCompare(nameB)
  })
})

const sortedPlaces = computed<Place[]>(() => {
  return [...places.value].sort((a, b) => {
    if (sortBy.value === 'count') {
      return (b.count || 0) - (a.count || 0)
    } else if (sortBy.value === 'alphabetical') {
      // Sort by the most specific available name for the place level
      const getPlaceName = (place: Place): string => {
        if (placeLevelInt.value > 1 && place.city_name) {
          return place.city_name
        } else if (placeLevelInt.value > 0 && place.adm1_name) {
          return place.adm1_name
        } else {
          return place.adm0_name || ''
        }
      }

      const nameA = getPlaceName(a)
      const nameB = getPlaceName(b)
      return nameA.localeCompare(nameB)
    }
    return 0
  })
})
</script>
