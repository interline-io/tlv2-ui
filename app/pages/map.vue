<template>
  <div>
    <client-only placeholder="Map">
      <tl-pages-map />
    </client-only>
  </div>
</template>

<script>
export default {
  layout: 'map',
  head () {
    return {
      title: 'Global Transit Map'
    }
  }
}
</script>
