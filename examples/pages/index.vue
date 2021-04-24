<template>
  <div>
    <tl-tlnav />
    <div style="padding:40px">
      <div>
        <strong>Routes for {{ sha1 }}:</strong>
      </div>
      <tl-route-viewer :feed-version-sha1="sha1" :limit="4" />

      <tl-feed-version-map-viewer :feedVersionSha1="sha1" />
    </div>

    <tl-tlfooter />
  </div>
</template>

<script>
export default {
  data () {
    return {"sha1": "e07738918bd9a53638061dafd14949b8adeea44d"}
  }
}
</script>
