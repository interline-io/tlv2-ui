<template>
  <div v-if="user.loggedIn" class="navbar-item has-dropdown is-hoverable">
    <a class="navbar-link">
      <t-icon icon="account" size="small" class="pr-1" />
      {{ user.name || user.email }}
    </a>
    <div class="navbar-dropdown is-right">
      <a class="navbar-item" @click="logout">
        Sign out
      </a>
    </div>
  </div>
  <div v-else class="navbar-item">
    <button class="button is-small is-link" @click="login">
      Sign in
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUser } from '../../../src/runtime/composables/useUser'
import { useLogin } from '../../../src/runtime/composables/useLogin'
import { useLogout } from '../../../src/runtime/composables/useLogout'

const route = useRoute()
const user = useUser()

async function login () {
  await useLogin(route.fullPath)
}

async function logout () {
  await useLogout()
}
</script>
