<template>
  <div>
    <slot name="title">
      <tl-title title="Group" />
    </slot>

    <tl-apps-admin-group :id="groupKey" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  groupKey?: string
}>(), {
  groupKey: ''
})
</script>
