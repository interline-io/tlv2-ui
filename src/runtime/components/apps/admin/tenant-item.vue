<template>
  <div class="control">
    <div class="tags has-addons">
      <tl-link
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

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value?: Record<string, any>
  action?: string | null
  newTab?: boolean
}>(), {
  value: () => ({}),
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
  emit('select', props.value.id)
}
</script>

<style scoped>
a.desc:hover {
  text-decoration: none;
  cursor: default;
}
</style>
