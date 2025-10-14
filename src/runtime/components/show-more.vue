<template>
  <div>
    <a class="button is-primary is-small is-fullwidth" @click="$emit('showMore')">Show more results</a>
  </div>
</template>

<script setup lang="ts">
interface Props {
  limit?: number
}

withDefaults(defineProps<Props>(), {
  limit: 0
})

defineEmits<{
  showMore: []
}>()
</script>
