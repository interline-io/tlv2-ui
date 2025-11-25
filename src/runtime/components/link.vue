<template>
  <nuxt-link v-if="resolvedTo" :to="resolvedTo" :title="title" v-bind="$attrs">
    <slot />
  </nuxt-link>
  <span v-else :title="title" v-bind="$attrs">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteResolver } from '../composables/useRouteResolver'

const props = defineProps<{
  to?: string | Record<string, any>
  routeKey?: string
  title?: string
}>()

const { resolve } = useRouteResolver()

// ...existing code...
const resolvedTo = computed(() => {
  if (props.routeKey) {
    const name = resolve(props.routeKey)

    if (!name) {
      console.warn(`[tlv2-ui] Route key '${props.routeKey}' resolved to empty string. Link will be disabled.`)
      return null
    }

    // If 'to' is an object, merge the resolved name into it
    if (typeof props.to === 'object' && props.to !== null) {
      return { ...props.to, name }
    }
    // ...existing code...

    // If 'to' is undefined, create a new object with the name
    if (!props.to) {
      return { name }
    }

    // If 'to' is a string, we can't easily merge a name into it.
    // We assume if routeKey is used, 'to' should be an object (for params) or undefined.
    // But if it is a string, we prioritize the routeKey's resolved name?
    // Or maybe we shouldn't support mixing string 'to' and 'routeKey'.
    // Let's assume object or undefined.
    return { name }
  }

  return props.to
})
</script>
