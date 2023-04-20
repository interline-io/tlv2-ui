<template>
    <table class="table is-striped is-fullwidth">
        <thead>
            <tr>
                <th>Fetched</th>
                <th>SHA1</th>
                <th>Earliest date</th>
                <th>Latest date</th>
                <th>Imported</th>
                <th>Active</th>
                <th>Download</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="fv of feed.feed_versions.slice((page - 1) * perPage, page * perPage)" :key="fv.id">
                <td>{{ $filters.formatDate(fv.fetched_at) }} ({{ $filters.fromNow(fv.fetched_at) }})</td>
                <td> <nuxt-link
                        :to="{ name: 'feeds-feed-versions-version', params: { feed: entity.onestop_id, version: fv.sha1 } }">
                        {{ fv.sha1.substr(0, 6) }}…
                    </nuxt-link>
                </td>
                <td> {{ fv.earliest_calendar_date.substr(0, 10) }}</td>
                <td> {{ fv.latest_calendar_date.substr(0, 10) }}</td>
                <td>
                    <template v-if="fv.feed_version_gtfs_import">
                        <o-tooltip v-if="fv.feed_version_gtfs_import.schedule_removed"
                            label="Agencies, stops, and routes available">
                            <o-icon icon="check" />
                        </o-tooltip>
                        <o-tooltip v-else-if="fv.feed_version_gtfs_import.success" label="Successfully imported">
                            <o-icon icon="check-all" />
                        </o-tooltip>
                        <o-tooltip v-else-if="fv.feed_version_gtfs_import.in_progress">
                            <o-icon icon="clock" />
                        </o-tooltip>
                        <o-tooltip v-else-if="fv.feed_version_gtfs_import.success == false"
                            :label="fv.feed_version_gtfs_import.exception_log" position="top">
                            <o-icon icon="alert" />
                        </o-tooltip>
                    </template>
                </td>
                <td>
                    <o-icon
                        v-if="feed.feed_state && feed.feed_state.feed_version && feed.feed_state.feed_version.id === fv.id"
                        icon="check" />
                </td>
                <td><template v-if="feed.license.redistribution_allowed !== 'no'">
                        <a @click="showDownloadInstructions(fv.sha1)">
                            <o-icon v-if="fv.sha1 === latestFeedVersionSha1" icon="download" title="Download feed version"
                                variant="success" />
                            <o-icon v-else icon="download" title="Download feed version" />
                        </a>
                    </template></td>
            </tr>
        </tbody>
    </table>
    <o-pagination :total="feed.feed_versions.length" v-model:current="page" :simple="true" :per-page="perPage"
        aria-next-label="Next page" aria-previous-label="Previous page" aria-page-label="Page"
        aria-current-label="Current page">
    </o-pagination>

    <tl-feed-version-download-modal v-model="displayDownloadInstructions" :sha1="displayDownloadSha1"
        :latest-feed-version-sha1="latestFeedVersionSha1" />
</template>

<script>
export default {
    props: {
        feed: { type: Object, default () { return {} }}
    },
    data() {
        return {
            page: 1,
            perPage: 20,
        }
    }
}
</script>
