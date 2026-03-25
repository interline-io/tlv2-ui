<template>
  <div v-if="user.loggedIn" class="navbar-item has-dropdown is-hoverable">
    <a class="navbar-link">
      <t-icon icon="account" size="small" class="pr-1" />
      {{ user.name || user.email }}
    </a>
    <div class="navbar-dropdown is-right">
      <a class="navbar-item" @click="useLogout()">
        Sign out
      </a>
    </div>
  </div>
  <div v-else class="navbar-item">
    <button class="button is-small is-link" @click="useLogin(route.fullPath)">
      Sign in
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUser, useLogin, useLogout } from '#imports'

const route = useRoute()
const user = useUser()
</script>
