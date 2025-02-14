<template>
  <form @submit.prevent>
    <div class="field has-addons expandy-form">
      <div class="control">
        <o-autocomplete
          :expanded="focused"
          :data="data"
          max-height="600px"
          placeholder="Search operators, feeds, and routes..."
          :loading="isFetching"
          :clearable="true"
          icon="magnify"
          @focus="focus"
          @blur="blur"
          @typing="typing"
          @select="option => selected = option"
          @keydown.esc.native="clearSearch"
        >
          <template #default="props">
            {{ props.option.name }}
            <span class="is-pulled-right">{{ props.option.type }}</span>
          </template>
        </o-autocomplete>
      </div>
      <!-- <div class="control">
        <button v-if="focused" class="button is-primary" @click="goToSearch">
          Search
        </button>
      </div> -->
    </div>
  </form>
</template>

<script>
import { gql } from 'graphql-tag'
import { useDebounceFn } from '@vueuse/core'

const q = gql`
query ($search: String!) {
    feeds(limit: 10, where:{search:$search}) {
        id
        name
        onestop_id
        search_rank
    }
    operators(limit: 10, where:{search:$search, merged: true}) {
        onestop_id
        name
        short_name
        search_rank
    }
    routes(limit: 10, where:{search:$search}) {
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
    # stops(limit: 10, where:{search:$search}) {
    #     id
    #     stop_id
    #     stop_name
    #     onestop_id
    #     feed_onestop_id
    #     feed_version_sha1
    #     route_stops(limit:1) {
    #         agency {
    #             id
    #             agency_id
    #             agency_name
    #         }
    #     }
    #     search_rank
    # }
}
`

const asyncDebounceTime = 200

export default {
  emits: ['blur', 'focus'],
  data () {
    return {
      search: '',
      data: [],
      isFetching: false,
      focused: false,
      selected: null
    }
  },
  watch: {
    selected () {
      this.$emit('blur')
      const key = this.selected ? this.selected.type : null
      const ent = this.selected.entity
      if (!key) {
        return
      }
      if (key === 'Feed') {
        this.$router.push({ name: 'feeds-feedKey', params: { feedKey: ent.onestop_id } })
      } else if (key === 'Operator') {
        this.$router.push({ name: 'operators-operatorKey', params: { operatorKey: ent.onestop_id } })
      } else if (key === 'Route') {
        this.$router.push($filters.makeRouteLink(ent.onestop_id, ent.feed_onestop_id, ent.feed_version_sha1, ent.route_id, ent.id, false))
      } else if (key === 'Stop') {
        this.$router.push($filters.makeStopLink(ent.onestop_id, ent.feed_onestop_id, ent.feed_version_sha1, ent.stop_id, ent.id, false))
      }
    }
  },
  methods: {
    clearSearch () {
      this.$emit('blur')
      this.search = ''
    },
    getAsyncData: useDebounceFn(function (name) {
      if (!name.length) {
        this.data = []
        return
      }
      this.isFetching = true
      const client = this.$apollo.getClient()
      return client
        .query({
          query: q,
          variables: {
            search: name
          }
        })
        .then(({ data }) => {
          const ret = []
          for (const i of data.feeds || []) {
            let name = i.onestop_id
            if (i.name) {
              name = name + ': ' + i.name
            }
            ret.push({
              route: 'feeds-feedKey',
              entity: i,
              type: 'Feed',
              name,
              rank: (1 + i.search_rank) * 1000,
              link: { name: 'feeds-feedKey', params: { feedKey: i.onestop_id } }
            })
          }
          for (const i of data.operators || []) {
            ret.push({
              route: 'operators-operatorKey',
              entity: i,
              type: 'Operator',
              name: i.name || i.short_name,
              rank: (1 + i.search_rank) * 100,
              link: { name: 'operators-operatorKey', params: { operatorKey: i.onestop_id } }
            })
          }
          for (const i of data.routes || []) {
            ret.push({
              route: 'routes-routeKey',
              entity: i,
              type: 'Route',
              name: `${i.agency.agency_name}: ${i.route_short_name} ${i.route_long_name}`,
              rank: (1 + i.search_rank) * 10,
              link: this.$filters.makeRouteLink(i.onestop_id, i.feed_onestop_id, i.feed_version_sha1, i.route_id, i.id, false)
            })
          }
          for (const i of data.stops || []) {
            let name = ''
            if (i.route_stops.length > 0) {
              name = i.route_stops[0].agency.agency_name + ': ' + i.stop_name
            } else {
              continue
            }
            ret.push({
              route: 'stops-stop',
              entity: i,
              type: 'Stop',
              name,
              rank: (1 + i.search_rank),
              link: this.$filters.makeStopLink(i.onestop_id, i.feed_onestop_id, i.feed_version_sha1, i.route_id, i.id, false)
            })
          }
          this.data = ret.sort(function (a, b) { return b.rank - a.rank })
          this.isFetching = false
        })
    }, asyncDebounceTime),
    typing (val) {
      this.search = val
      return this.getAsyncData(val)
    },
    selectOrSearch () {
      if (typeof this.selected !== 'undefined') {
        this.selected()
      } else {
        this.goToSearch()
      }
    },
    goToSearch () {
      this.$emit('blur')
      this.$router.push({ name: 'search', query: { q: this.search } })
      this.clearSearch()
    },
    focus () {
      this.focused = true
      this.$emit('focus')
    },
    blur () {
      this.focused = false
      this.$emit('blur')
    }
  }
}
</script>

<style scoped>
.expandy-form {
  flex: 1 0 auto;
}
</style>
