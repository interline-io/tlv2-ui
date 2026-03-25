<template>
  <div id="app">
    <header class="navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <NuxtLink to="/" class="navbar-item">
          <strong>tlv2-ui Component Library</strong>
        </NuxtLink>
      </div>
      <div class="navbar-menu">
        <div class="navbar-end">
          <NuxtLink to="/" class="navbar-item">
            <t-icon icon="palette-swatch" size="small" class="pr-1" />
            Controls
          </NuxtLink>
          <NuxtLink to="/apps" class="navbar-item">
            <t-icon icon="application" size="small" class="pr-1" />
            Apps
          </NuxtLink>
          <div class="navbar-item">
            <t-theme-toggle />
          </div>
          <navbar-user />
        </div>
      </div>
    </header>

    <sidebar-layout :groups="sidebarGroups">
      <NuxtPage />
    </sidebar-layout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { controlsGroups, appsGroups } from '../navigation'
import SidebarLayout from './components/sidebar-layout.vue'
import NavbarUser from './components/navbar-user.vue'

const route = useRoute()
const sidebarGroups = computed(() =>
  route.path.startsWith('/apps') || route.path.startsWith('/admin')
    ? appsGroups
    : controlsGroups
)
</script>

<style lang="scss">
$primary: #9e0e84;
$link: #234d8c;

@use "bulma/sass" with (
    $family-primary: '"Nunito", sans-serif',
    $primary: $primary,
    $link: $link,
);

.navbar {
  border-bottom:solid 1px #ccc;
}
</style>
