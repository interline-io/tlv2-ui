<template>
  <div style="display:inline-block">
    <div class="safelink">
      <div class="desc">
        {{ text || sanitizedUrl }}
      </div>
      <a v-if="text || sanitizedUrl" class="linker" @click="clipboard">
        <o-tooltip label="Copy to clipboard"><i class="mdi mdi-content-paste" /></o-tooltip>
      </a>
      <a v-if="url && sanitizedUrl" target="_blank" :href="sanitizedUrl" class="linker">
        <o-tooltip label="Open URL"><i class="mdi mdi-link" /></o-tooltip>
      </a>
    </div>
  </div>
</template>

<script>
import { sanitizeUrl } from '@braintree/sanitize-url'

import { useProgrammatic } from '@oruga-ui/oruga-next/dist/oruga.mjs'
const { oruga } = useProgrammatic()

export default {
  props: {
    url: { type: String, default: null },
    text: { type: String, default: null },
    maxWidth: { type: String, default: '400px' }
  },
  computed: {
    sanitizedUrl() {
      return sanitizeUrl(this.url)
    }
  },
  methods: {
    clipboard() {
      navigator.clipboard.writeText(this.text || this.sanitizedUrl)
      oruga.notification.open({
        message: 'Copied to clipboard',
        rootClass: 'toast toast-notification',
        position: 'bottom',
        variant: 'primary'
      })
    }
  }
}
</script>

<style scoped>

.safelink {
    display:flex;
    flex-direction: row;
    flex-wrap: nowrap;

}

.safelink .desc {
    color: #da1039;
    background:hsl(0, 0%, 96%);
    font-family: monospace;
    font-weight: normal;
    font-size: 0.875em;
    margin:0px;
    padding-left:10px;
    padding-right:10px;
    padding-top:3px;
    padding-bottom:3px;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: v-bind(maxWidth);
    white-space: nowrap;
    word-wrap: nowrap;
}

.safelink .linker {
    width:30px;
    text-align:center;
    margin:0px;
    padding:3px;
    background:hsl(0, 0%, 94%);

}

@media only screen and (max-width: 600px) {
    .safelink .desc {
    max-width:160px;
  }
}

</style>
