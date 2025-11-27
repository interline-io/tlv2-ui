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
// Props
withDefaults(defineProps<{
  modelValue?: string | null
  placeholder?: string
}>(), {
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

<style scoped>
.entity-search {
  margin-bottom: 10px;
}
</style>
