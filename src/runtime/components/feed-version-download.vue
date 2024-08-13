<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <o-button v-else-if="loading" disabled>
      Downloading... please wait.
    </o-button>
    <o-button v-else variant="success" icon-left="download" @click="download">
      {{ text }}
    </o-button>
  </div>
</template>

<script>
import Loadable from './loadable'

export default {
  mixins: [Loadable],
  props: {
    text: { type: String, default: 'Download' },
    feedOnestopId: { type: String, required: true },
    feedVersionSha1: { type: String, default: '' },
    latest: { type: Boolean, default: false }
  },
  methods: {
    async download() {
      this.loading = true
      console.log('download')
      const url = this.latest
        ? `${this.apiBase}/rest/feeds/${this.feedOnestopId}/download_latest_feed_version`
        : `${this.apiBase}/rest/feed_versions/${this.feedVersionSha1}/download`
      let filename = ''
      await fetch(url, {
        headers: { authorization: await this.authBearer() }
      })
        .then((result) => {
          if (!result.ok) {
            throw new Error(result.status + ' ' + result.statusText)
          }
          const header = result.headers.get('Content-Disposition')
          const parts = header.split(';')
          filename = parts[1].split('=')[1].replaceAll('"', '')
          return result.blob()
        })
        .then((blob) => {
          this.loading = false
          if (blob != null) {
            console.log('download: got blob')
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            a.remove()
          }
        })
        .catch((err) => {
          console.log('download: failed', err)
          this.loading = false
          this.error = err
        })
    }
  }
}
</script>
