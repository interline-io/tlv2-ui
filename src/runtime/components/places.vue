<template>
  <div>
    <slot name="title">
      <tl-title title="Browse places" />
    </slot>

    <slot name="description" />

    <div class="field">
      <label for="sortBy" class="label">Sort places by</label>
      <o-radio v-model="sortBy" native-value="alphabetical">
        Alphabetical
      </o-radio>
      <o-radio v-model="sortBy" native-value="count">
        Count
      </o-radio>
    </div>

    <o-loading v-model:active="$apollo.loading" :full-page="false" />

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

<script>
import { gql } from 'graphql-tag'

const q = gql`
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

export default {
  apollo: {
    places: {
      client: 'transitland',
      query: q,
      variables() {
        const v = {
          level: this.placeLevel,
          include_operators: this.placeLevelInt > 0
        }
        const w = {}
        if (this.adm0) {
          w.adm0_name = this.adm0
        }
        if (this.adm1) {
          w.adm1_name = this.adm1
        }
        if (this.city) {
          w.city_name = this.city
        }
        v.where = w
        return v
      }
    }
  },
  props: {
    placeLevel: { type: String, default: 'ADM0' },
    adm0: { type: String, default: null },
    adm1: { type: String, default: null },
    city: { type: String, default: null }
  },
  data() {
    return {
      places: [],
      sortBy: 'alphabetical'
    }
  },
  computed: {
    placeLevelInt() {
      if (this.placeLevel === 'ADM0_ADM1') {
        return 1
      }
      if (this.placeLevel === 'ADM0_ADM1_CITY') {
        return 2
      }
      return 0
    },
    allOperators() {
      const ret = {}
      for (const p of this.places) {
        for (const o of p.operators || []) {
          ret[o.onestop_id] = o
        }
      }
      return Object.values(ret).sort((a, b) => {
        const an = a.name || a.short_name
        const bn = b.name || b.short_name
        return an.localeCompare(bn)
      })
    },
    sortedPlaces() {
      return this.places.slice(0).sort((a, b) => {
        if (this.sortBy === 'count') {
          return b.count - a.count
        } else if (this.sortBy === 'alphabetical') {
          return a.name > b.name
        }
        return false
      })
    },
    staticTitle() {
      return ''
    },
    staticDescription() {
      return ''
    }
  }
}

</script>
