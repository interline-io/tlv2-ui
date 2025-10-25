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
  hasAnyRole?: string[]
  excludeAnyRole?: string[]
}>(), {
  role: null,
  hasAnyRole: () => [],
  excludeAnyRole: () => []
})

// Composables
const { loggedIn } = useUser()
const notOk = useLoginGate({
  hasRole: props.role,
  hasAnyRole: props.hasAnyRole,
  excludeAnyRole: props.excludeAnyRole
})
</script>
