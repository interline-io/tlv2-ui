<template>
  <NuxtLayout name="default" theme="wide">
    <tl-editor-pages-station-stops
      :feed-key="$route.params.feedKey"
      :feed-version-key="$route.params.feedVersionKey"
      :station-key="$route.params.stationKey"
    />
  </NuxtLayout>
</template>

<script setup>
definePageMeta({
  layout: false,
})
</script>
