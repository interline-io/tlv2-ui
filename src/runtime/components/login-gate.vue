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

<script>
import { useUser } from '../composables/useUser'
import { useLoginGate } from '../composables/useLoginGate'

export default {
  props: {
    role: { type: String, default: null }
  },
  data () {
    const notOk = useLoginGate(this.role)
    const loggedIn = useUser()?.loggedIn
    return {
      notOk,
      loggedIn
    }
  }
}
</script>
