<template>
  <o-input
    expanded
    root-class="is-expanded ml-0 mr-2"
    :value="modelValue"
    :placeholder="modelValue ? modelValue : placeholder"
    type="text"
    icon="magnify"
    :icon-right="modelValue ? 'close-circle' : null"
    icon-right-clickable
    class="entity-search"
    @update:model-value="$emit('update:modelValue', $event)"
    @icon-right-click="clearSearch"
    @keydown.esc="clearSearch"
  />
</template>
<script>
export default {
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Search' }
  },
  emits: ['update:modelValue'],
  methods: {
    clearSearch() {
      this.$emit('update:modelValue', '')
    }
  }
}
</script>

<style scoped>
.entity-search {
  margin-bottom: 10px;
}
</style>
