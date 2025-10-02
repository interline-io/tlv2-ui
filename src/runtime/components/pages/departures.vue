<template>
  <div class="container">
    <tl-loading v-if="$apollo.loading" />
    <tl-msg-error v-else-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else-if="entities">
      <slot name="title">
        <tl-title title="Upcoming Departures" />
      </slot>

      <tl-map-viewer
        :stop-features="stopFeatures"
        :route-features="routeFeatures"
        :auto-fit="false"
        :zoom="16"
        :overlay="true"
        :center="searchOrEntityCoords"
      />

      <div v-for="ent of entities" :key="ent.id">
        <tl-msg-warning
          v-for="(alert,idx) of ent.alerts"
          :key="idx"
        >
          Agency Alert:
          <div v-for="tr of filterRTTranslations(alert.header_text)" :key="tr.text">
            {{ tr.text }}
          </div>
          <div v-for="tr of filterRTTranslations(alert.description_text)" :key="tr.text">
            {{ tr.text }}
          </div>
        </tl-msg-warning>
      </div>

      <tl-stop-departures
        :show-fallback-selector="false"
        :stop-ids="entityIds"
        :search-coords="searchOrEntityCoords"
        :search-radius="searchRadius"
      />
    </div>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'

const q = gql`
  fragment rs on RouteStop {
    route {
      id
    }
  }
  
  fragment alert on Alert {
    cause
    effect
    severity_level
    description_text {
      language
      text
    }
    header_text {
      language
      text
    }
    url {
      language
      text
    }
  }
  
  fragment ss on Stop {
    id
    onestop_id
    stop_id
    stop_name
    stop_url
    geometry
    alerts(active:true) {
      ...alert
    }
  }
  
  query ($where: StopFilter, $limit:Int=100) {
    entities: stops(limit: $limit, where: $where) {
      ...ss
      route_stops {
        ...rs
      }
    }
  }
  `

const routeQuery = gql`
  query ($ids:[Int!]) {
    routes: routes(ids: $ids) {
      id
      onestop_id
      route_long_name
      route_short_name
      route_type
      route_url
      route_id
      route_color
      geometry
      agency {
        agency_name
        id
        operator {
          onestop_id
        }
      }
  }
}
`

export default {
  apollo: {
    routes: {
      query: routeQuery,
      skip () { return this.servedRouteIds.length === 0 },
      variables () {
        return {
          ids: this.servedRouteIds
        }
      }
    },
    entities: {
      query: q,
      variables () {
        const q = {
          onestop_id: this.onestopId,
          location_type: 0
        }
        if (this.searchCoords) {
          q.near = {
            lon: this.searchCoords[0],
            lat: this.searchCoords[1],
            radius: this.searchRadius || 100
          }
        }
        return {
          where: q
        }
      }
    }
  },
  props: {
    onestopId: { type: String, default: '' },
    searchCoords: { type: Array, default () { return null } },
    searchRadius: { type: Number, default () { return 100 } }
  },
  data () {
    return {
      entities: [],
      routes: [],
      error: null
    }
  },
  computed: {
    searchOrEntityCoords () {
      return this.searchCoords || this.entities[0]?.geometry?.coordinates
    },
    stopFeatures () {
      const ret = []
      for (const i of this.allStops) {
        if (!i.geometry) {
          continue
        }
        ret.push({ type: 'Feature', id: i.id, geometry: i.geometry, properties: { class: 'stop', id: i.id } })
      }
      return ret
    },
    routeFeatures () {
      const ret = []
      let featid = 1
      for (const rs of this.routes) {
        let routeColor = rs.route_color
        if (routeColor && routeColor.substr(0, 1) !== '#') {
          routeColor = '#' + routeColor
        }
        featid++
        ret.push(
          {
            type: 'Feature',
            id: featid,
            geometry: rs.geometry,
            properties: {
              class: 'route',
              id: featid,
              generated: false,
              geometry_length: -1,
              headway_secs: 60,
              route_color: routeColor,
              route_long_name: rs.route_long_name,
              route_short_name: rs.route_short_name,
              route_type: rs.route_type,
              route_url: rs.route_url,
              route_id: rs.route_id
            }
          }
        )
      }
      return ret
    },
    allStops () {
      const ret = {}
      for (const ent of this.entities) {
        ret[ent.id] = ent
        if (ent.parent) {
          ret[ent.parent.id] = ent.parent
        }
        for (const child of ent.children || []) {
          ret[child.id] = child
        }
      }
      return Object.values(ret)
    },
    servedRouteIds () {
      const ret = {}
      for (const stop of this.allStops) {
        for (const rs of stop.route_stops || []) {
          ret[rs.route.id] = rs.route.id
        }
      }
      return Object.values(ret)
    },
    entityIds () {
      return this.allStops.map((s) => { return s.id })
    }
  },
  methods: {
    filterRTTranslations (v) {
      return v.filter((s) => { return !s.language.includes('html') })
    }
  }
}
</script>
