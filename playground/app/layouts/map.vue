<template>
  <div class="outer">
    <tlnav />
    <div class="main" style="flex:1">
      <slot />
    </div>
  </div>
</template>

<script>
</script>

  <style scoped>
  .main {
    height: calc(100vh - 60px);
    flex-grow:2;
    padding: 0;
  }
  </style>
