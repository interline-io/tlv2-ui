<template>
  <div>
    <ul>
      <li v-if="feedPublisherName">
        Publisher:
        {{ feedPublisherName }}
        <template v-if="feedPublisherUrl">
          <tl-safelink :url="feedPublisherUrl" />
        </template>
      </li>
      <li v-if="feedContactEmail || feedContactUrl">
        Contact:
        <template v-if="feedContactEmail">
          <tl-safelink :url="feedContactEmail" />
        </template>
        <template v-if="feedContactUrl">
          <tl-safelink :url="feedContactUrl" />
        </template>
      </li>
      <li v-if="feedLang">
        Language: {{ feedLang }}
      </li>
      <template v-if="showDates">
        <li v-if="feedVersion">
          Version name: {{ feedVersion }}
        </li>
        <li v-if="feedStartDate">
          Start date: {{ $filters.formatDate(feedStartDate) }}
        </li>
        <li v-if="feedEndDate">
          End date: {{ $filters.formatDate(feedEndDate) }}
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    feedInfo: { type: Object, default: {} },
    showDates: { type: Boolean },
    showLinks: { type: Boolean }
  },
  computed: {
    feedStartDate () { return this.feedInfo.feed_start_date },
    feedEndDate () { return this.feedInfo.feed_end_date },
    feedPublisherName () { return this.feedInfo.feed_publisher_name },
    feedPublisherUrl () { return this.feedInfo.feed_publisher_url },
    feedContactEmail () { return this.feedInfo.feed_contact_email },
    feedContactUrl () { return this.feedInfo.feed_contact_url },
    feedLang () { return this.feedInfo.feed_lang },
    feedVersion () { return this.feedInfo.feed_version },
    defaultLang () { return this.feedInfo.default_lang }
  }
}
</script>
