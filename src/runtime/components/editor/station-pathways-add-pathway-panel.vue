<template>
  <div>
    <nav class="panel station-editor-panel">
      <p class="panel-heading">
        Add Pathway
      </p>
      <div class="panel-block is-block">
        <tl-editor-pathway-editor
          :station="station"
          :value="pathway"
          @select-stop="$emit('select-stop', $event)"
          @create="$emit('create', $event)"
          @cancel="$emit('cancel')"
        />
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  props: {
    station: {
      type: Object,
      required: true
    },
    pathway: {
      type: Object,
      required: true
    }
  },
  emits: ['select-stop', 'create', 'cancel']
}
</script>
