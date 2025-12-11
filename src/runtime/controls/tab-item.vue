<template>
  <div v-show="isActive">
    <slot />
  </div>
</template>

<script setup lang="ts" generic="T extends string | number = string">
import { inject, onMounted, computed, type ComputedRef } from 'vue'

/**
 * Tab item component - child of t-tabs.
 * Content is only displayed when this tab is active.
 *
 * @example
 * ```vue
 * <t-tab-item label="My Tab">
 *   <p>Tab content here</p>
 * </t-tab-item>
 * ```
 */

interface Props {
  /** The label displayed in the tab header */
  label: string
  /** The value used to identify this tab */
  value: T
  /** Optional icon to display */
  icon?: string
}

const props = defineProps<Props>()

const registerTab = inject<(label: string, value: string | number, icon?: string) => void>('registerTab')
const activeTab = inject<ComputedRef<string | number | undefined>>('activeTab')

onMounted(() => {
  if (registerTab) {
    registerTab(props.label, props.value, props.icon)
  }
})

const isActive = computed(() => {
  if (activeTab) {
    return activeTab.value === props.value
  }
  return false
})
</script>
