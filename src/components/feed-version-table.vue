<template>
  <div>
    <div class="table-container">
      <table class="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>Feed version fetched</th>
            <th>SHA1 hash</th>
            <th>Earliest service date</th>
            <th>Latest service date</th>
            <th>Imported into API?</th>
            <th>Active in API?</th>
            <th>Links to view or download</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fv of entities" :key="fv.id">
            <td>{{ $filters.formatDate(fv.fetched_at) }} ({{ $filters.fromNow(fv.fetched_at) }})</td>
            <td>
              <tl-safelink :text="fv.sha1" max-width="100px" />
            </td>
            <td> {{ fv.earliest_calendar_date.substr(0, 10) }}</td>
            <td> {{ fv.latest_calendar_date.substr(0, 10) }}</td>
            <td>
              <template v-if="fv.feed_version_gtfs_import">
                <o-tooltip
                  v-if="fv.feed_version_gtfs_import.schedule_removed"
                  label="Agencies, stops, and routes available"
                >
                  <o-icon icon="check" />
                </o-tooltip>
                <o-tooltip v-else-if="fv.feed_version_gtfs_import.success" label="Successfully imported">
                  <o-icon icon="check-all" />
                </o-tooltip>
                <o-tooltip v-else-if="fv.feed_version_gtfs_import.in_progress">
                  <o-icon icon="clock" />
                </o-tooltip>
                <o-tooltip
                  v-else-if="fv.feed_version_gtfs_import.success == false"
                  :label="fv.feed_version_gtfs_import.exception_log"
                  position="top"
                >
                  <o-icon icon="alert" />
                </o-tooltip>
              </template>
            </td>
            <td>
              <o-icon
                v-if="feed.feed_state && feed.feed_state.feed_version && feed.feed_state.feed_version.id === fv.id"
                icon="check"
              />
            </td>
            <td class="has-text-right">
              <template v-if="feed.license.redistribution_allowed !== 'no'">
                <nuxt-link
                  :to="{ name: 'feeds-feed-versions-version', params: { feed: feed.onestop_id, version: fv.sha1, hash: '#files' } }"
                  class="button is-primary is-small"
                >
                  Files
                </nuxt-link> <nuxt-link
                  :to="{ name: 'feeds-feed-versions-version', params: { feed: feed.onestop_id, version: fv.sha1, hash: '#service' } }"
                  class="button is-primary is-small"
                >
                  Service levels
                </nuxt-link> <a class="button is-small" @click="showDownloadInstructions(fv.sha1)">
                  <o-icon
                    v-if="fv.sha1 === latestFeedVersionSha1"
                    icon="download"
                    title="Download feed version"
                    variant="success"
                  />
                  <o-icon v-else icon="download" title="Download feed version" />
                </a>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="hasMore" style="text-align:center" @click="fetchMore">
      <a class="button is-primary is-small is-fullwidth">Show more feed versions</a>
    </div>

    <tl-feed-version-download-modal
      v-model="displayDownloadInstructions"
      :sha1="displayDownloadSha1"
      :latest-feed-version-sha1="latestFeedVersionSha1"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag'

const fvQuery = gql`
query ($limit:Int, $onestop_id: String, $after:Int) {
  entities: feed_versions(limit:$limit, after:$after, where: {feed_onestop_id: $onestop_id}) {
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
}
`

export default {
  props: {
    feed: { type: Object, default () { return {} } }
  },
  apollo: {
    entities: {
      client: 'transitland',
      query: fvQuery,
      variables () {
        return {
          after: 0,
          onestop_id: this.feed.onestop_id,
          limit: this.limit
        }
      }
    }
  },
  data() {
    return {
      entities: [],
      limit: 100,
      maxLimit: 10000,
      displayDownloadInstructions: false,
      displayDownloadSha1: ''
    }
  },
  computed: {
    hasMore() {
      return (this.entities.length % this.limit) === 0
    },
    latestFeedVersionSha1 () {
      const s = this.entities.slice(0).sort((a, b) => { return a.fetched_at - b.fetched_at })
      if (s.length > 0) {
        return s[0].sha1
      }
      return ''
    }
  },
  methods: {
    fetchMore() {
      if (this.entities.length > this.maxLimit) {
        return
      }
      const lastId = this.entities.length > 0 ? this.entities[this.entities.length - 1].id : 0
      this.$apollo.queries.entities.fetchMore({
        variables: {
          after: lastId,
          limit: this.limit
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const cur = [...previousResult.entities, ...fetchMoreResult.entities]
          return {
            entities: cur
          }
        }
      })
    },
    showDownloadInstructions (sha1) {
      this.displayDownloadSha1 = sha1
      this.displayDownloadInstructions = true
    }
  }
}
</script>
