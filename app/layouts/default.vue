<template>
  <div class="outer">
    <tl-tlnav />
    <div class="main" style="flex:1">
      <div class="container">
        <slot />
      </div>
    </div>
    <tl-tlfooter />
  </div>
</template>

<style scoped>
.outer {
  display:flex;
  min-height:100vh;
  flex-direction:column;
}

.main {
  flex:1;
  padding-top: 2em;
}
</style>
