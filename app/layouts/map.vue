<template>
  <div class="outer">
    <tl-tlnav />
    <div class="main" style="flex:1">
      <slot />
    </div>
  </div>
</template>

<script>
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `Transitland • ${titleChunk}` : 'Transitland'
  }
})
</script>

<style scoped>
.main {
  height: calc(100vh - 60px);
  background:white;
  flex-grow:2;
}
</style>