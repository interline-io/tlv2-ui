<template>
  <div class="tag message is-small">
    <slot />
    <b-icon class="ml-1" v-if="closable" size="small" icon="close" @click="$emit('close')" />
  </div>
</template>

<script>
export default {
  props: { closable: { type: Boolean, default: false }}
}
</script>