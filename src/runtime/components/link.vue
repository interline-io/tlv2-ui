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
import { useRouter } from '#imports'
import { useRouteResolver } from '../composables/useRouteResolver'

const props = defineProps<{
  to?: string | Record<string, any>
  routeKey?: string
  title?: string
}>()

const router = useRouter()
const { resolve } = useRouteResolver()

// ...existing code...
const resolvedTo = computed(() => {
  let target: string | Record<string, any> | undefined

  if (props.routeKey) {
    const name = resolve(props.routeKey)

    if (!name) {
      console.warn(`[tlv2-ui] Route key '${props.routeKey}' resolved to empty string. Link will be disabled.`)
      return null
    }

    // If 'to' is an object, merge the resolved name into it
    if (typeof props.to === 'object' && props.to !== null) {
      target = { ...props.to, name }
    } else {
      // If 'to' is undefined or a string (which we ignore if routeKey is present), create a new object with the name
      target = { name }
    }
  } else {
    target = props.to
  }

  if (!target) return null

  try {
    // Check if the route exists to avoid "No match for..." errors
    router.resolve(target)
    return target
  } catch (e) {
    console.warn(`[tlv2-ui] Route resolution failed for target:`, target, e)
    return null
  }
})
</script>
