<template>
  <button class="button mr-2" @click="saveFile">
    {{ label }}
  </button>
</template>

<script>

export default {
  props: {
    features: { type: Array, default () { return [] } },
    filename: { type: String, default: 'export.geojson' },
    label: { type: String, default: 'Download' }
  },
  methods: {
    saveFile () {
      const data = JSON.stringify(
        {
          type: 'FeatureCollection',
          features: this.features
        }
      )
      const blob = new Blob([data], { type: 'text/json' })
      const e = document.createEvent('MouseEvents')
      const a = document.createElement('a')
      a.download = this.$filters.sanitizeFilename(this.filename + '.geojson')
      a.href = window.URL.createObjectURL(blob)
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
      e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      a.dispatchEvent(e)
    }
  }
}
</script>
