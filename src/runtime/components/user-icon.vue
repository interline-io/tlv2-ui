<template>
  <div>
    <client-only>
      <template v-if="user && user.id">
        <span class="name">{{ user.name }}</span>
        <span class="button is-primary" @click="useLogout">Sign out</span>
      </template>
      <template v-else>
        <div class="field has-addons">
          <span class="button is-primary" @click="useLogin">Sign in</span>
          <a href="https://app.interline.io/products/tlv2_api/orders/new" class="button is-secondary">Sign up</a>
        </div>
      </template>
    </client-only>
  </div>
</template>

<script lang="ts" setup>
import { useLogin, useLogout, useUser } from '../plugins/auth'
const user = useUser()
</script>

<style scoped>
.name {
  display:inline-block;
  margin: 0px;
  margin-right:8px;
  padding: 8px;
  font-weight: bold;
}
</style>
