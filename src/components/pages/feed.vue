<template>
  <div>
    <div v-if="$apollo.loading" class="is-loading" />
    <div v-else-if="entity">
      <slot name="nav" :entity="entity">
        <nav class="breadcrumb">
          <ul>
            <li>
              <nuxt-link :to="{name:'feeds'}">
                Source Feeds
              </nuxt-link>
            </li>
            <li>
              <nuxt-link :to="{name: 'feeds-feed', params:{feed:$route.params.feed}}">
                {{ $route.params.feed }}
              </nuxt-link>
            </li>
          </ul>
        </nav>
      </slot>

      <h1 class="title">
        {{ entity.spec.toUpperCase() }} feed: {{ operatorNames }}
      </h1>

      <slot name="description">
        <div class="content">
          {{ staticDescription }}
        </div>
      </slot>

      <div class="columns">
        <div class="column is-three-quarters">
          <table class="table is-borderless property-list">
            <tr>
              <td>
                <b-tooltip dashed label="A globally unique identifier for this feed">
                  Onestop ID
                </b-tooltip>
              </td>
              <td>
                <code>{{ onestopId }}</code>
              </td>
            </tr>
            <tr>
              <td>
                <b-tooltip dashed label="Data specification or format for this feed">
                  Format
                </b-tooltip>
              </td>
              <td>{{ entity.spec.toUpperCase() }}</td>
            </tr>

            <tr v-if="displayUrls">
              <td>URLs</td>
              <td>
                <ul>
                  <li v-if="entity.urls.static_current">
                    Current Static GTFS: <code>{{ entity.urls.static_current }}</code>
                  </li>
                  <li v-if="entity.urls.static_planned && entity.urls.static_planned.length > 0">
                    Future Static GTFS: <code>{{ entity.urls.static_planned }}</code>
                  </li>
                  <li v-if="entity.urls.static_historic">
                    <div v-for="(k,i) of entity.urls.static_historic" :key="i">
                      Historic GTFS: <code>{{ k }}</code>
                    </div>
                  </li>
                  <li v-if="entity.urls.realtime_vehicle_positions">
                    GTFS Realtime Vehicle Positions: <code>{{ entity.urls.realtime_vehicle_positions }}</code>
                  </li>
                  <li v-if="entity.urls.realtime_trip_updates">
                    GTFS Realtime Trip Updates: <code>{{ entity.urls.realtime_trip_updates }}</code>
                  </li>
                  <li v-if="entity.urls.realtime_alerts">
                    GTFS Realtime Alerts: <code>{{ entity.urls.realtime_alerts }}</code>
                  </li>
                </ul>
              </td>
            </tr>

            <tr>
              <td>
                <b-tooltip dashed label="Last time a fetch successfully returned valid GTFS data">
                  Last Fetch
                </b-tooltip>
              </td>
              <td>
                <template v-if="lastSuccessfulFetch && lastSuccessfulFetch.fetched_at">
                  {{ lastSuccessfulFetch.fetched_at | formatDate }} ({{ lastSuccessfulFetch.fetched_at | fromNow }})
                </template>
                <template v-else>
                  Unknown
                </template>
              </td>
            </tr>

            <tr v-if="lastFetch && lastFetch.fetch_error">
              <td>
                <b-tooltip dashed label="Error message from last fetch attempt">
                  Fetch Error
                </b-tooltip>
              </td>
              <td>
                <b-message class="is-danger" has-icon>
                  {{ lastFetch.fetch_error }}
                </b-message>
              </td>
            </tr>

            <tr v-if="entity.authorization && entity.authorization.type">
              <td>Authorization</td>
              <td>
                <ul>
                  <li v-if="entity.authorization.type">
                    Type: {{ entity.authorization.type }}
                  </li>
                  <li v-if="entity.authorization.param_name">
                    Parameter Name: {{ entity.authorization.param_name }}
                  </li>
                  <li v-if="entity.authorization.info_url">
                    Info URL: <code>{{ entity.authorization.info_url }}</code>
                  </li>
                </ul>
              </td>
            </tr>

            <tr v-if="displayLicense">
              <td>License</td>
              <td>
                <ul>
                  <li v-if="entity.license.url">
                    License URL: <code>{{ entity.license.url }}</code>
                  </li>
                  <li v-if="entity.license.spdx_identifier">
                    License Identifier: {{ entity.license.spdx_identifier }}
                  </li>
                  <li v-if="entity.license.use_without_attribution">
                    Use allowed without attribution: {{ entity.license.use_without_attribution | capitalize }}
                  </li>
                  <li v-if="entity.license.share_alike_optional">
                    Share-alike optional: {{ entity.license.share_alike_optional | capitalize }}
                  </li>
                  <li v-if="entity.license.commercial_use_allowed">
                    Commercial use allowed: {{ entity.license.commercial_use_allowed | capitalize }}
                  </li>
                  <li v-if="entity.license.create_derived_product">
                    Creating derived products allowed: {{ entity.license.create_derived_product | capitalize }}
                  </li>
                  <li v-if="entity.license.redistribute">
                    Redistribution allowed: {{ entity.license.redistribute | capitalize }}
                  </li>
                  <li v-if="entity.license.attribution_text">
                    Required attribution text: {{ entity.license.attribution_text }}
                  </li>
                  <li v-if="entity.license.attribution_instructions" class="content">
                    Attribution instructions: <blockquote>{{ entity.license.attribution_instructions }}</blockquote>
                  </li>
                </ul>
              </td>
            </tr>

            <tr v-if="entity.languages">
              <td>Languages</td>
              <td>{{ entity.languages }}</td>
            </tr>
          </table>
        </div>

        <slot name="edit-feed" :entity="entity" />
      </div>

      <!-- TODO: Operators component -->
      <div v-if="showOperators">
        <hr>
        <h4 class="title is-4">
          Operator(s) Associated with this Feed
        </h4>
        <b-tabs type="is-boxed" :animated="false">
          <b-tab-item label="Operators">
            <b-message v-if="!entity.associated_operators || (entity.associated_operators && entity.associated_operators.length === 0)">
              There are no operators associated with this feed.
            </b-message>
            <b-message
              v-for="(operator,i) of entity.associated_operators"
              :key="i"
              type="is-success"
              has-icon
              icon="information"
              :closable="false"
            >
              <div class="columns">
                <div class="column is-8">
                  <p>
                    This feed is associated with the operator record with Onestop ID of
                    <code>{{ operator.onestop_id }}</code> See this operator for more metadata related to this feed and to explore routes, stops, and other data imported from this feed.
                  </p>
                </div>
                <div class="column is-4 has-text-right">
                  <nuxt-link class="button is-primary" :to="{name:'operators-onestop_id', params:{onestop_id:operator.onestop_id}}">
                    View Operator Record
                  </nuxt-link>
                </div>
              </div>
            </b-message>
          </b-tab-item>
        </b-tabs>
      </div>

      <hr>

      <div v-if="entity.spec == 'GTFS'">
        <h4 class="title is-4">
          Archived Feed Versions
        </h4>

        <b-tabs v-model="activeTab" type="is-boxed" :animated="false" @input="setTab">
          <b-tab-item label="Versions">
            <b-table
              :data="entity.feed_versions"
              :striped="true"
              :paginated="true"
              :pagination-simple="true"
              sort-icon="menu-up"
            >
              <b-table-column
                v-slot="props"
                :sortable="true"
                field="fetched_at"
                label="Fetched"
              >
                <template v-if="props.row.fetched_at">
                  {{ props.row.fetched_at | formatDate }} ({{ props.row.fetched_at | fromNow }})
                </template>
                <template v-else>
                  Unknown
                </template>
              </b-table-column>
              <b-table-column v-slot="props" :sortable="true" field="sha1" label="SHA1">
                <nuxt-link
                  :to="{name: 'feeds-feed-versions-version', params: {feed: entity.onestop_id, version: props.row.sha1}}"
                >
                  {{ props.row.sha1.substr(0,6) }}…
                </nuxt-link>
              </b-table-column>
              <b-table-column
                v-slot="props"
                :sortable="true"
                field="earliest_calendar_date"
                label="Earliest date"
              >
                {{ props.row.earliest_calendar_date.substr(0,10) }}
              </b-table-column>
              <b-table-column
                v-slot="props"
                :sortable="true"
                field="latest_calendar_date"
                label="Latest date"
              >
                {{ props.row.latest_calendar_date.substr(0,10) }}
              </b-table-column>
              <b-table-column v-slot="props" field="feed_version_gtfs_import" label="Imported">
                <template v-if="props.row.feed_version_gtfs_import">
                  <b-tooltip
                    v-if="props.row.feed_version_gtfs_import.schedule_removed"
                    label="Agencies, stops, and routes available"
                  >
                    <b-icon icon="check" />
                  </b-tooltip>
                  <b-tooltip
                    v-else-if="props.row.feed_version_gtfs_import.success"
                    label="Successfully imported"
                  >
                    <b-icon icon="check-all" />
                  </b-tooltip>
                  <b-tooltip v-else-if="props.row.feed_version_gtfs_import.in_progress">
                    <b-icon icon="clock" />
                  </b-tooltip>
                  <b-tooltip
                    v-else-if="props.row.feed_version_gtfs_import.success == false"
                    :label="props.row.feed_version_gtfs_import.exception_log"
                    position="is-top"
                  >
                    <b-icon icon="alert" />
                  </b-tooltip>
                </template>
              </b-table-column>
              <b-table-column v-slot="props" label="Active">
                <b-icon
                  v-if="entity.feed_state && entity.feed_state.feed_version && entity.feed_state.feed_version.id === props.row.id"
                  icon="check"
                />
              </b-table-column>
            </b-table>

            <slot name="add-feed-version" :entity="entity" />
          </b-tab-item>

          <b-tab-item label="Service Levels">
            <div v-if="activeTab === 1">
              <tl-multi-service-levels :max-weeks="52" :week-agg="true" :fvids="entity.feed_versions.map((s)=>{return s.id}).slice(0,20)" />
            </div>
          </b-tab-item>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import EntityPageMixin from './entity-page-mixin'

const q = gql`
query($feed_onestop_id: String) {
  entities: feeds(where: {onestop_id: $feed_onestop_id}, limit: 1) {
    id
    onestop_id
    name
    languages
    spec
    file
    authorization {
      type
      info_url
      param_name
    }
    license {
      spdx_identifier
      url
      use_without_attribution
      create_derived_product
      redistribution_allowed
      commercial_use_allowed
      share_alike_optional
      attribution_text
      attribution_instructions
    }
    urls {
      static_current
      static_historic
      static_planned
      realtime_alerts
      realtime_trip_updates
      realtime_vehicle_positions
    }
    associated_operators {
      onestop_id
      name
      short_name
      agencies {
        agency_id
        agency_name
      }
    }
    feed_versions {
      id
      sha1
      earliest_calendar_date
      latest_calendar_date
      fetched_at
      url
      feed_version_gtfs_import {
        id
        success
        in_progress
        exception_log
        schedule_removed
        # created_at
      }
    }
    last_fetch: feed_fetches(limit:1) {
      fetch_error
      fetched_at
    }
    last_successful_fetch: feed_fetches(limit:1, where:{success:true}) {
      fetch_error
      fetched_at
    }
    feed_state {
      id
      feed_version {
        sha1
        id
      }
    }
  }
}
`

function isEmpty (obj) {
  if (!obj) { return false }
  for (const [k, v] of Object.entries(obj)) {
    if (k && k[0] !== '_' && v && v.length > 0) {
      return true
    }
  }
  return false
}

function first (v) {
  if (v && v.length > 0) {
    return v[0]
  }
  return null
}

export default {
  mixins: [EntityPageMixin],
  apollo: {
    entities: {
      client: 'transitland',
      query: q,
      variables () {
        return {
          feed_onestop_id: this.onestopId
        }
      },
      update (data) {
        // overrides the update method in EntityPageMixin
        if (data.entities.length === 0) {
          return this.setError(404)
        }
        this.$emit('entitiesLoaded', data.entities)
        return data.entities
      }
    }
  },
  props: {
    showOperators: { type: Boolean, default: false }
  },
  data () {
    return {
      error: 'ok',
      tabIndex: {
        0: 'versions',
        1: 'service'
      }
    }
  },
  head () {
    return {
      title: this.staticTitle,
      meta: [
        { hid: 'description', name: 'description', content: this.staticDescription },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary' },
        { hid: 'twitter:site', name: 'twitter:site', content: '@transitland' },
        { hid: 'twitter:title', name: 'twitter:title', content: this.staticTitle },
        { hid: 'twitter:image', name: 'twitter:image', content: 'https://www.transit.land/images/transitland-logo-square-with-whitebackground-smaller.png' },
        { hid: 'twitter:image:alt', name: 'twitter:image:alt', content: 'Transitland' },
        { hid: 'twitter:description', name: 'twitter:description', content: this.staticDescription },
        { hid: 'og:title', property: 'og:title', content: this.staticTitle },
        { hid: 'og:description', property: 'og:description', content: this.staticDescription }
      ]
    }
  },
  computed: {
    lastFetch () {
      return first(this.entity.last_fetch)
    },
    lastSuccessfulFetch () {
      const feed = this.entity
      return feed.last_successful_fetch
    },
    operatorNames () {
      let operatorNames = null
      const names = (this.entity.associated_operators || []).map((o) => {
        if (o.short_name) {
          return `${o.name} (${o.short_name})`
        } else {
          return o.name
        }
      })
      if (names.length > 3) {
        operatorNames = `${names.slice(0, 3).join(', ')} and ${names.length - 3} additional operators`
      } else if (names.length > 0 && names.length <= 3) {
        operatorNames = names.slice(0, 3).join(', ')
      }
      this.$emit('operatorNamesUpdated', operatorNames)
      return operatorNames
    },
    displayLicense () {
      if (this.entity) {
        return isEmpty(this.entity.license)
      }
      return false
    },
    displayAuthorization () {
      if (this.entity) {
        return isEmpty(this.entity.authentication)
      }
      return false
    },
    displayUrls () {
      if (this.entity) { return isEmpty(this.entity.urls) }
      return false
    },
    staticTitle () {
      let title = `feed details: ${this.onestopId}`
      if (this.entity) {
        title = this.entity.spec.toUpperCase() + ' ' + title
        if (this.entity.associated_operators) {
          title = `${this.operatorNames} • ` + title
        }
      }
      return title
    },
    staticDescription () {
      if (this.entity) {
        const operatorDescription = (this.entity && this.entity.associated_operators) ? ` with data for ${this.entity.name || this.operatorNames}` : ''
        const fvCount = this.entity.feed_versions.length
        let description = `This is a ${this.entity.spec.toUpperCase()} feed ${operatorDescription} with the Onestop ID of ${this.onestopId}.`
        if (fvCount === 1000) {
          description += ` Transitland has archived over 1,000 versions of this feed,
          which are available to query by API and to download.`
        } else if (fvCount > 0) {
          description += ` Transitland has archived ${fvCount} versions of this feed,
          which are available to query by API and to download.`
        }
        this.$emit('staticDescriptionUpdated', description)
        return description
      }
      return ''
    }
  }
}
</script>
