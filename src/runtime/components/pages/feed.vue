<template>
  <div>
    <tl-loading v-if="$apollo.loading" />
    <tl-msg-error v-else-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else-if="entity">
      <Title>{{ staticTitle }}</Title>
      <Meta name="description" :content="staticDescription" />
      <Meta name="twitter:title" :content="staticTitle" />
      <Meta name="twitter:description" :content="staticDescription" />
      <Meta name="og:title" :content="staticTitle" />
      <Meta name="og:description" :content="staticDescription" />

      <slot name="nav" :entity="entity">
        <nav class="breadcrumb">
          <ul>
            <li>
              <nuxt-link :to="{ name: 'feeds' }">
                Source Feeds
              </nuxt-link>
            </li>
            <li>
              <nuxt-link :to="{ name: 'feeds-feed', params: { feed: $route.params.feed } }">
                {{ $route.params.feed }}
              </nuxt-link>
            </li>
          </ul>
        </nav>
      </slot>

      <h1 class="title">
        {{ feedSpec }} feed: {{ operatorNames }}
      </h1>

      <div class="columns">
        <div class="column">
          <table class="table is-borderless property-list tl-props">
            <tbody>
              <tr>
                <td>
                  <o-tooltip dashed label="A globally unique identifier for this feed">
                    Onestop ID
                  </o-tooltip>
                </td>
                <td>
                  <tl-safelink :text="entity.onestop_id" />
                </td>
              </tr>
              <tr>
                <td>
                  <o-tooltip dashed label="Data specification or format for this feed">
                    Format
                  </o-tooltip>
                </td>
                <td>{{ feedSpec }}</td>
              </tr>

              <tr v-if="displayUrls">
                <td>URLs</td>
                <td>
                  <ul>
                    <li v-if="entity.urls.static_current">
                      Current Static GTFS: <tl-safelink :url="entity.urls.static_current" />
                    </li>
                    <li v-if="entity.urls.static_planned && entity.urls.static_planned.length > 0">
                      Future Static GTFS: Current Static GTFS: <tl-safelink :url="entity.urls.static_planned" />
                    </li>
                    <li v-if="entity.urls.static_historic">
                      <div v-for="(k, i) of entity.urls.static_historic" :key="i">
                        Historic GTFS: Current Static GTFS: <tl-safelink :url="k" />
                      </div>
                    </li>
                    <li v-if="entity.urls.realtime_vehicle_positions">
                      GTFS Realtime Vehicle Positions: <tl-safelink :url="entity.urls.realtime_vehicle_positions" />
                    </li>
                    <li v-if="entity.urls.realtime_trip_updates">
                      GTFS Realtime Trip Updates: <tl-safelink :url="entity.urls.realtime_trip_updates" />
                    </li>
                    <li v-if="entity.urls.realtime_alerts">
                      GTFS Realtime Alerts: <tl-safelink :url="entity.urls.realtime_alerts" />
                    </li>
                  </ul>
                </td>
              </tr>

              <tr>
                <td>
                  <o-tooltip dashed label="Last time a fetch successfully returned valid GTFS data">
                    Last Fetch
                  </o-tooltip>
                </td>
                <td>
                  <template v-if="lastSuccessfulFetch && lastSuccessfulFetch.fetched_at">
                    {{ $filters.formatDate(lastSuccessfulFetch.fetched_at) }} ({{
                      $filters.fromNow(lastSuccessfulFetch.fetched_at) }})
                  </template>
                  <template v-else>
                    Unknown
                  </template>
                </td>
              </tr>

              <tr v-if="lastFetch && lastFetch.fetch_error">
                <td>
                  <o-tooltip dashed label="Error message from last fetch attempt">
                    Fetch Error
                  </o-tooltip>
                </td>
                <td>
                  <tl-msg-error>
                    {{ lastFetch.fetch_error }}
                  </tl-msg-error>
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
                      Info URL: <tl-safelink :url="entity.authorization.info_url" />
                    </li>
                  </ul>
                </td>
              </tr>

              <tr v-if="displayLicense">
                <td>License</td>
                <td>
                  <ul>
                    <li v-if="entity.license.url">
                      License URL: <tl-safelink :url="entity.license.url" />
                    </li>
                    <li v-if="entity.license.spdx_identifier">
                      License Identifier: {{ entity.license.spdx_identifier }}
                    </li>
                    <li v-if="entity.license.use_without_attribution">
                      Use allowed without attribution: {{ $filters.capitalize(entity.license.use_without_attribution) }}
                    </li>
                    <li v-if="entity.license.share_alike_optional">
                      Share-alike optional: {{ $filters.capitalize(entity.license.share_alike_optional) }}
                    </li>
                    <li v-if="entity.license.commercial_use_allowed">
                      Commercial use allowed: {{ $filters.capitalize(entity.license.commercial_use_allowed) }}
                    </li>
                    <li v-if="entity.license.create_derived_product">
                      Creating derived products allowed: {{ $filters.capitalize(entity.license.create_derived_product) }}
                    </li>
                    <li v-if="entity.license.redistribution_allowed">
                      Redistribution allowed: {{ $filters.capitalize(entity.license.redistribution_allowed) }}
                    </li>
                    <li v-if="entity.license.attribution_text">
                      Required attribution text: {{ entity.license.attribution_text }}
                    </li>
                    <li v-if="entity.license.attribution_instructions" class="content">
                      Attribution instructions:
                      <blockquote>{{ $filters.capitalize(entity.license.attribution_instructions) }}</blockquote>
                    </li>
                  </ul>
                </td>
              </tr>
              <tr v-if="entity.languages">
                <td>Languages</td>
                <td>{{ entity.languages }}</td>
              </tr>

              <tr v-if="entity.spec == 'GTFS'">
                <td>
                  <o-tooltip
                    dashed
                    multilined
                    label="Information provided by the feed producer inside a feed_info.txt file"
                  >
                    Feed Info
                  </o-tooltip>
                </td>
                <td v-if="mostRecentFeedInfo">
                  <tl-feed-info :feed-info="mostRecentFeedInfo" />
                </td>
                <td v-else>
                  <em>No <code>feed_info.txt</code> file included in the most recent feed version.</em>
                </td>
              </tr>
            </tbody>
          </table>

          <slot name="description">
            <div class="content">
              {{ staticDescription }}
            </div>
          </slot>
        </div>

        <slot name="edit-feed" :entity="entity" />
      </div>

      <!-- TODO: Operators component -->
      <div v-if="showOperators">
        <hr>
        <h4 class="title is-4">
          Operator(s) Associated with this Feed
        </h4>
        <slot name="associatedOperatorsContent" />
        <tl-associated-operators :associated-operators="entity.associated_operators" />
      </div>

      <hr>

      <div v-if="entity.spec == 'GTFS'">
        <h4 class="title is-4">
          Archived Feed Versions
        </h4>

        <tl-feed-version-table :feed="entity" />
        <slot name="add-feed-version" :entity="entity" />
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import EntityPageMixin from './entity-page-mixin'

const q = gql`
query($onestop_id: String) {
  entities: feeds(where: {onestop_id: $onestop_id}, limit: 1) {
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
    last_fetch: feed_fetches(limit:1) {
      fetch_error
      fetched_at
    }
    last_successful_fetch: feed_fetches(limit:1, where:{success:true}) {
      fetch_error
      fetched_at
    }
    feed_versions(limit:100) {
      id
      sha1
      earliest_calendar_date
      latest_calendar_date
      fetched_at
      url
      feed_infos {
        feed_publisher_name
        feed_publisher_url
        feed_lang
        default_lang
        feed_version
        feed_start_date
        feed_end_date
        feed_contact_email
        feed_contact_url
      }      
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
        return this.searchKey
      }
    }
  },
  props: {
    showDownloadColumn: { type: Boolean, default: true },
    showOperators: { type: Boolean, default: true }
  },
  data () {
    return {
      page: 1,
      perPage: 20,
      tabIndex: {
        1: 'versions',
        2: 'service'
      }
    }
  },
  computed: {
    feedSpec () {
      return this.entity?.spec?.toUpperCase()?.replace('_', '-')
    },
    mostRecentFeedInfo () {
      return this.entity?.feed_versions?.length > 0 ? this.entity.feed_versions[0]?.feed_infos[0] : null
    },
    lastFetch () {
      return first(this.entity.last_fetch)
    },
    lastSuccessfulFetch () {
      return (this.entity.last_successful_fetch && this.entity.last_successful_fetch.length > 0) ? this.entity.last_successful_fetch[0] : null
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
      let title = `feed details: ${this.entity.onestop_id}`
      title = this.feedSpec + ' ' + title
      if (this.entity.associated_operators) {
        title = `${this.operatorNames} • ` + title
      }
      return title
    },
    staticDescription () {
      const operatorDescription = (this.entity && this.entity.associated_operators) ? ` with data for ${this.entity.name || this.operatorNames}` : ''
      const fvCount = this.entity.feed_versions.length
      let description = `This is a ${this.feedSpec} feed ${operatorDescription} with the Onestop ID of ${this.entity.onestop_id}.`
      if (fvCount >= 100) {
        description += ` Transitland has archived over 100 versions of this feed,
        which are available to query by API and to download.`
      } else if (fvCount > 1) {
        description += ` Transitland has archived ${fvCount} versions of this feed,
        which are available to query by API and to download.`
      }
      return description
    }
  }
}
</script>

<style scoped>
blockquote {
  margin: 10px;
  margin-left: 20px;
}
</style>
