<template>
  <div>
    <!-- This component is to glue together a map and data exporter -->
    <feed-version-map-viewer
      :features="features"
      :agency-ids="agencyIds"
      :overlay="true"
      :link-version="linkVersion"
      @set-route-features="routeFeatures = $event"
      @set-stop-features="stopFeatures = $event"
    />

    <data-export
      :agency-ids="agencyIds"
      :route-features="routeFeatures"
      :stop-features="stopFeatures"
      @set-features="features = $event"
    />
  </div>
</template>

<script>
export default {
  props: {
    agencyIds: {
      type: Array,
      default () {
        return []
      }

    }
  },
  data () {
    return {
      linkVersion: true,
      routes: [],
      stops: [],
      features: [],
      routeFeatures: [],
      stopFeatures: []
    }
  }
}
</script>
