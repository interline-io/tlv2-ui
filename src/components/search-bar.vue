<template>
  <div>
    <b-field>
      <b-input
        :value="modelValue" 
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        type="text"
        icon="magnify"
        :icon-right="modelValue ? 'close-circle' : null"
        icon-right-clickable
        class="entity-search"
        @icon-right-click="clearSearch"
        @keydown.esc="clearSearch"
      />
    </b-field>
  </div>
</template>
<script>
export default {
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Search' }
  },
  emits: ['update:modelValue'],
  methods: {
    clearSearch () {
      this.$emit('update:modelValue', '')
    }
  }
}
</script>
