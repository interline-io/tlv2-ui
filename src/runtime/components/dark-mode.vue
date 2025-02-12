<template>
  <div>
    <o-icon :icon="isDark ? 'weather-night' : 'weather-sunny'" @click="toggleDarkMode()" />
  </div>
</template>

<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
})

const toggleDarkMode = useToggle(isDark)

</script>

<style scoped>
</style>
