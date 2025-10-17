<template>
  <div>
    <nav class="panel station-editor-panel">
      <p class="panel-heading">
        Select
      </p>
      <div class="panel-block is-block">
        <div class="mb-2">
          <p class="label">
            {{ selectedStopsCount }} stops selected
            <o-button v-if="selectedStopsCount > 0" class="is-pulled-right m-2" variant="primary is-small" outlined @click="$emit('unselect-all')">
              Unselect All
            </o-button>
          </p>
          <o-field label="Select Stops">
            <div class="buttons has-addons">
              <a v-for="[type, label] of locationTypes" :key="type" class="button is-small" @click="$emit('select-location-types', type)">
                {{ label }}
              </a>
            </div>
          </o-field>
          <o-field>
            <div class="buttons has-addons">
              <a class="button is-small" @click="$emit('select-stops-with-associations')">
                With associations
              </a>
              <a class="button is-small" @click="$emit('select-stops-platforms-without-associations')">
                Platforms w/o assoc.
              </a>
              <a class="button is-small" @click="$emit('select-stops-entrances-without-associations')">
                Entrances w/o assoc.
              </a>
            </div>
            <div class="buttons has-addons">
              <a class="button is-small" @click="$emit('select-stops-with-paired-pathways')">
                With paired pathways
              </a>
            </div>
          </o-field>
        </div>
        <div class="mb-2">
          <p class="label">
            {{ selectedPathwaysCount }} pathways selected
            <o-button v-if="selectedPathwaysCount > 0" class="is-pulled-right m-2" variant="primary is-small" outlined @click="$emit('unselect-all')">
              Unselect All
            </o-button>
          </p>
          <o-field label="Select Pathways">
            <div class="buttons has-addons">
              <a v-for="[mode, label] of pathwayModes" :key="mode" class="button is-small" @click="$emit('select-pathway-modes', mode)">
                {{ label }}
              </a>
            </div>
            <div class="buttons has-addons">
              <a class="button is-small" @click="$emit('select-pathways-with-pairs')">
                With pairs
              </a>
              <a class="button is-small" @click="$emit('select-pathways-oneway')">
                One-directional
              </a>
              <a class="button is-small" @click="$emit('select-pathways-bidirectional')">
                Bi-directional
              </a>
            </div>
          </o-field>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  props: {
    selectedStopsCount: {
      type: Number,
      required: true
    },
    selectedPathwaysCount: {
      type: Number,
      required: true
    },
    locationTypes: {
      type: Map,
      required: true
    },
    pathwayModes: {
      type: Map,
      required: true
    }
  },
  emits: [
    'unselect-all',
    'select-location-types',
    'select-stops-with-associations',
    'select-stops-platforms-without-associations',
    'select-stops-entrances-without-associations',
    'select-stops-with-paired-pathways',
    'select-pathway-modes',
    'select-pathways-with-pairs',
    'select-pathways-oneway',
    'select-pathways-bidirectional'
  ]
}
</script>
