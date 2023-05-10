<template>
  <div class="control">
    <div class="tags has-addons">
      <a class="tag is-medium desc">
        {{ user.name }} ({{ user.email }})
      </a>
      <a v-if="action" :class="actionClass" @click.stop.prevent="$emit('selectUser', user.id)"><o-icon :icon="actionIcon" /></a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    user: { type: Object, default() { return {} }, required: true },
    action: { type: String, default: null }
  },
  emits: [
    'selectUser'
  ],
  computed: {
    actionClass () {
      if (this.action === 'add') {
        return 'tag is-medium is-primary'
      } else if (this.action === 'remove') {
        return 'tag is-medium is-danger'
      }
      return null
    },
    actionIcon () {
      if (this.action === 'add') {
        return 'plus'
      } else if (this.action === 'remove') {
        return 'close'
      }
      return null
    }
  }
}
</script>

<style scoped>
a.desc:hover {
  text-decoration: none;
  cursor: default;
}
</style>
