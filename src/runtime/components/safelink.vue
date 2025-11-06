<template>
  <div class="safelink-outer">
    <div class="safelink">
      <div class="desc">
        {{ text || sanitizedUrl }}
      </div>
      <a v-if="text || sanitizedUrl" class="linker" @click="clipboard">
        <i class="mdi mdi-content-paste" title="Copy to clipboard" role="button" />
      </a>
      <a v-if="url && sanitizedUrl" target="_blank" :href="linkUrl ?? undefined" class="linker">
        <i class="mdi mdi-link" title="Open URL" role="button" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useToastNotification } from '../composables/useToastNotification'
import { sanitizeUrl } from '../lib/sanitize'

// Props
const props = withDefaults(defineProps<{
  url?: string | null
  text?: string | null
  maxWidth?: string
}>(), {
  url: null,
  text: null,
  maxWidth: '400px'
})

// Get runtime config
const config = useRuntimeConfig()

// Computed properties
const sanitizedUrl = computed((): string | null => {
  // Clean URL for display and copying (no UTM parameters)
  return props.url ? sanitizeUrl(props.url) : null
})

const linkUrl = computed((): string | null => {
  // URL with UTM parameters for external links
  const url = sanitizedUrl.value
  if (url && config?.public?.tlv2?.safelinkUtmSource) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}utm_source=${encodeURIComponent(config.public.tlv2.safelinkUtmSource)}`
  }
  return url
})

// Methods
const clipboard = async (): Promise<void> => {
  // Guard against SSR - navigator is only available in browser
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    console.warn('Clipboard API not available')
    return
  }

  // Always copy the clean URL without UTM parameters
  const textToCopy = props.text || sanitizedUrl.value
  if (textToCopy) {
    try {
      await navigator.clipboard.writeText(textToCopy)
      useToastNotification().showToast('Copied to clipboard')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      useToastNotification().showToast('Failed to copy to clipboard')
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
