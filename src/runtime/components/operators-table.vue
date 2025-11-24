<template>
  <div>
    <o-field
      grouped
      :label="filteringByOperatorLocation ? 'Filter by operator location' : 'Search by operator name or location'"
    >
      <tl-search-bar v-model="search" placeholder="e.g. Bay Area Rapid Transit" />

      <o-dropdown position="bottom-left">
        <template #trigger="{ active }">
          <o-button label="Options" variant="primary" :icon-left="active ? 'menu-up' : 'menu-down'" />
        </template>

        <div role="menuitem" class="p-4">
          <div class="field">
            <!-- @vue-skip -->
            <o-checkbox v-model="merged">
              Group agencies by operator
            </o-checkbox>
          </div>

          <!-- <div class="field">
            <o-checkbox v-model="unmatched">
              Show operators without agency matches
            </o-checkbox>
          </div> -->
        </div>
      </o-dropdown>
    </o-field>

    <o-field>
      <o-field v-if="adm0Name" class="is-expanded">
        <tl-tag closable @close="clearQuery">
          Country: {{ adm0Name }}
        </tl-tag>
      </o-field>
      <o-field v-if="adm1Name" class="is-expanded">
        <tl-tag closable @close="clearQuery">
          State/Province: {{ adm1Name }}
        </tl-tag>
      </o-field>
      <o-field v-if="cityName" class="is-expanded">
        <tl-tag closable @close="clearQuery">
          City: {{ cityName }}
        </tl-tag>
      </o-field>
    </o-field>

    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>

    <div class="table-container">
      <table class="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>Operator Name (Short Name)</th>
            <th>City</th>
            <th>State / Province</th>
            <th>Country</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row of operatorEntities" :key="row.id">
            <td>
              <nuxt-link :to="{ name: 'operators-operatorKey', params: { operatorKey: row.onestop_id } }">
                {{ row.name }}
              </nuxt-link>
              <span v-if="row.short_name">&nbsp;({{ row.short_name }})</span>
            </td>
            <td>
              {{ row.city_name }}
            </td>
            <td>
              {{ row.adm1_name }}
            </td>
            <td>
              <o-tooltip
                :label="row.other_places.filter((s: Place) => { return s.city_name }).map((s: Place) => { return s.city_name }).join(', ')"
              >
                {{ row.adm0_name }}
              </o-tooltip>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <tl-show-more v-if="entities.length >= limit" :limit="entities.length" @show-more="fetchMoreFn" />
    <!-- @vue-skip -->
    <o-loading v-model:active="loading" :full-page="false" />
  </div>
</template>

<script setup lang="ts">
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { ref, watch, computed } from 'vue'

// Types
interface OperatorsTableResponse {
  entities: {
    id: number
    onestop_id: string
    name: string
    short_name?: string
    agencies?: {
      places?: {
        city_name?: string
        adm0_name?: string
        adm1_name?: string
        rank: number
      }[]
    }[]
  }[]
}

// Extract individual types from the response type
type Operator = OperatorsTableResponse['entities'][0]
type Agency = NonNullable<Operator['agencies']>[0]
type Place = NonNullable<Agency['places']>[0]

interface ProcessedOperator extends Operator {
  adm0_name?: string
  adm1_name?: string
  city_name?: string
  other_places: Place[]
}

interface QueryVariables {
  limit?: number
  after?: number
  search?: string | null
  merged?: boolean | null
  adm0_name?: string | null
  adm1_name?: string | null
  city_name?: string | null
}

const query = gql`
query ($limit: Int=100, $after: Int, $search: String, $merged: Boolean, $adm0_name: String, $adm1_name: String, $city_name: String) {
  entities: operators(after: $after, limit: $limit, where: {search: $search, merged: $merged, adm0_name: $adm0_name, adm1_name: $adm1_name, city_name: $city_name}) {
    id
    onestop_id
    name
    short_name
    agencies {
      places(where:{min_rank:0.2}) {
        city_name
        adm0_name
        adm1_name
        rank
      }
    }
  }
}
`

function nullString (v: string | undefined | null): string | null {
  if (!v || v.length === 0) {
    return null
  }
  return v
}

function nullBool (v: boolean | undefined): boolean | null {
  if (v === true) {
    return true
  } else if (v === false) {
    return false
  }
  return null
}

const props = withDefaults(defineProps<{
  search?: string | null | undefined
  limit?: number
  adm0Name?: string | null | undefined
  adm1Name?: string | null | undefined
  cityName?: string | null | undefined
  merged?: boolean
}>(), {
  search: null,
  limit: 100,
  adm0Name: null,
  adm1Name: null,
  cityName: null,
  merged: true
})

// shadow props
const search = ref<string | null>(props.search ?? null)
const limit = ref(props.limit)
const adm0Name = ref<string | null>(props.adm0Name ?? null)
const adm1Name = ref<string | null>(props.adm1Name ?? null)
const cityName = ref<string | null>(props.cityName ?? null)
const merged = ref<boolean>(props.merged)

interface Emits {
  'update:search': [value: string | null]
  'update:adm0Name': [value: string | null]
  'update:adm1Name': [value: string | null]
  'update:cityName': [value: string | null]
  'update:merged': [value: boolean]
  'clear': []
}

const emit = defineEmits<Emits>()

watch(search, (v) => { emit('update:search', v) })
watch(adm0Name, (v) => { emit('update:adm0Name', v) })
watch(adm1Name, (v) => { emit('update:adm1Name', v) })
watch(cityName, (v) => { emit('update:cityName', v) })
watch(merged, (v) => { emit('update:merged', v) })

const { result, loading: queryLoading, error, fetchMore } = useQuery<OperatorsTableResponse, QueryVariables>(
  query,
  () => ({
    search: nullString(search.value),
    adm0_name: nullString(adm0Name.value),
    adm1_name: nullString(adm1Name.value),
    city_name: nullString(cityName.value),
    limit: limit.value,
    merged: nullBool(merged.value)
  }))

const loading = computed<boolean>(() => queryLoading.value ?? false)

const filteringByOperatorLocation = computed<boolean>(() => {
  return !!(adm0Name.value || adm1Name.value || cityName.value)
})

function clearQuery (): void {
  emit('clear')
}

const entities = computed<Operator[]>(() => result.value?.entities ?? [])

const operatorEntities = computed<ProcessedOperator[]>(() => {
  return (result.value?.entities ?? []).map((s): ProcessedOperator => {
    const entity: ProcessedOperator = {
      id: s.id,
      name: s.name,
      short_name: s.short_name,
      agencies: s.agencies,
      onestop_id: s.onestop_id,
      other_places: []
    }
    let places: Place[] = []
    for (const a of s.agencies || []) {
      for (const p of a.places || []) {
        places.push(p)
      }
    }
    places = places.sort((a, b) => a.rank - b.rank)
    if (places.length > 0) {
      const firstPlace = places[0]
      if (firstPlace) {
        entity.adm0_name = firstPlace.adm0_name
        entity.adm1_name = firstPlace.adm1_name
        entity.city_name = firstPlace.city_name
      }
    }
    entity.other_places = places
    return entity
  })
})

function fetchMoreFn (): void {
  const lastEntity = entities.value.length > 0 ? entities.value[entities.value.length - 1] : undefined
  const lastId = lastEntity?.id ?? 0
  fetchMore({
    variables: {
      after: lastId,
      limit: 100
    },
    updateQuery: (previousResult: OperatorsTableResponse, { fetchMoreResult }: { fetchMoreResult?: OperatorsTableResponse }) => {
      if (!fetchMoreResult) { return previousResult }
      return {
        ...previousResult,
        entities: [
          ...previousResult.entities,
          ...fetchMoreResult.entities
        ]
      }
    }
  })
}
</script>
