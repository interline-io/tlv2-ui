<template>
  <div>
    <h2 class="title is-2">
      <slot>{{ title }}</slot>
    </h2>
    <Title>{{ title }}</Title>
  </div>
</template>

<script>
export default {
  props: {
    title: { type: String, default: '', required: true }
  }
}
</script>

<style scoped>
  h2 {
    margin-top:1em;
    margin-bottom:1em;
    }
</style>
