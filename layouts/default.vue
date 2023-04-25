<template>
  <div class="outer">
    <Meta name="twitter:card" content="summary" />
    <Meta name="twitter:site" content="@transitland" />
    <Meta name="twitter:image" content="https://www.transit.land/images/transitland-logo-square-with-whitebackground-smaller.png" />
    <Meta name="twitter:image:alt" content="Transitland" />
    <tl-tlnav />
    <div class="main mb-6">
      <div class="container">
        <slot />
      </div>
    </div>
    <tl-tlfooter />
  </div>
</template>

<script setup>
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `Transitland • ${titleChunk}` : 'Transitland'
  }
})
</script>

<style scoped>
.outer {
  display:flex;
  min-height:100vh;
  flex-direction:column;
}

.main {
  flex:1;
  padding-top: 2em;
  padding-left:20px;
  padding-right:20px;
}

</style>
