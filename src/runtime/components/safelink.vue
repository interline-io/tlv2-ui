<template>
  <div class="safelink-outer">
    <div class="safelink">
      <div class="desc">
        {{ text || sanitizedUrl }}
      </div>
      <a v-if="text || sanitizedUrl" class="linker" @click="clipboard">
        <i class="mdi mdi-content-paste" title="Copy to clipboard" role="button" />
      </a>
      <a v-if="url && sanitizedUrl" target="_blank" :href="sanitizedUrl" class="linker">
        <i class="mdi mdi-link" title="Open URL" role="button" />
      </a>
    </div>
  </div>
</template>

<script>
import { useToastNotification } from '../composables/useToastNotification'

export default {
  props: {
    url: { type: String, default: null },
    text: { type: String, default: null },
    maxWidth: { type: String, default: '400px' }
  },
  computed: {
    sanitizedUrl () {
      const url = this.$filters.sanitizeUrl(this.url)
      if (url && this.$config.public.tlv2.safelinkUtmSource) {
        const separator = url.includes('?') ? '&' : '?'
        return `${url}${separator}utm_source=${encodeURIComponent(this.$config.public.tlv2.safelinkUtmSource)}`
      }
      return url
    }
  },
  methods: {
    clipboard () {
      navigator.clipboard.writeText(this.text || this.sanitizedUrl)
      useToastNotification().showToast('Copied to clipboard')
    }
  }
}
</script>

<style scoped>

.safelink-outer {
  display:inline-block
}

.safelink {
    margin: 2px 0;
    display:flex;
    flex-direction: row;
    flex-wrap: nowrap;
}

.safelink .desc {
    color: var(--bulma-link-text);
    background:var(--bulma-background);
    font-family: monospace;
    font-size: 1.2em;
    padding-left:10px;
    padding-top:2px;
    padding-bottom:2px;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: v-bind(maxWidth);
    white-space: nowrap;
    word-wrap: nowrap;
    line-height: var(--bulma-line-height);
}

.safelink .linker {
    width:30px;
    text-align:center;
    background:var(--bulma-background);
    display: flex;
    align-items: center;
    justify-content: center;
}

@media only screen and (max-width: 600px) {
    .safelink .desc {
    max-width:160px;
  }
}

</style>
