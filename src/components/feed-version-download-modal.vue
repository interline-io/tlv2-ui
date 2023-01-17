<template>
  <b-modal
    v-if="modelValue"
    :active="true"
    can-cancel
    has-modal-card
    @close="$emit('update:modelValue', false)"
  >
    <template #default>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Download feed version
          </p>
          <button type="button" class="delete" @click="$emit('update:modelValue', false)" />
        </header>
        <section class="modal-card-body">
          <div class="container content">
            <template v-if="sha1 === latestFeedVersionSha1">
              <p>The most recent feed version can be accessed by all users.</p>
              <p class="is-centered">
                <a :href="`https://demo.transit.land/api/v2/rest/feed_versions/${sha1}/download`" target="_blank">
                  <b-button variant="success" icon-left="download">Download feed version</b-button>
                </a>
              </p>
              <p>
                Older feed versions can be accessed with a <a href="https://www.interline.io/transitland/plans-pricing/" target="_blank">Transitland Hobbyist/Academic, Professional, and Enterprise plan</a>.
              </p>
              <p>Learn more in the <a href="/documentation/rest-api/feed_versions#downloading-source-gtfs" target="_blank">documentation</a>.</p>
            </template>
            <template v-else>
              <p>Want to download a copy of this feed version to process with your own software? Registered users with <a href="https://www.interline.io/transitland/plans-pricing/" target="_blank">Hobbyist/Academic, Professional, and Enterprise plans</a> can use the Transitland v2 REST API to download historical feed versions.</p>
              <p>Learn more in the <a href="/documentation/rest-api/feed_versions#downloading-source-gtfs" target="_blank">documentation</a>.</p>
            </template>
          </div>
        </section>
      </div>
    </template>
  </b-modal>
</template>

<script>
export default {
  props: ['sha1', 'latestFeedVersionSha1', 'modelValue'],
  emits: ['update']
}
</script>
