<template>
  <div style="display:inline-block">
    <div class="safelink">
      <div class="desc">
        {{ text || sanitizedUrl }}
      </div>
      <a v-if="url && sanitizedUrl" target="_blank" :href="sanitizedUrl" class="linker">
        <i class="mdi mdi-link" />
      </a>
    </div>
  </div>
</template>

<script>
import { sanitizeUrl } from '@braintree/sanitize-url'
export default {
  props: {
    url: { type: String, default: null },
    text: { type: String, default: null }
  },
  computed: {
    sanitizedText() {
      return ''
    },
    sanitizedUrl() {
      return sanitizeUrl(this.url)
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
    max-width:300px;
    white-space: nowrap;
    word-wrap: nowrap;
}

.safelink .linker {
    width:30px;
    text-align:center;
    margin:0px;
    padding:3px;
    background:#ccc;
}

@media only screen and (max-width: 600px) {
    .safelink .desc {
    max-width:160px;
  }
}

</style>
