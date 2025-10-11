<template>
  <client-only placeholder="Login">
    <div v-if="notOk">
      <div v-if="loggedIn">
        <slot name="roleText">
          Feature unavailable
        </slot>
      </div>
      <div v-else>
        <slot name="loginText">
          Login required
        </slot>
      </div>
    </div>
    <div v-else>
      <slot name="default" />
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { useUser } from '../composables/useUser'
import { useLoginGate } from '../composables/useLoginGate'

// Props
const props = withDefaults(defineProps<{
  role?: string | null
}>(), {
  role: null
})

// Composables
const notOk = useLoginGate(props.role)
const loggedIn = useUser()?.loggedIn
</script>
