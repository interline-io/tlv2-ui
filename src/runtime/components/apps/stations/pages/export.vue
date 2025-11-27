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
        <p v-if="feedVersion?.sha1">
          <strong>SHA1:</strong> <code>{{ feedVersion.sha1 }}</code>
        </p>
      </div>

      <hr>

      <tl-apps-stations-gtfs-export-download
        :feed-version-sha1="feedVersion?.sha1"
        :feed-version-id="feedVersion?.id || feedVersionKey"
        :feed-key="feedKey"
        :feed-version-key="feedVersionKey"
        :client="client"
      />
    </div>
  </div>
</template>

<script>
import FeedMixin from './feed-mixin'

export default {
  mixins: [FeedMixin],
  head: {
    title: 'Export GTFS'
  }
}
</script>
