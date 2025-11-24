<template>
  <!-- @vue-skip -->
  <o-loading
    v-model:active="activeModel"
    :full-page="fullPage"
    :is-full-page="isFullPage"
    v-bind="$attrs"
  >
    <slot />
  </o-loading>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  active?: boolean
  fullPage?: boolean
  isFullPage?: boolean
}>(), {
  active: true,
  fullPage: true,
  isFullPage: undefined
})

const emit = defineEmits<{
  'update:active': [value: boolean]
}>()

const activeModel = computed({
  get: () => props.active,
  set: value => emit('update:active', value)
})
</script>
