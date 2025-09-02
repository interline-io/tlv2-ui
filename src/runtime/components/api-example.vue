<template>
  <div class="box api-example-box">
    <div class="level is-mobile">
      <div class="level-left">
        <div class="level-item">
          <span class="icon-text">
            <span class="icon has-text-info">
              <i class="mdi mdi-api" />
            </span>
            <span class="has-text-weight-semibold">{{ title || 'API Example' }}</span>
          </span>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <div class="buttons">
            <a
              v-if="learnMoreUrl"
              :href="learnMoreUrl"
              class="button is-small is-outlined is-info"
              target="_blank"
              rel="noopener"
            >
              <span class="icon is-small">
                <i class="mdi mdi-book-open-variant" />
              </span>
              <span>Learn more</span>
            </a>
            <button
              class="button is-small is-outlined"
              :disabled="copying"
              @click="copyToClipboard"
            >
              <span class="icon is-small">
                <i class="mdi mdi-content-copy" />
              </span>
              <span>{{ copying ? 'Copied!' : 'Copy Query URL' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <p class="is-size-7 mb-2">
        {{ description }}
      </p>
      <pre class="api-example-code"><code>{{ apiUrl }}</code></pre>
    </div>
  </div>
</template>

<script>
import { useToastNotification } from '../libnuxt/toast'

export default {
  name: 'ApiExample',
  props: {
    title: {
      type: String,
      default: 'API Example'
    },
    description: {
      type: String,
      default: 'Use this endpoint to query the API:'
    },
    apiUrl: {
      type: String,
      required: true
    },
    learnMoreUrl: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      copying: false
    }
  },
  methods: {
    async copyToClipboard () {
      if (!this.apiUrl) return

      this.copying = true

      try {
        await navigator.clipboard.writeText(this.apiUrl)
        useToastNotification().showToast('API URL copied to clipboard')
      } catch (err) {
        console.error('Copy to clipboard failed:', err)
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = this.apiUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        useToastNotification().showToast('API URL copied to clipboard')
      }

      // Reset button text after a short delay
      setTimeout(() => {
        this.copying = false
      }, 1500)
    }
  }
}
</script>

<style scoped>
.api-example-box {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.api-example-code {
  word-break: break-all;
  white-space: pre-wrap;
}

pre {
  background: none;
  padding: 0;
  color: var(--bulma-code)
}
</style>
