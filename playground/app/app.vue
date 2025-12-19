<template>
  <div id="app">
    <header class="navbar is-justify-content-center" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <NuxtLink to="/" class="navbar-item">
          <strong>tlv2-ui Component Library</strong>
        </NuxtLink>
      </div>
    </header>

    <div class="columns is-gapless p-5">
      <aside class="column is-narrow menu">
        <t-theme-toggle class="mb-3" />
        <div v-for="group in navigationGroups" :key="group.title">
          <p class="menu-label">
            {{ group.title }}
          </p>
          <ul class="menu-list">
            <li v-for="item in group.items" :key="item.path">
              <NuxtLink
                :to="item.path"
                :class="{ 'is-active': route.path === item.path }"
              >
                <t-icon :icon="item.icon" size="small" class="pr-2" />
                <span>{{ item.name }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </aside>

      <main class="column">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { navigationGroups } from '../navigation'

const route = useRoute()
</script>

<style lang="scss">
$primary: #ff0000;
$link: $primary;

@use "bulma/sass" with (
    $family-primary: '"Nunito", sans-serif',
    $primary: $primary,
    $link: $link,
);

.navbar {
  border-bottom:solid 1px #ccc;
}
</style>
