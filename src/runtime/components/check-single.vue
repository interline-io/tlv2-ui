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
      <!-- <template v-if="!search">
            Click
            <nuxt-link :to="{
                name: 'stops-stopKey',
                params: { stopKey: searchKey.onestop_id },
            }">
                here
            </nuxt-link>
            to return to the main view.
        </template> -->
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
