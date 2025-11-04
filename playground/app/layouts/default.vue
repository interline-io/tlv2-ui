<template>
  <div class="outer">
    <tlnav />

    <div class="main" style="flex:1">
      <div class="container" :style="containerWidth">
        <tl-breadcrumbs
          :boxed="false"
        />

        <slot />
      </div>
    </div>
    <tlfooter />
  </div>
</template>

<script setup>
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `Playground • ${titleChunk}` : 'Playground'
  }
})

const props = defineProps({
  theme: { type: String, default: 'default' },
})

const containerWidth = computed(() => {
  return props.theme === 'wide' ? { 'max-width': '100%' } : {}
})
</script>

<style scoped>
.footer {
  padding:20px;
}

.outer {
  display:flex;
  min-height:100vh;
  flex-direction:column;
}

.main {
  flex:1;
}

.main {
  flex:1;
  padding-top: 20px;
  padding-left:20px;
  padding-right:20px;
  padding-bottom:20px;
}
</style>
