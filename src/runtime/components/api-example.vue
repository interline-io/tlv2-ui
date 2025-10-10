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

<script setup lang="ts">
import { ref } from 'vue'
import { useToastNotification } from '../composables/useToastNotification'

// TypeScript interfaces
interface Props {
  title?: string
  description?: string
  apiUrl: string
  learnMoreUrl?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  title: 'API Example',
  description: 'Use this endpoint to query the API:',
  learnMoreUrl: null
})

// Reactive data
const copying = ref<boolean>(false)

// Get toast notification composable
const { showToast } = useToastNotification()

// Methods
const copyToClipboard = async (): Promise<void> => {
  if (!props.apiUrl) return

  copying.value = true

  try {
    await navigator.clipboard.writeText(props.apiUrl)
    showToast('API URL copied to clipboard')
  } catch (err) {
    console.error('Copy to clipboard failed:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = props.apiUrl
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showToast('API URL copied to clipboard')
  }

  // Reset button text after a short delay
  setTimeout(() => {
    copying.value = false
  }, 1500)
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
