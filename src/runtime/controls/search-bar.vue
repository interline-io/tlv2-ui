<template>
  <t-input
    expanded
    :model-value="modelValue ?? undefined"
    :placeholder="modelValue ? modelValue : placeholder"
    type="text"
    icon="magnify"
    :icon-right="modelValue ? 'close-circle' : undefined"
    icon-right-clickable
    class="entity-search ml-0 mr-2"
    @update:model-value="handleInput"
    @icon-right-click="clearSearch"
  />
</template>

<script setup lang="ts">
/**
 * Search bar component wrapping t-input with search-specific styling.
 * Automatically shows clear button when populated and emits null when cleared.
 *
 * @component t-search-bar
 * @example
 * <t-search-bar v-model="searchQuery" placeholder="Search..." />
 */

interface Props {
  /**
   * Search query value (v-model).
   * Can be null when cleared.
   */
  modelValue?: string | null

  /**
   * Placeholder text.
   * @default 'Search'
   */
  placeholder?: string
}

const _props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

// Methods
function handleInput (value: string | number): void {
  const stringValue = String(value)
  emit('update:modelValue', (stringValue === '' || stringValue === undefined) ? null : stringValue)
}

const clearSearch = (): void => {
  emit('update:modelValue', null)
}
</script>
