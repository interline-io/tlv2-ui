<template>
  <div>
    <tl-pages-feed
      :path-key="String($route.params.feedKey || '')"
    />
  </div>
</template>
