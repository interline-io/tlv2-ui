<template>
  <div class="control">
    <div class="tags has-addons">
      <tl-link
        :target="newTab ? '_blank' : '_self'"
        route-key="apps-admin-tenants-tenantKey"
        :to="{ params: { tenantKey: value.id } }"
      >
        <o-icon
          icon="star-box"
          class="mr-2"
        />
        {{ value.name }}
      </tl-link>
      <a
        v-if="action"
        :class="actionClass"
        @click.stop.prevent="select"
      ><o-icon :icon="actionIcon" /></a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: { type: Object, default () { return {} } },
    action: { type: String, default: null },
    newTab: { type: Boolean, default: false }
  },
  emits: [
    'select'
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
  },
  methods: {
    select () {
      this.$emit('select', this.value.id)
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
