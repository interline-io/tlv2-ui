<template>
  <div class="columns is-gapless p-5">
    <aside class="column is-narrow menu">
      <div v-for="group in groups" :key="group.title">
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
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { NavGroup } from '../../navigation'

defineProps<{
  groups: NavGroup[]
}>()

const route = useRoute()
</script>
