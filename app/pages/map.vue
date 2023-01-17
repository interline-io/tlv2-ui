<template>
  <div>
    <title>Global transit map</title>
    <client-only placeholder="Map">
      <tl-pages-map />
    </client-only>
  </div>
</template>

<script>
definePageMeta({
  layout: 'map'
})
</script>
