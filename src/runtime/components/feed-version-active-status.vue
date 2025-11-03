<template>
  <div>
    <div class="flex items-center gap-2">
      <o-tooltip v-if="isActive" label="This is the currently active feed version for this feed, so it will be used unless otherwise specified in API responses.">
        <o-icon
          icon="check"
          class="text-success"
        />
      </o-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Types
interface FeedVersion {
  id: number | string
}

interface FeedState {
  feed_version?: FeedVersion
}

interface Feed {
  feed_state?: FeedState
}

// Props
const props = defineProps<{
  feed: Feed
  feedVersionId: number | string
}>()

// Computed
const isActive = computed(() => {
  return props.feed
    && props.feed.feed_state
    && props.feed.feed_state.feed_version
    && props.feed.feed_state.feed_version.id === props.feedVersionId
})
</script>
