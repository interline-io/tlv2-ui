<template>
    <div>
        <ul>
            <li v-if="feedPublisherName">
                Publisher: 
                {{ feedPublisherName }}
                <template v-if="feedPublisherUrl">
                    <br>
                    <code>{{ feedPublisherUrl }}</code>
                <a v-if="showLinks" :href="feedPublisherUrl">
                    <b-icon icon="link" />
                </a>
                </template>
            </li>
            <li v-if="feedContactEmail || feedContactUrl">
                Contact: 
                <template v-if="feedContactEmail">
                    {{ feedContactEmail }}
                </template>
                <template v-if="feedContactUrl">
                    <br>
                    <code>{{ feedContactUrl }}</code>
                <a v-if="showLinks && feedContactUrl" :href="feedContactUrl">
                    <b-icon icon="link" />
                </a>
                </template>
            </li>
            <li v-if="feedLang">Language: {{ feedLang }}</li>
            <template v-if="showDates">
                <li v-if="feedVersion">Version name: {{ feedVersion }}</li>
                <li v-if="feedStartDate">Start date: {{ $filters.formatDate(feedStartDate)}}</li>
                <li v-if="feedEndDate">End date: {{ $filters.formatDate(feedEndDate)}}</li>
            </template>
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        feedInfo: {type: Object, default: {}},
        showDates: { type: Boolean },
        showLinks: { type: Boolean }
        },
    computed: { 
        feedStartDate() { return this.feedInfo['feed_start_date'] },
        feedEndDate() { return this.feedInfo['feed_end_date'] },
        feedPublisherName() { return this.feedInfo['feed_publisher_name'] },
        feedPublisherUrl() { return this.feedInfo['feed_publisher_url'] },
        feedContactEmail() { return this.feedInfo['feed_contact_email'] },
        feedContactUrl() { return this.feedInfo['feed_contact_url'] },
        feedLang() { return this.feedInfo['feed_lang'] },
        feedVersion() { return this.feedInfo['feed_version'] },
        defaultLang() { return this.feedInfo['default_lang'] },
    }
}
</script>
