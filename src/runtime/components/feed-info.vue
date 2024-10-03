<template>
  <dl>
    <template v-if="feedPublisherName">
      <dt>Publisher</dt>
      <dd>
        {{ feedPublisherName }}
        <div v-if="feedPublisherUrl">
          <tl-safelink :url="feedPublisherUrl" />
        </div>
      </dd>
    </template>
    <template v-if="feedContactEmail || feedContactUrl">
      <dt>Contact</dt>
      <dd>
        <div v-if="feedContactEmail" class="pb-1">
          <tl-safelink :url="feedContactEmail" />
        </div>
        <div v-if="feedContactUrl" class="pt-1">
          <tl-safelink :url="feedContactUrl" />
        </div>
      </dd>
    </template>
    <template v-if="feedLang">
      <dt>Language</dt>
      <dd>{{ feedLang }}</dd>
    </template>
    <template v-if="showDates">
      <template v-if="feedVersion">
        <dt>Version name</dt>
        <dd>{{ feedVersion }}</dd>
      </template>
    </template>
  </dl>
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
