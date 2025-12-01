<template>
  <div>
    <div
      class="tabs"
      :class="tabsClasses"
    >
      <ul>
        <li
          v-for="tab in tabs"
          :key="tab.value"
          :class="{ 'is-active': modelValue === tab.value }"
        >
          <a @click.prevent="selectTab(tab.value)">
            <span v-if="tab.icon" class="icon">
              <i :class="`mdi mdi-${tab.icon}`" />
            </span>
            <span>{{ tab.label }}</span>
          </a>
        </li>
      </ul>
    </div>
    <div class="tab-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number = string">
import { computed, provide, ref, watch, nextTick } from 'vue'

/**
 * Tabs component using Bulma styling.
 * Works with t-tab-item children to create tabbed interfaces.
 *
 * @example
 * ```vue
 * <t-tabs v-model="activeTab">
 *   <t-tab-item label="First">Content 1</t-tab-item>
 *   <t-tab-item label="Second">Content 2</t-tab-item>
 * </t-tabs>
 * ```
 */

import type { TabsSize, TabsPosition, TabsType } from './types'

interface Props {
  /** The active tab value (v-model) */
  modelValue?: T
  /** Position: 'left' (default), 'centered', 'right' */
  position?: TabsPosition
  /** Size: 'small', 'normal', 'medium', 'large' */
  size?: TabsSize
  /** Type: 'default', 'boxed', 'toggle', 'toggle-rounded' */
  type?: TabsType
  /** Make tabs take full width */
  expanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  position: 'left',
  size: 'normal',
  type: 'default',
  expanded: false
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

interface TabItem {
  label: string
  value: string | number
  icon?: string
}

const tabs = ref<TabItem[]>([])

function registerTab (label: string, value: string | number, icon?: string) {
  tabs.value.push({ label, value, icon })
}

provide('registerTab', registerTab)
provide('activeTab', computed(() => props.modelValue))

function selectTab (value: string | number) {
  emit('update:modelValue', value as T)
}

const tabsClasses = computed(() => {
  const classes: string[] = []

  if (props.position === 'centered') classes.push('is-centered')
  if (props.position === 'right') classes.push('is-right')

  if (props.size !== 'normal') classes.push(`is-${props.size}`)

  if (props.type === 'boxed') classes.push('is-boxed')
  if (props.type === 'toggle') classes.push('is-toggle')
  if (props.type === 'toggle-rounded') classes.push('is-toggle', 'is-toggle-rounded')

  if (props.expanded) classes.push('is-fullwidth')

  return classes
})

// Trigger resize event when tab changes (for maps and other components that need to resize)
watch(() => props.modelValue, () => {
  nextTick(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resize'))
    }
  })
})
</script>

<style>
/* Override .content ul styles for tabs */
.content .tabs ul {
  margin-left: 0;
  margin-inline-start: 0;
  list-style: none;
}
</style>
