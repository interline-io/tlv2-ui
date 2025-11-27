<template>
  <div v-show="isActive">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, computed, ref, type ComputedRef } from 'vue'

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
}

const props = defineProps<Props>()

const registerTab = inject<(label: string) => number>('registerTab')
const activeTab = inject<ComputedRef<number>>('activeTab')

const tabIndex = ref<number>(-1)

onMounted(() => {
  if (registerTab) {
    tabIndex.value = registerTab(props.label)
  }
})

const isActive = computed(() => {
  if (activeTab && tabIndex.value >= 0) {
    return activeTab.value === tabIndex.value
  }
  return false
})
</script>
