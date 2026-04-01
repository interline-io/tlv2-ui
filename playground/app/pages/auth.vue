<script setup lang="ts">
import { useUser } from '../../../src/runtime/composables/useUser'
import { useLogin } from '../../../src/runtime/composables/useLogin'
import { useLogout } from '../../../src/runtime/composables/useLogout'

const user = useUser()

async function login () {
  await useLogin(null)
}

async function logout () {
  await useLogout()
}
</script>

<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-3">
        Auth Debug
      </h1>

      <div class="box">
        <h2 class="title is-5">
          User
        </h2>
        <table class="table is-fullwidth">
          <tbody>
            <tr>
              <th>Logged In</th>
              <td>{{ user.loggedIn }}</td>
            </tr>
            <tr>
              <th>ID</th>
              <td>{{ user.id }}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{{ user.name }}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{{ user.email }}</td>
            </tr>
            <tr>
              <th>Roles</th>
              <td>{{ user.roles.length ? user.roles.join(', ') : '(none)' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="buttons">
        <button v-if="!user.loggedIn" class="button is-primary" @click="login">
          Login
        </button>
        <button v-if="user.loggedIn" class="button is-danger" @click="logout">
          Logout
        </button>
      </div>
    </section>
  </div>
</template>
