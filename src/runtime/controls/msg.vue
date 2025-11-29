<template>
  <article :class="msgClass">
    <div
      v-if="title || collapsible || closable"
      class="message-header"
      :class="{ 'is-clickable': collapsible }"
      @click="collapsible && toggleCollapsed()"
    >
      <span>{{ title || defaultTitle }}</span>
      <t-icon
        v-if="collapsible"
        :icon="isCollapsed ? 'chevron-down' : 'chevron-up'"
        class="collapse-icon"
      />
      <button
        v-if="closable"
        class="delete"
        aria-label="delete"
        @click.stop="handleClose"
      />
    </div>
    <div
      v-if="!collapsible || !isCollapsed"
      :class="collapsible ? 'collapsible-content' : ''"
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
  collapsible?: boolean
  collapsed?: boolean
  closable?: boolean
  defaultTitle?: string
}>(), {
  variant: 'info',
  title: null,
  icon: null,
  showIcon: false,
  collapsible: false,
  collapsed: false,
  closable: false,
  defaultTitle: 'Information'
})

// Emits
const emit = defineEmits<{
  toggle: [isCollapsed: boolean]
  close: []
}>()

// Reactive state
const isCollapsed = ref<boolean>(props.collapsed)

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
    return `message mb-4 is-${props.variant}`
  }
  return 'message mb-4'
})

// Watchers
watch(() => props.collapsed, (newVal: boolean) => {
  isCollapsed.value = newVal
}, { immediate: true })

// Methods
const toggleCollapsed = (): void => {
  isCollapsed.value = !isCollapsed.value
  emit('toggle', isCollapsed.value)
}

const handleClose = (): void => {
  emit('close')
}
</script>

<style scoped>
.media {
    align-items: flex-start;
    display: flex;
}

.media-content {
    flex-basis: auto;
    flex-grow: 1;
    flex-shrink: 1;
    overflow:hidden; /* hack */
}

.media-left {
    flex-basis: auto;
    flex-grow: 0;
    flex-shrink: 0;
    padding: 1em;
}

/* Collapsible styles */
.message-header.is-clickable {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: background-color 0.2s ease;
}

.message-header.is-clickable:hover {
    opacity: 0.8;
}

.collapse-icon {
    transition: transform 0.2s ease;
}

.collapsible-content {
    transition: all 0.2s ease;
}
</style>
