<template>
  <div>
    <title>Transitland • Global transit map</title>
    <client-only placeholder="Map">
      <tl-pages-map />
    </client-only>
  </div>
</template>

<script>
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'map'
})
</script>
