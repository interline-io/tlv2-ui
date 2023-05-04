<template>
  <div style="border:solid 2px;margin:5px;padding:5px;display:inline-block">
    Name: {{ user.name }} Email: {{ user.email }}
    <o-button v-if="canRemove" size="small" icon-left="delete" @click="$emit('removeUser', user.id)" />
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
