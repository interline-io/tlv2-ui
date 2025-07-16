<template>
  <tl-editor-station-isometric-3d
    :feed-key="feedKey"
    :feed-version-key="feedVersionKey"
    :station-key="stationKey"
  />
</template>

<script>
import StationMixin from './station-mixin'

export default {
  mixins: [StationMixin],
  layout: 'wide'
}
</script> 