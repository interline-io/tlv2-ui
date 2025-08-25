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

<script>
export default {
  props: {
    feed: {
      type: Object,
      required: true
    },
    feedVersionId: {
      type: [Number, String],
      required: true
    }
  },
  computed: {
    isActive () {
      return this.feed
        && this.feed.feed_state
        && this.feed.feed_state.feed_version
        && this.feed.feed_state.feed_version.id === this.feedVersionId
    }
  }
}
</script>
