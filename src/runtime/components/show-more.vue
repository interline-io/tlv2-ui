<template>
  <div>
    <a class="button is-primary is-small is-fullwidth" @click="$emit('showMore')">Show more results</a>
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
