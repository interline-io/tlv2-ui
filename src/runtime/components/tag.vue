<template>
  <div class="tag message is-small">
    <slot />
    <o-icon v-if="closable" class="ml-1" size="small" icon="close" @click="$emit('close')" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  closable?: boolean
}>(), {
  closable: false
})

defineEmits<{
  close: []
}>()
</script>
