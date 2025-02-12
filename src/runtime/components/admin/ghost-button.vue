<template>
  <div
    class="button is-ghost is-expanded"
  >
    {{ text }}
  </div>
</template>

<script>
export default {
  props: { text: { type: String, required: true, default: '' } }
}
</script>

<style scoped lang="scss">
.is-ghost {
  flex-grow:1;
  justify-content:left;
  color:var(--bulma-link-on-theme);
  text-decoration:none;
  cursor:inherit
}
</style>
