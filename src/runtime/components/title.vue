<template>
  <div>
    <h1 class="title is-1">
      <slot>{{ title }}</slot>
    </h1>
    <Head>
      <Title>{{ title }}</Title>
      <Meta name="description" :content="description || title" />
      <Meta name="twitter:title" :content="title" />
      <Meta name="twitter:description" :content="description || title" />
      <Meta name="og:title" :content="title" />
      <Meta name="og:description" :content="description || title" />
    </Head>
  </div>
</template>

<script setup lang="ts">
// Props
withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: '',
  description: ''
})
</script>

<style scoped>
  h1 {
    margin-top:0.5em;
    margin-bottom:0.5em;
    }
</style>
