<template>
  <div>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const notOk = computed(() => {
  return useLoginGate({
    hasRole: props.role ?? undefined,
    hasAnyRole: props.hasAnyRole,
    excludeAnyRole: props.excludeAnyRole
  })
})
</script>
