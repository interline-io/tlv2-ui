<template>
  <tl-modal 
    v-model="active"
    :title="title"
  >
    <!-- Stop Type Filters -->
    <o-field label="Stops to display">
      <div class="control">
        <div v-for="(label, type) in stopTypeLabels" :key="type">
          <o-checkbox
            :model-value="showStopTypes[type]"
            @update:model-value="updateFilter(Number(type), $event)"
          >
            {{ label }} 
            <o-tooltip>
              <o-icon icon="information" />
              <template #content>
                <code>location_type = {{ type }}</code>
              </template>
            </o-tooltip>
          </o-checkbox>
        </div>
      </div>
    </o-field>

    <hr>

    <!-- Route Options -->
    <o-field label="Routes to display">
      <div class="control">
        <div class="mb-2">
          <o-checkbox
            :model-value="showGeneratedGeometries"
            @update:model-value="$emit('update:showGeneratedGeometries', $event)"
          >
            Stop-to-stop geometries
            <o-tooltip label="For routes without agency-defined shapes, render straight lines between stops.">
              <o-icon icon="information" />
            </o-tooltip>
          </o-checkbox>
        </div>
        <div>
          <o-checkbox
            :model-value="showProblematicGeometries"
            @update:model-value="$emit('update:showProblematicGeometries', $event)"
          >
            Problematic geometries with long segment lengths
            <o-tooltip label="Routes with extra long segment lengths may look messy and obscure other routes.">
              <o-icon icon="information" />
            </o-tooltip>
          </o-checkbox>
        </div>
      </div>
    </o-field>
  </tl-modal>
</template>

<script setup>
// Define props
const props = defineProps({
  title: {
    type: String,
    default: 'Map Options'
  },
  modelValue: {
    type: Boolean,
    default: false
  },
  showStopTypes: {
    type: Object,
    required: true
  },
  showGeneratedGeometries: {
    type: Boolean,
    required: true
  },
  showProblematicGeometries: {
    type: Boolean,
    required: true
  }
})

// Define emits
const emit = defineEmits([
  'update:modelValue',
  'update:showStopTypes',
  'update:showGeneratedGeometries',
  'update:showProblematicGeometries'
])

// Computed for v-model binding
const active = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Define stop type labels
const stopTypeLabels = {
  0: 'Stops/Platforms',
  1: 'Stations',
  2: 'Entrances/Exits', 
  3: 'Generic Nodes',
  4: 'Boarding Areas'
}

function updateFilter(type, checked) {
  emit('update:showStopTypes', {
    ...props.showStopTypes,
    [type]: checked
  })
}
</script>

<style scoped>
.control {
  margin-bottom: 0.5rem;
}
</style> 