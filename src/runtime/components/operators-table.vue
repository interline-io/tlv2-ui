<template>
  <div>
    <o-field
      grouped
      :label="filteringByOperatorLocation ? 'Filter by operator location' : 'Search by operator name or location'"
    >
      <tl-search-bar v-model="search" placeholder="e.g. Bay Area Rapid Transit" />

      <o-dropdown position="bottom-left" append-to-body aria-role="menu" trap-focus>
        <template #trigger="{ active }">
          <o-button label="Options" variant="primary" :icon-left="active ? 'menu-up' : 'menu-down'" />
        </template>

        <div aria-role="menu-item" style="padding:20px">
          <div class="field">
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
      <o-field v-if="adm0Name" expanded>
        <tl-tag attached closable aria-close-label="Close tag" @close="clearQuery">
          Country: {{ adm0Name }}
        </tl-tag>
      </o-field>
      <o-field v-if="adm1Name" expanded>
        <tl-tag attached closable aria-close-label="Close tag" @close="clearQuery">
          State/Province: {{ adm1Name }}
        </tl-tag>
      </o-field>
      <o-field v-if="cityName" expanded>
        <tl-tag attached closable aria-close-label="Close tag" @close="clearQuery">
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
                :label="row.other_places.filter((s) => { return s.city_name }).map((s) => { return s.city_name }).join(', ')"
                trigger-class="dashed"
              >
                {{ row.adm0_name }}
              </o-tooltip>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <tl-show-more v-if="entities.length >= limit" :limit="entities.length" @click="fetchMoreFn" />
    <o-loading v-model:active="loading" :full-page="false" />
  </div>
</template>

<script setup>
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { ref, watch, computed } from 'vue'

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

const nullString = function (v) {
  if (!v || v.length === 0) {
    return null
  }
  return v
}

const nullBool = function (v) {
  if (v === 'true') {
    return true
  } else if (v === 'false') {
    return false
  }
  return null
}

const props = defineProps({
  search: { type: String, default: null },
  limit: { type: Number, default: 100 },
  adm0Name: { type: String, default: null },
  adm1Name: { type: String, default: null },
  cityName: { type: String, default: null },
  merged: { type: Boolean, default: true }
})

// shadow props
const search = ref(props.search)
const limit = ref(props.limit)
const adm0Name = ref(props.adm0Name)
const adm1Name = ref(props.adm1Name)
const cityName = ref(props.cityName)
const merged = ref(props.mereged)

const emit = defineEmits([
  'update:search',
  'update:adm0Name',
  'update:adm1Name',
  'update:cityName',
  'update:merged',
  'clear'
])

watch(search, (v) => { emit('update:search', v) })
watch(adm0Name, (v) => { emit('update:adm0Name', v) })
watch(adm1Name, (v) => { emit('update:adm1Name', v) })
watch(cityName, (v) => { emit('update:cityName', v) })
watch(merged, (v) => { emit('update:merged', v) })

const { result, loading, error, fetchMore } = useQuery(
  query,
  () => ({
    search: nullString(search.value),
    adm0_name: nullString(adm0Name.value),
    adm1_name: nullString(adm1Name.value),
    city_name: nullString(cityName.value),
    limit: limit.value,
    merged: nullBool(merged.value)
  }))

const filteringByOperatorLocation = computed(() => {
  return adm0Name.value || adm1Name.value || cityName.value
})

const clearQuery = function () {
  emit('clear')
}

const entities = computed(() => result.value?.entities ?? [])

const operatorEntities = computed(() => {
  return (result.value?.entities ?? []).map((s) => {
    const entity = {
      name: s.name,
      short_name: s.short_name,
      agencies: s.agencies,
      onestop_id: s.onestop_id
    }
    let places = []
    for (const a of s.agencies || []) {
      for (const p of a.places || []) {
        places.push(p)
      }
    }
    places = places.sort(function (a, b) { return a.rank - b.rank })
    if (places.length > 0) {
      entity.adm0_name = places[0].adm0_name
      entity.adm1_name = places[0].adm1_name
      entity.city_name = places[0].city_name
    }
    entity.other_places = places
    return entity
  })
})

function fetchMoreFn() {
  const lastId = entities.value.length > 0 ? entities.value[entities.value.length - 1].id : 0
  fetchMore({
    variables: {
      after: lastId,
      limit: 100
    },
    updateQuery: (previousResult, { fetchMoreResult }) => {
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
