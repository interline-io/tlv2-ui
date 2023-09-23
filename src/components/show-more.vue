<template>
  <div style="text-align:center">
    <a class="button is-primary" @click="$emit('showMore')">Show more results</a>
  </div>
</template>

<script>
export default {
  props: {
    limit: { type: Number, default: 0 }
  },
  emits: ['showMore']
}
</script>
