<template>
      <b-input
        expanded
        root-class="is-expanded ml-0 mr-2"
        :value="modelValue"
        :placeholder="placeholder"
        type="text"
        icon="magnify"
        :icon-right="modelValue ? 'close-circle' : null"
        icon-right-clickable
        class="entity-search"
        @input="$emit('update:modelValue', $event.target.value)"
        @icon-right-click="clearSearch"
        @keydown.esc="clearSearch"
      />
</template>
<script>
export default {
  props: {
    modelValue: { type: String, default: "" },
    placeholder: { type: String, default: "Search" },
  },
  emits: ["update:modelValue"],
  methods: {
    clearSearch() {
      this.$emit("update:modelValue", "");
    },
  },
};
</script>
