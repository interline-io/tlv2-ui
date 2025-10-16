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

<script setup lang="ts">
import { computed } from 'vue'

// TypeScript interfaces
interface FeedInfo {
  feed_start_date?: string | null
  feed_end_date?: string | null
  feed_publisher_name?: string | null
  feed_publisher_url?: string | null
  feed_contact_email?: string | null
  feed_contact_url?: string | null
  feed_lang?: string | null
  feed_version?: string | null
  default_lang?: string | null
}

// Props
const props = withDefaults(defineProps<{
  feedInfo?: FeedInfo
  showDates?: boolean
  showLinks?: boolean
}>(), {
  feedInfo: () => ({}),
  showDates: false,
  showLinks: false
})

// Computed properties
const feedStartDate = computed((): string | null | undefined => {
  return props.feedInfo?.feed_start_date
})

const feedEndDate = computed((): string | null | undefined => {
  return props.feedInfo?.feed_end_date
})

const feedPublisherName = computed((): string | null | undefined => {
  return props.feedInfo?.feed_publisher_name
})

const feedPublisherUrl = computed((): string | null | undefined => {
  return props.feedInfo?.feed_publisher_url
})

const feedContactEmail = computed((): string | null | undefined => {
  return props.feedInfo?.feed_contact_email
})

const feedContactUrl = computed((): string | null | undefined => {
  return props.feedInfo?.feed_contact_url
})

const feedLang = computed((): string | null | undefined => {
  return props.feedInfo?.feed_lang
})

const feedVersion = computed((): string | null | undefined => {
  return props.feedInfo?.feed_version
})

const defaultLang = computed((): string | null | undefined => {
  return props.feedInfo?.default_lang
})
</script>

<style scoped>
dd {
  margin-left:20px;
}
</style>
