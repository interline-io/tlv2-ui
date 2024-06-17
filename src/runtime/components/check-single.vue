<template>
  <div>
    <tl-msg-info v-if="feedVersionSha1">
      You are viewing the version of this entity defined by feed
      <nuxt-link
        :to="{
          name: 'feeds-feedKey',
          params: { feedKey: feedOnestopId },
        }"
      >
        {{ $filters.shortenName(feedOnestopId) }}
      </nuxt-link>
      version
      <nuxt-link
        :to="{
          name: 'feeds-feedKey-versions-feedVersionKey',
          params: {
            feedKey: feedOnestopId,
            feedVersionKey: feedVersionSha1,
          },
        }"
      >
        {{ $filters.shortenName(feedVersionSha1, 8) }}
      </nuxt-link>.<br>
    </tl-msg-info>
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
