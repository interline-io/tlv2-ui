<template>
  <div>
    <div v-if="useLoginGate">
      <slot name="loginText">
        Login required
      </slot>
    </div>
    <div v-else>
      <slot name="default" />
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return { useLoginGate: useLoginGate() }
  }
}
</script>
