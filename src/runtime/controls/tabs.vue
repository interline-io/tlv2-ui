<template>
  <div>
    <div
      class="tabs"
      :class="tabsClasses"
    >
      <ul>
        <li
          v-for="(tab, index) in tabs"
          :key="index"
          :class="{ 'is-active': modelValue === index }"
        >
          <a @click.prevent="selectTab(index)">
            {{ tab.label }}
          </a>
        </li>
      </ul>
    </div>
    <div class="tab-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
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

interface Props {
  /** The active tab index (v-model) */
  modelValue?: number
  /** Alignment: 'left' (default), 'centered', 'right' */
  align?: 'left' | 'centered' | 'right'
  /** Size: 'small', 'normal', 'medium', 'large' */
  size?: 'small' | 'normal' | 'medium' | 'large'
  /** Style: 'default', 'boxed', 'toggle', 'toggle-rounded' */
  style?: 'default' | 'boxed' | 'toggle' | 'toggle-rounded'
  /** Make tabs take full width */
  fullwidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  align: 'left',
  size: 'normal',
  style: 'default',
  fullwidth: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

interface TabItem {
  label: string
}

const tabs = ref<TabItem[]>([])

function registerTab (label: string) {
  tabs.value.push({ label })
  return tabs.value.length - 1
}

provide('registerTab', registerTab)
provide('activeTab', computed(() => props.modelValue))

function selectTab (index: number) {
  emit('update:modelValue', index)
}

const tabsClasses = computed(() => {
  const classes: string[] = []

  if (props.align === 'centered') classes.push('is-centered')
  if (props.align === 'right') classes.push('is-right')

  if (props.size !== 'normal') classes.push(`is-${props.size}`)

  if (props.style === 'boxed') classes.push('is-boxed')
  if (props.style === 'toggle') classes.push('is-toggle')
  if (props.style === 'toggle-rounded') classes.push('is-toggle', 'is-toggle-rounded')

  if (props.fullwidth) classes.push('is-fullwidth')

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
