<template>
  <div
    class="button is-ghost is-expanded"
    style="flex-grow:1;justify-content:left;color:#000;text-decoration:none;cursor:inherit"
  >
    {{ text }}
  </div>
</template>

<script>
export default {
  props: { text: { type: String, required: true, default: '' } }
}
</script>
