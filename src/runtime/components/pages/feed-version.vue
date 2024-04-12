<template>
  <div>
    <tl-loading v-if="$apollo.loading" />
    <tl-msg-error v-else-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else-if="entity">
      <Meta name="description" :content="staticDescription" />
      <Meta name="twitter:title" :content="staticTitle" />
      <Meta name="twitter:description" :content="staticDescription" />
      <Meta name="og:title" :content="staticTitle" />
      <Meta name="og:description" :content="staticDescription" />

      <slot name="nav" :entity="entity">
        <tl-breadcrumbs />
      </slot>

      <slot name="title">
        <tl-title :title="staticTitle">
          GTFS feed: {{ operatorOrAgencyNames }} version added {{ $filters.formatDate(entity.fetched_at) }} ({{ $filters.fromNow(entity.fetched_at) }})
        </tl-title>
      </slot>

      <nav class="level">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Agencies
            </p>
            <p class="title">
              {{ rowCount['agency.txt'] ? rowCount['agency.txt'].toLocaleString() : '-' }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Routes
            </p>
            <p class="title">
              {{ rowCount['routes.txt'] ? rowCount['routes.txt'].toLocaleString() : '-' }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Stops
            </p>
            <p class="title">
              {{ rowCount['stops.txt'] ? rowCount['stops.txt'].toLocaleString() : '-' }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Earliest Date
            </p>
            <p class="title">
              {{ entity.earliest_calendar_date.substr(0,10) }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Latest Date
            </p>
            <p class="title">
              {{ entity.latest_calendar_date.substr(0,10) }}
            </p>
          </div>
        </div>
      </nav>

      <table class="table is-borderless property-list tl-props">
        <tbody>
          <tr>
            <td>Feed Onestop ID</td>
            <td>
              <tl-safelink :text="entity.feed.onestop_id" />
            </td>
          </tr>
          <tr v-if="entity.name">
            <td>Name</td>
            <td>
              <template v-if="entity.name">
                {{ entity.name }}
              </template>
              <template v-else>
                <em>No name provided</em>
              </template>
            </td>
          </tr>
          <tr v-if="entity.description">
            <td>Description</td>
            <td>
              <template v-if="entity.description">
                {{ entity.description }}
              </template>
              <template v-else>
                <em>No description provided</em>
              </template>
            </td>
          </tr>
          <template v-if="showUserInformation">
            <tr v-if="entity.created_by">
              <td>Created by</td>
              <td>{{ entity.created_by }}</td>
            </tr>
            <tr v-if="entity.updated_by">
              <td>Last updated by</td>
              <td>{{ entity.updated_by }}</td>
            </tr>
          </template>
          <tr>
            <td>Fetched</td>
            <td>{{ $filters.formatDate(entity.fetched_at) }} ({{ $filters.fromNow(entity.fetched_at) }})</td>
          </tr>
          <tr>
            <td>URL</td>
            <td>
              <tl-safelink :url="entity.url" />
            </td>
          </tr>
          <tr>
            <td>SHA1</td>
            <td>
              <tl-safelink :text="entity.sha1" />
            </td>
          </tr>

          <tr>
            <td>Details</td>
            <td v-if="entity.feed_infos && entity.feed_infos.length > 0">
              <tl-feed-info :show-dates="true" :feed-info="entity.feed_infos[0]" />
            </td>
          </tr>
        </tbody>
      </table>

      <div class="is-clearfix mb-4">
        <slot v-if="showEdit" name="edit" :entity="entity">
          <o-button class="is-pulled-right is-primary" icon-left="pencil" @click="showEditModal=true">
            Edit
          </o-button>
          <tl-modal v-model="showEditModal" title="Feed Version">
            <tl-feed-version-edit
              :id="entity.id"
              @update="showEditModal = false; refetchEntities()"
            />
          </tl-modal>
        </slot>

        <slot v-if="showPermissions" name="permissions" :entity="entity">
          <o-button class="is-pulled-right is-primary" icon-left="pencil" @click="showPermissionsModal=true">
            Permissions
          </o-button>
          <tl-modal v-model="showPermissionsModal" title="Feed Version Permissions">
            <tl-admin-feed-version
              :id="entity.id"
              @update="showPermissionsModal = false; refetchEntities()"
            />
          </tl-modal>
        </slot>

        <slot v-if="showDownload" name="download" :entity="entity">
          <div class="is-pulled-right">
            <tl-feed-version-download :feed-onestop-id="feedKey" :feed-version-sha1="feedVersionKey" />
          </div>
        </slot>
      </div>

      <slot name="import" :entity="entity">
        <tl-feed-version-import :entity="entity" @update="refetchEntities" />
      </slot>

      <o-tabs v-model="activeTab" class="tl-tabs" type="boxed" :animated="false" @update:model-value="setTab">
        <o-tab-item id="files" label="Files">
          <tl-file-info-table :files="entity.files" />
        </o-tab-item>

        <o-tab-item id="service" label="Service levels">
          <client-only placeholder="Service levels">
            <template v-if="activeTab === 2">
              <tl-multi-service-levels :show-group-info="false" :show-service-relative="false" :fvids="[entity.id]" :week-agg="false" />
            </template>
          </client-only>
        </o-tab-item>

        <o-tab-item id="map" label="Map">
          <template v-if="activeTab === 3">
            <div v-if="imported">
              <client-only placeholder="Map">
                <tl-feed-version-map-viewer :feed-version-sha1="entity.sha1" :overlay="true" :link-version="true" />
              </client-only>
            </div>
            <tl-msg-info v-else>
              Map is only available for successfully imported feed versions.
            </tl-msg-info>
          </template>
        </o-tab-item>

        <o-tab-item v-if="imported" id="agencies" label="Agencies">
          <tl-agency-table v-if="activeTab === 4" :fvid="entity.sha1" />
        </o-tab-item>

        <o-tab-item v-if="imported" id="routes" label="Routes">
          <tl-route-table v-if="activeTab === 5" :link-version="true" :feed-version-sha1="entity.sha1" />
        </o-tab-item>

        <o-tab-item v-if="imported" id="stops" label="Stops">
          <tl-stop-table v-if="activeTab === 6" :link-version="true" :feed-version-sha1="entity.sha1" />
        </o-tab-item>

        <o-tab-item v-if="imported" id="import" label="Import log">
          <table class="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Rows</th>
                <th>Imported</th>
                <th> / </th>
                <th>Errors</th>
                <th>Reference errors</th>
                <th>Filtered</th>
                <th>Unmarked</th>
                <th>Warnings</th>
              </tr>
            </thead><tbody>
              <tr v-for="(v,fn) of mergedCount(entity.feed_version_gtfs_import)" :key="fn">
                <td><code>{{ fn }}</code></td>
                <td>{{ rowCount[fn] }}</td>
                <td>{{ v.count }}</td>
                <td />
                <td>{{ v.skip_error }}</td>
                <td>{{ v.skip_reference }}</td>
                <td>{{ v.skip_marked }}</td>
                <td>{{ v.skip_filter }} </td>
                <td>{{ v.warnings }}</td>
              </tr>
            </tbody>
          </table>
        </o-tab-item>
      </o-tabs>
    </div>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'
import EntityPageMixin from './entity-page-mixin'

const q = gql`
query ($feed_version_sha1: String!) {
  entities: feed_versions(limit: 1, where: {sha1: $feed_version_sha1}) {
    id
    sha1
    earliest_calendar_date
    latest_calendar_date
    url
    fetched_at
    name
    description
    created_by
    updated_by
    files {
      id
      name
      rows
      size
      sha1
      csv_like
      header
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
    feed_version_gtfs_import {
      id
      exception_log
      in_progress
      success
      schedule_removed
      # generated_count
      # interpolated_stop_time_count
      skip_entity_error_count
      skip_entity_reference_count
      skip_entity_filter_count
      skip_entity_marked_count
      warning_count
      entity_count
    }
    agencies {
      id
      agency_name
    }
    feed {
      id
      onestop_id
      associated_operators {
        name
        onestop_id
      }
    }
  }
}
`

export default {
  mixins: [EntityPageMixin],
  apollo: {
    entities: {
      client: 'transitland',
      query: q,
      variables () {
        return {
          feed_version_sha1: this.feedVersionKey
        }
      }
    }
  },
  props: {
    showEdit: { type: Boolean, default: false },
    showPermissions: { type: Boolean, default: false },
    showUserInformation: { type: Boolean, default: false },
    showDownload: { type: Boolean, default: true },
    feedKey: { type: String, default: '', required: true },
    feedVersionKey: { type: String, default: '', required: true }
  },
  data () {
    return {
      showEditModal: false,
      showPermissionsModal: false,
      features: [],
      tabIndex: {
        1: 'files',
        2: 'service',
        3: 'map',
        4: 'agencies',
        5: 'routes',
        6: 'stops',
        7: 'import'
      }
    }
  },
  computed: {
    imported () {
      return this.fvi && this.fvi.success
    },
    fvi () {
      return (this.entity && this.entity.feed_version_gtfs_import) ? this.entity.feed_version_gtfs_import : null
    },
    rowCount () {
      const ret = {}
      for (const f of this.entity.files || []) {
        ret[f.name] = f.rows
      }
      return ret
    },
    operatorOrAgencyNames () {
      if (this.entity && this.entity.agencies && this.entity.agencies.length > 0) {
        let names = this.entity.agencies.slice(0, 3).map(a => a.agency_name)
        if (this.entity.agencies.length > 3) {
          names = `${names.join(', ')} and ${this.entity.agencies.length - 3} additional operators`
        } else if (names.length > 0 && names.length <= 3) {
          names = names.slice(0, 3).join(', ')
        }
        return names
      } else {
        return this.entity.feed.onestop_id
      }
    },
    staticTitle () {
      return `${this.entity.feed.onestop_id} • ${this.entity.sha1} • Feed version`
    },
    staticDescription () {
      return `An archived GTFS feed version for ${this.operatorOrAgencyNames} from the feed with a Onestop ID of ${this.feedKey} first fetched at ${this.entity.fetched_at}. This feed version contains ${this.rowCount['agency.txt'] ? this.rowCount['agency.txt'].toLocaleString() : '-'} agencies, ${this.rowCount['routes.txt'] ? this.rowCount['routes.txt'].toLocaleString() : '-'} routes, and ${this.rowCount['stops.txt'] ? this.rowCount['stops.txt'].toLocaleString() : '-'} stops.`
    }
  },
  methods: {
    mergedCount (fvi) {
      const m = {}
      if (!fvi) { return m }
      for (const [a, b] of Object.entries(fvi.entity_count || {})) {
        m[a] = m[a] ? m[a] : {}
        m[a].count = b
      }
      for (const [a, b] of Object.entries(fvi.skip_entity_error_count || {})) {
        m[a] = m[a] ? m[a] : {}
        m[a].skip_error = b
      }
      for (const [a, b] of Object.entries(fvi.skip_entity_reference_count || {})) {
        m[a] = m[a] ? m[a] : {}
        m[a].skip_reference = b
      }
      for (const [a, b] of Object.entries(fvi.skip_entity_marked_count || {})) {
        m[a] = m[a] ? m[a] : {}
        m[a].skip_marked = b
      }
      for (const [a, b] of Object.entries(fvi.skip_entity_filter_count || {})) {
        m[a] = m[a] ? m[a] : {}
        m[a].skip_filter = b
      }
      return m
    }
  }
}
</script>
