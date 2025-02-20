<template>
  <o-field grouped>
    <!-- These are arranged in this specific way to get correct widths and 'addon' rounding -->

    <!-- Text or edit -->
    <o-field addons class="is-fullwidth">
      <!-- Editable field -->
      <template v-if="currentlyEditing">
        <o-input
          v-model="valueShadow"
          size="small"
          expanded
        />
        <!-- Editing buttons -->
        <o-button
          variant="danger"
          size="small"
          @click="cancel"
        >
          Cancel
        </o-button>
        <o-button
          variant="primary"
          icon-left="pencil"
          size="small"
          @click="save"
        >
          Save
        </o-button>
      </template>

      <div v-else class="is-fullwidth">
        {{ value }}
      </div>

      <!-- Show edit button? -->
      <o-field v-if="canEdit && !currentlyEditing">
        <o-button
          size="small"
          variant="primary"
          icon-left="pencil"
          @click="currentlyEditing = true"
        >
          Edit
        </o-button>
      </o-field>
    </o-field>

    <!-- Show links -->
    <o-field
      v-if="link"
      grouped
    >
      <slot name="link" />
    </o-field>
  </o-field>
</template>

<script>
export default {
  props: {
    value: { type: String, default: '' },
    canEdit: { type: Boolean, default: false },
    link: { type: Boolean, default: false },
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

<style scoped>
.is-fullwidth {
  width:100%;
}
</style>
