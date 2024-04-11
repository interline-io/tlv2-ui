<template>
  <span class="button is-primary" @click="download">Download</span>
</template>

<script>
import Loadable from './loadable'

export default {
  mixins: [Loadable],
  props: {
    feedOnestopId: { type: String, required: true },
    feedVersionSha1: { type: String, required: true }
  },
  methods: {
    async download() {
      console.log('download')
      let filename = ''
      await fetch(`${this.apiBase}/rest/feed_versions/${this.feedVersionSha1}/download`, {
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
          if (blob != null) {
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
          console.log(err)
          alert(err)
        })
    }
  }
}
</script>
