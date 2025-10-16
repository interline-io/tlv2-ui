<template>
  <div>
    <a class="button is-primary is-small is-fullwidth" @click="$emit('showMore')">Show more results</a>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  limit?: number
}>(), {
  limit: 0
})

defineEmits<{
  showMore: []
}>()
</script>
