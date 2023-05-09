<template>
  <div class="control">
    <div class="tags has-addons">
      <a class="tag is-medium">
        {{ user.name }} ({{ user.email }})
      </a>
      <a class="tag is-medium is-delete is-warning" @click="$emit('removeUser', user.id)" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    user: { type: Object, default() { return {} }, required: true },
    canRemove: { type: Boolean, default: false }
  },
  emits: [
    'removeUser'
  ]
}
</script>

<style scoped>
.user {
}
</style>
