<template>
  <div class="outer">
    <tl-tlnav />
    <div class="main" style="flex:1">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.main {
  height: calc(100vh - 60px);
  background:white;
  flex-grow:2;
}
</style>