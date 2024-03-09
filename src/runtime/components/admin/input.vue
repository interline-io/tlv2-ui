<template>
  <div>
    <o-field v-if="canEdit && currentlyEditing">
      <o-input
        v-model="valueShadow"
        expanded
      />
      <o-button
        variant="danger"
        @click="cancel"
      >
        Cancel
      </o-button>
      <o-button
        variant="primary"
        icon-left="pencil"
        @click="save"
      >
        Save
      </o-button>
    </o-field>
    <div v-else>
      <span class="p-3">{{ value }}</span>
      <o-button
        v-if="canEdit"
        variant="primary"
        size="small"
        class="is-pulled-right"
        icon-left="pencil"
        @click="currentlyEditing = true"
      >
        Edit
      </o-button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: { type: String, default: '' },
    canEdit: { type: Boolean, default: false }
  },
  emits: ['save'],
  data () {
    return {
      valueShadow: this.value,
      currentlyEditing: false
    }
  },
  methods: {
    cancel () {
      this.valueShadow = this.value
      this.currentlyEditing = false
    },
    save () {
      this.$emit('save', this.valueShadow)
      this.currentlyEditing = false
    }
  }
}
</script>
