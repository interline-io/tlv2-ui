<template>
  <div v-if="path">
    <nav class="panel station-editor-panel">
      <p class="panel-heading">
        Find Route
      </p>
      <div class="panel-block is-block">
        <tl-editor-path-viewer :path="path" />
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  props: {
    path: {
      type: Object,
      default: null
    }
  }
}
</script>
