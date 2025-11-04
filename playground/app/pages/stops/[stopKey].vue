<template>
  <div>
    <tl-pages-stop
      :path-key="String($route.params.stopKey || '')"
      :entity-id="String($route.query.stop_id || $route.query.entityId || '')"
      :feed-onestop-id="String($route.query.feed_onestop_id || $route.query.feedOnestopId || '')"
      :feed-version-sha1="String($route.query.feed_version_sha1 || $route.query.feedVersionSha1 || '')"
    />
  </div>
</template>
