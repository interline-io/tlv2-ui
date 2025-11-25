<template>
  <div class="control">
    <div class="tags has-addons">
      <tl-link
        class="tag is-medium desc"
        route-key="feeds-feedKey"
        :to="{ params: { feedKey: value.onestop_id } }"
      >
        <!-- <o-icon icon="account-group" class="mr-2" /> -->
        <template v-if="!value.name">
          {{ value.onestop_id }}
        </template>
        <template v-else>
          {{ value.name }}
        </template>
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
    action: { type: String, default: null }
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
      this.$emit('select', this.value.onestop_id)
    }
  }
}
</script>
