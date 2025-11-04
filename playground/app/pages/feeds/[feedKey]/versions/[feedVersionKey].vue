<template>
  <div>
    <tl-pages-feed-version
      :feed-version-key="String($route.params.feedVersionKey || '')"
      :can-edit="true"
    />
  </div>
</template>
