<template>
  <o-input
    expanded
    root-class="is-expanded ml-0 mr-2"
    :model-value="modelValue"
    :placeholder="modelValue ? modelValue : placeholder"
    type="text"
    icon="magnify"
    :icon-right="modelValue ? 'close-circle' : undefined"
    icon-right-clickable
    class="entity-search"
    @update:model-value="emit('update:modelValue', $event ?? '')"
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
  'update:modelValue': [value: string]
}>()

// Methods
const clearSearch = (): void => {
  emit('update:modelValue', '')
}
</script>

<style scoped>
.entity-search {
  margin-bottom: 10px;
}
</style>
