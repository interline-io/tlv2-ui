<template>
  <article :class="msgClass">
    <div
      v-if="title || expandable || closable"
      class="message-header"
      :class="{ 'is-clickable': expandable }"
      @click="expandable && toggle()"
    >
      <span>{{ title || defaultTitle }}</span>
      <t-icon
        v-if="expandable"
        :icon="isOpen ? 'chevron-up' : 'chevron-down'"
        class="t-collapse-icon"
      />
      <button
        v-if="closable"
        class="delete"
        aria-label="delete"
        @click.stop="handleClose"
      />
    </div>
    <div
      v-if="!expandable || isOpen"
      :class="expandable ? 't-expandable-content' : ''"
    >
      <template v-if="hasIcon">
        <div class="media message-body">
          <t-icon :icon="getIcon" size="large" class="media-left" />
          <div class="media-content">
            <slot />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="message-body">
          <slot />
        </div>
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { MsgVariant } from './types'

// TypeScript types and interfaces
type MessageVariant = MsgVariant | 'error'

const props = withDefaults(defineProps<{
  variant?: MessageVariant
  title?: string | null
  icon?: string | null
  showIcon?: boolean
  expandable?: boolean
  open?: boolean
  closable?: boolean
  defaultTitle?: string
}>(), {
  variant: 'info',
  title: null,
  icon: null,
  showIcon: false,
  expandable: false,
  open: false,
  closable: false,
  defaultTitle: 'Information'
})

// Emits
const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': []
}>()

// Reactive state
const isOpen = ref<boolean>(props.open)

// Computed properties
const getIcon = computed<string>(() => {
  if (props.icon) {
    return props.icon
  }
  if (props.variant === 'success') {
    return 'check-circle'
  }
  if (props.variant === 'danger' || props.variant === 'warning' || props.variant === 'error') {
    return 'alert'
  }
  return 'information'
})

const hasIcon = computed<boolean>(() => props.showIcon)

const msgClass = computed<string>(() => {
  if (props.variant) {
    return `message t-message mb-4 is-${props.variant}`
  }
  return 'message t-message mb-4'
})

// Watchers
watch(() => props.open, (newVal: boolean) => {
  isOpen.value = newVal
}, { immediate: true })

// Methods
const toggle = (): void => {
  isOpen.value = !isOpen.value
  emit('update:open', isOpen.value)
}

const handleClose = (): void => {
  emit('close')
}
</script>

<style scoped lang="scss">
@use "bulma/sass/utilities/initial-variables" as *;
@use "bulma/sass/utilities/derived-variables" as *;

.t-message {
  .message-header.is-clickable {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: background-color 0.2s ease;

    &:hover {
      opacity: 0.8;
    }
  }

  .t-collapse-icon {
    transition: transform 0.2s ease;
  }

  .t-expandable-content {
    transition: all 0.2s ease;
  }
}
</style>
