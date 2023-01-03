<template>
  <div>
    <client-only placeholder="Map">
      <tl-pages-map />
    </client-only>
  </div>
</template>

<script>
definePageMeta({
  layout: 'map',
});

export default {
  head () {
    return {
      title: 'Global Transit Map'
    }
  }
}
</script>
