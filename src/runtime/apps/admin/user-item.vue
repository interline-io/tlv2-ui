<template>
  <div class="control">
    <div class="tags has-addons">
      <a
        :target="newTab ? '_blank' : '_self'"
        class="tag is-medium desc"
      >
        <t-icon
          icon="account"
          class="mr-2"
        />
        {{ user.name }}
      </a>
      <a
        v-if="action && actionIcon"
        :class="actionClass"
        @click.stop.prevent="select"
      ><t-icon :icon="actionIcon" /></a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  user?: Record<string, any>
  action?: string | null
  newTab?: boolean
}>(), {
  user: () => ({}),
  action: null,
  newTab: false
})

const emit = defineEmits<{
  (e: 'select', id: string | number): void
}>()

const actionClass = computed(() => {
  if (props.action === 'add') {
    return 'tag is-medium is-primary'
  } else if (props.action === 'remove') {
    return 'tag is-medium is-danger'
  }
  return null
})

const actionIcon = computed(() => {
  if (props.action === 'add') {
    return 'plus'
  } else if (props.action === 'remove') {
    return 'close'
  }
  return undefined
})

const select = () => {
  emit('select', props.user.id)
}
</script>

<style scoped>
a.desc:hover {
  text-decoration: none;
  cursor: default;
}
</style>
