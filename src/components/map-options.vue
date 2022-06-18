<template>
  <div>
    <div class="field">
      <b-checkbox
        :value="showGeneratedGeometries"
        @input="$emit('update:showGeneratedGeometries', $event)"
      >
        Show stop-to-stop geometries
      </b-checkbox>
    </div>
    <div class="field">
      <b-checkbox
        :value="showProblematicGeometries"
        @input="$emit('update:showProblematicGeometries', $event)"
      >
        Show problematic geometries
      </b-checkbox>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    showProblematicGeometries: { type: Boolean, default: true },
    showGeneratedGeometries: { type: Boolean, default: true }
  }
}
</script>
