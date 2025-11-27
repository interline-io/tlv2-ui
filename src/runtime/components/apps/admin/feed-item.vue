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
  value?: Record<string, any>
  action?: string | null
}>(), {
  value: () => ({}),
  action: null
})

const emit = defineEmits<{
  (e: 'select', id: string): void
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
  emit('select', props.value.onestop_id)
}
</script>
