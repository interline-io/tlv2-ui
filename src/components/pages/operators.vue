<template>
  <div class="container">
    <Title>{{staticTitle }}</Title>
    <Meta name="description" :content="staticDescription" />
    <Meta name="twitter:title" :content="staticTitle" />
    <Meta name="twitter:description" :content="staticDescription" />
    <Meta name="og:title" :content="staticTitle" />
    <Meta name="og:description" :content="staticDescription" />

    <slot name="nav" />

    <slot name="title">
      <h1 class="title">
        Operators
      </h1>
    </slot>

    <slot name="description" />

    <div>
      <o-field grouped :label="filteringByOperatorLocation ? 'Filter by operator location' : 'Search by operator name or location'">
        <tl-search-bar v-model="search" placeholder="e.g. Bay Area Rapid Transit" />

        <o-dropdown position="bottom-left" append-to-body aria-role="menu" trap-focus>
          <template #trigger="{ active }">
            <o-button label="Options" variant="primary" :icon-left="active ? 'menu-up' : 'menu-down'" />
          </template>

          <o-dropdown-item aria-role="menu-item" custom>
            <div class="field">
              <o-checkbox v-model="merged">
                Group agencies by operator
              </o-checkbox>
            </div>

            <div class="field">
              <o-checkbox v-model="unmatched">
                Show operators without agency matches
              </o-checkbox>
            </div>
          </o-dropdown-item>
        </o-dropdown>
      </o-field>

      <o-field>
        <o-field v-if="filteringByOperatorLocation" expanded>
          <tl-tag attached closable aria-close-label="Close tag" @close="clearQuery">
            {{ [$route.query.adm0_name, $route.query.adm1_name, $route.query.city_name].filter(n => n).join(' / ') }}
          </tl-tag>
        </o-field>
        <o-field v-else-if="$route.query.search" expanded>
          <tl-tag attached closable aria-close-label="Close tag" @close="clearQuery">
            {{ $route.query.search }}
          </tl-tag>
        </o-field>
      </o-field>

      <o-table :data="entityPageFlat" :striped="true" :loading="$apollo.loading">
        <!-- TODO: fix sorting -->
        <o-table-column v-slot="props" field="name" label="Operator Name (Short Name)">
          <nuxt-link :to="{ name: 'operators-onestop_id', params: { onestop_id: props.row.onestop_id } }">
            {{ props.row.name }}
          </nuxt-link>
          <span v-if="props.row.short_name">&nbsp;({{ props.row.short_name }})</span>
        </o-table-column>
        <o-table-column v-slot="props" field="city_name" label="City" :width="200">
          {{ props.row.city_name }}
        </o-table-column>
        <o-table-column v-slot="props" field="adm1_name" label="State/Province" :width="200">
          {{ props.row.adm1_name }}
        </o-table-column>
        <o-table-column v-slot="props" field="adm0_name" label="Country" :width="260">
          <o-tooltip
            :label="props.row.other_places.filter((s) => { return s.city_name }).map((s) => { return s.city_name }).join(', ')"
            dashed>
            {{ props.row.adm0_name }}
          </o-tooltip>
        </o-table-column>
      </o-table>
      <tl-show-more v-if="entities.length === limit || hasMore" :limit="entities.length" @click="showAll" />
    </div>

    <slot name="add-operator" />
  </div>
</template>

<script>
import gql from 'graphql-tag'
import TableViewerMixin from '../table-viewer-mixin'

const q = gql`
query ($limit: Int, $after: Int, $search: String, $merged: Boolean, $adm0_name: String, $adm1_name: String, $city_name: String) {
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

export default {
  mixins: [TableViewerMixin],
  data() {
    return {
      search: this.$route.query.search,
      adm0_name: this.$route.query.adm0_name,
      adm1_name: this.$route.query.adm1_name,
      city_name: this.$route.query.city_name,
      merged: true,
      unmatched: true
    }
  },
  apollo: {
    entities: {
      query: q,
      error(e) { this.error = e },
      variables() {
        return {
          search: this.search,
          adm0_name: this.adm0_name,
          adm1_name: this.adm1_name,
          city_name: this.city_name,
          merged: this.merged,
          limit: this.limit
        }
      }
    }
  },
  computed: {
    filteringByOperatorLocation() {
      return (this.$route.query.adm0_name || this.$route.query.adm1_name || this.$route.query.city_name)
    },
    entityPageFlat() {
      return this.entityPage.map((s) => {
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
    },
    staticTitle () {
      return 'Browse all operators'
    },
    staticDescription () {
      return 'Transitland uses operators to group together source feeds and other relevant data'
    }
  },
  methods: {
    clearQuery() {
      this.search = ''
      this.adm0_name = null
      this.adm1_name = null
      this.city_name = null
      this.$router.push({ name: 'operators', query: {} })
    },
    onAutocomplete(a, b) {
      const q = {}
      q[a] = b
      this.$router.push({ name: 'operators', query: q })
      this.page = 1
    }
  }
}
</script>
