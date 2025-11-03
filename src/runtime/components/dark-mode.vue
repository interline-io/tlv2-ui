<template>
  <div class="is-flex is-align-items-center" @click="toggleDarkMode()">
    <o-icon :icon="isDark ? 'weather-night' : 'weather-sunny'" title="Toggle light/dark mode for website styling" role="button" />
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
