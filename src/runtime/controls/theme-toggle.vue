<template>
  <t-button
    :variant="isDark ? 'dark' : 'light'"
    @click="toggleTheme"
  >
    <span class="icon">
      <i :class="`mdi mdi-${isDark ? 'weather-night' : 'weather-sunny'}`" />
    </span>
    <span>{{ isDark ? 'Dark' : 'Light' }} Mode</span>
  </t-button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

/**
 * Theme toggle component that switches between light and dark Bulma themes.
 * Uses prefers-color-scheme and persists preference to localStorage.
 *
 * @component t-theme-toggle
 * @example
 * <t-theme-toggle />
 */

const isDark = ref(false)

function applyTheme (dark: boolean) {
  const html = document.documentElement
  if (dark) {
    html.setAttribute('data-theme', 'dark')
  } else {
    html.setAttribute('data-theme', 'light')
  }
}

function toggleTheme () {
  isDark.value = !isDark.value
  applyTheme(isDark.value)

  // Persist to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }
}

onMounted(() => {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // Fall back to system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme(isDark.value)
  }
})
</script>
