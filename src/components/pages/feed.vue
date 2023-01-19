<template>
  <div>
    <tl-loading v-if="$apollo.loading" />
    <tl-msg-error v-else-if="error">{{ error }}</tl-msg-error>
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
        {{ feedSpec }} feed: {{ operatorNames }}
      </h1>

      <div class="columns">
        <div class="column is-three-quarters">
          <table class="table is-borderless property-list tl-props">
            <tr>
              <td>
                <o-tooltip dashed label="A globally unique identifier for this feed">
                  Onestop ID
                </o-tooltip>
              </td>
              <td>
                <code>{{ entity.onestop_id }}</code>
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
                <o-tooltip dashed label="Last time a fetch successfully returned valid GTFS data">
                  Last Fetch
                </o-tooltip>
              </td>
              <td>
                <template v-if="lastSuccessfulFetch && lastSuccessfulFetch.fetched_at">
                  {{ $filters.formatDate(lastSuccessfulFetch.fetched_at) }} ({{ $filters.fromNow(lastSuccessfulFetch.fetched_at) }})
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
                <o-tooltip dashed multilined label="Information provided by the feed producer inside a feed_info.txt file">
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
        <o-tabs class="tl-tabs" type="boxed" :animated="false">
          <o-tab-item label="Operators">
            <tl-msg-info v-if="!entity.associated_operators || (entity.associated_operators && entity.associated_operators.length === 0)">
              There are no operators associated with this feed.
            </tl-msg-info>
            <tl-msg-info
              v-for="(operator,i) of entity.associated_operators"
              :key="i"
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
            </tl-msg-info>
          </o-tab-item>
        </o-tabs>
      </div>

      <hr>

      <div v-if="entity.spec == 'GTFS'">
        <h4 class="title is-4">
          Archived Feed Versions
        </h4>

        <o-tabs class="tl-tabs" v-model="activeTab" type="boxed" :animated="false" @update:modelValue="setTab">
          <o-tab-item label="Versions">
            <o-table
              :data="entity.feed_versions"
              :striped="true"
              :paginated="true"
              :pagination-simple="true"
              sort-icon="menu-up"
              detailed
              :show-detail-icon="false"
            >
              <o-table-column
                v-slot="props"
                :sortable="true"
                field="fetched_at"
                label="Fetched"
              >
                <template v-if="props.row.fetched_at">
                  {{ $filters.formatDate(props.row.fetched_at) }} ({{ $filters.fromNow(props.row.fetched_at) }})
                </template>
                <template v-else>
                  Unknown
                </template>
              </o-table-column>
              <o-table-column v-slot="props" :sortable="true" field="sha1" label="SHA1">
                <nuxt-link
                  :to="{name: 'feeds-feed-versions-version', params: {feed: entity.onestop_id, version: props.row.sha1}}"
                >
                  {{ props.row.sha1.substr(0,6) }}…
                </nuxt-link>
              </o-table-column>
              <o-table-column
                v-slot="props"
                :sortable="true"
                field="earliest_calendar_date"
                label="Earliest date"
              >
                {{ props.row.earliest_calendar_date.substr(0,10) }}
              </o-table-column>
              <o-table-column
                v-slot="props"
                :sortable="true"
                field="latest_calendar_date"
                label="Latest date"
              >
                {{ props.row.latest_calendar_date.substr(0,10) }}
              </o-table-column>
              <o-table-column v-slot="props" field="feed_version_gtfs_import" label="Imported">
                <template v-if="props.row.feed_version_gtfs_import">
                  <o-tooltip
                    v-if="props.row.feed_version_gtfs_import.schedule_removed"
                    label="Agencies, stops, and routes available"
                  >
                    <o-icon icon="check" />
                  </o-tooltip>
                  <o-tooltip
                    v-else-if="props.row.feed_version_gtfs_import.success"
                    label="Successfully imported"
                  >
                    <o-icon icon="check-all" />
                  </o-tooltip>
                  <o-tooltip v-else-if="props.row.feed_version_gtfs_import.in_progress">
                    <o-icon icon="clock" />
                  </o-tooltip>
                  <o-tooltip
                    v-else-if="props.row.feed_version_gtfs_import.success == false"
                    :label="props.row.feed_version_gtfs_import.exception_log"
                    position="top"
                  >
                    <o-icon icon="alert" />
                  </o-tooltip>
                </template>
              </o-table-column>
              <o-table-column v-slot="props" label="Active">
                <o-icon
                  v-if="entity.feed_state && entity.feed_state.feed_version && entity.feed_state.feed_version.id === props.row.id"
                  icon="check"
                />
              </o-table-column>
              <o-table-column v-if="showDownloadColumn" v-slot="props" label="Download">
                <template v-if="entity.license.redistribution_allowed !== 'no'">
                  <a @click="showDownloadInstructions(props.row.sha1)">
                    <o-icon v-if="props.row.sha1 === latestFeedVersionSha1" icon="download" title="Download feed version" variant="success" />
                    <o-icon v-else icon="download" title="Download feed version" />
                  </a>
                </template>
              </o-table-column>
            </o-table>

            <tl-feed-version-download-modal
              v-model="displayDownloadInstructions"
              :sha1="displayDownloadSha1"
              :latest-feed-version-sha1="latestFeedVersionSha1"
            />

            <slot name="add-feed-version" :entity="entity" />
          </o-tab-item>

          <o-tab-item label="Service Levels">
            <div v-if="activeTab === 2">
              <tl-multi-service-levels :max-weeks="52" :week-agg="true" :fvids="entity.feed_versions.map((s)=>{return s.id}).slice(0,20)" />
            </div>
          </o-tab-item>
        </o-tabs>
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
      displayDownloadInstructions: false,
      displayDownloadSha1: '',
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
      return this.entity?.feed_versions[0]?.feed_infos[0]
    },
    lastFetch () {
      return first(this.entity.last_fetch)
    },
    lastSuccessfulFetch () {
      return (this.entity.last_successful_fetch && this.entity.last_successful_fetch.length > 0) ? this.entity.last_successful_fetch[0] : null
    },
    latestFeedVersionSha1 () {
      const s = this.entity?.feed_versions.slice(0).sort((a, b) => { return a.fetched_at - b.fetched_at })
      if (s.length > 0) {
        return s[0].sha1
      }
      return ''
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
      if (fvCount === 1000) {
        description += ` Transitland has archived over 1,000 versions of this feed,
        which are available to query by API and to download.`
      } else if (fvCount > 0) {
        description += ` Transitland has archived ${fvCount} versions of this feed,
        which are available to query by API and to download.`
      }
      return description
    }
  },
  methods: {
    showDownloadInstructions (sha1) {
      this.displayDownloadSha1 = sha1
      this.displayDownloadInstructions = true
    }
  }
}
</script>

<style scoped>
blockquote {
  margin:10px;
  margin-left:20px;
}
</style>
