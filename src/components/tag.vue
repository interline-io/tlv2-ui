<template>
  <div class="tag message is-small">
    <slot />
    <o-icon
      v-if="closable"
      class="ml-1"
      size="small"
      icon="close"
      @click="$emit('close')"
    />
  </div>
</template>

<script>
export default {
  props: { closable: { type: Boolean, default: false } },
  emits: ['close']
}
</script>
