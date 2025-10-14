<template>
  <div class="tag message is-small">
    <slot />
    <o-icon v-if="closable" class="ml-1" size="small" icon="close" @click="$emit('close')" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  closable?: boolean
}

withDefaults(defineProps<Props>(), {
  closable: false
})

defineEmits<{
  close: []
}>()
</script>
