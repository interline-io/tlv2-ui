<template>
    <div>
    <tl-info v-if="feedVersionSha1">
        You are viewing a single GTFS Route entity defined in source feed
        <nuxt-link :to="{
            name: 'feeds-feed',
            params: { feed: feedOnestopId },
        }">
            {{ $filters.shortenName(feedOnestopId) }}
        </nuxt-link>
        version
        <nuxt-link :to="{
            name: 'feeds-feed-versions-version',
            params: {
                feed: feedOnestopId,
                version: feedVersionSha1,
            },
        }">
            {{ $filters.shortenName(feedVersionSha1, 8) }}
        </nuxt-link>.<br>
        <!-- <template v-if="!search">
            Click
            <nuxt-link :to="{
                name: 'stops-onestop_id',
                params: { onestop_id: searchKey.onestop_id },
            }">
                here
            </nuxt-link>
            to return to the main view.
        </template> -->
    </tl-info>
    </div>
</template>

<script>
export default {
    props: {
        feedOnestopId: { type: String },
        feedVersionSha1: { type: String }
    }
}
</script>