<template>
  <div>
    <slot name="title">
      <tl-title title="Group" />
    </slot>

    <tl-apps-admin-group :id="groupKey" />
  </div>
</template>

<script>
export default {
  props: {
    groupKey: { type: String, default: '' }
  }
}
</script>
