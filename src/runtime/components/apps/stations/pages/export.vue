<template>
  <div>
    <slot name="title">
      <tl-title title="Export GTFS" />
    </slot>

    <div class="box">
      <h2 class="title is-4">
        Export Feed Version
      </h2>
      <p class="mb-4">
        Export this feed version in order to download a static GTFS archive. Advanced options include ID prefixing, timezone normalization, and shape simplification.
      </p>

      <div class="mb-4">
        <p>
          <strong>Feed:</strong> {{ feedKey }}
        </p>
        <p>
          <strong>Version ID:</strong> {{ feedVersionKey }}
        </p>
        <p v-if="typeof feedVersion !== 'string' && feedVersion?.sha1">
          <strong>SHA1:</strong> <code>{{ feedVersion.sha1 }}</code>
        </p>
      </div>

      <hr>

      <tl-apps-stations-gtfs-export-download
        :feed-version-sha1="typeof feedVersion !== 'string' ? feedVersion?.sha1 : undefined"
        :feed-version-id="typeof feedVersion !== 'string' ? feedVersion?.id : feedVersionKey"
        :feed-key="feedKey"
        :feed-version-key="feedVersionKey"
        :client="client"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FeedMixin from './feed-mixin.vue'

export default defineComponent({
  mixins: [FeedMixin]
})
</script>
