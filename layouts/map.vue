<template>
  <div class="outer">
    <tl-tlnav />
    <div class="main">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.main {
  height: calc(100vh - 60px);
  background:white;
  flex:1;
  flex-grow:2;
}
</style>
