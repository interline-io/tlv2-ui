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
        {{ shortenName(feedOnestopId || '', 24) }}
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
        {{ shortenName(feedVersionSha1 || '', 8) }}
      </nuxt-link>.<br>
    </tl-msg-info>
  </div>
</template>

<script setup lang="ts">
import { shortenName } from '../lib/filters'

// Props
defineProps<{
  feedOnestopId?: string
  feedVersionSha1?: string
}>()
</script>
