<template>
  <article :class="msgClass">
    <div
      v-if="title || collapsible"
      class="message-header"
      :class="{ 'is-clickable': collapsible }"
      @click="collapsible && toggleCollapsed()"
    >
      <span>{{ title || defaultTitle }}</span>
      <o-icon
        v-if="collapsible"
        :icon="isCollapsed ? 'chevron-down' : 'chevron-up'"
        class="collapse-icon"
      />
    </div>
    <div
      v-if="!collapsible || !isCollapsed"
      :class="collapsible ? 'collapsible-content' : ''"
    >
      <template v-if="hasIcon">
        <div class="media message-body">
          <o-icon :icon="getIcon" size="medium" class="media-left" />
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

// TypeScript types and interfaces
type MessageVariant = 'info' | 'success' | 'warning' | 'danger' | 'primary' | 'link' | 'dark'

const props = withDefaults(defineProps<{
  variant?: MessageVariant
  title?: string | null
  icon?: string | null
  noIcon?: boolean
  collapsible?: boolean
  collapsed?: boolean
  defaultTitle?: string
}>(), {
  variant: 'info',
  title: null,
  icon: null,
  noIcon: false,
  collapsible: false,
  collapsed: false,
  defaultTitle: 'Information'
})

// Emits
const emit = defineEmits<{
  toggle: [isCollapsed: boolean]
}>()

// Reactive state
const isCollapsed = ref<boolean>(props.collapsed)

// Computed properties
const getIcon = computed<string>(() => {
  if (props.variant === 'info') {
    return 'information'
  }
  if (props.variant === 'danger' || props.variant === 'warning') {
    return 'alert'
  }
  return props.icon || props.variant
})

const hasIcon = computed<boolean>(() => !props.noIcon)

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
