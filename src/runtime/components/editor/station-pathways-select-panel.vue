<template>
  <div>
    <nav class="panel station-editor-panel">
      <p class="panel-heading">
        Select
      </p>
      <div class="panel-block is-block">
        <div v-if="selectedStopsCount > 0 || selectedPathwaysCount > 0" class="mb-4">
          <p class="label is-small mb-2">
            Selected Items
            <o-button class="is-pulled-right" variant="primary is-small" outlined title="Or press ESC key to unselect all" @click="$emit('unselect-all')">
              Unselect All
            </o-button>
          </p>
          <div v-if="lastFilterApplied" class="notification is-info is-light py-2 px-3 mb-3">
            <p class="is-size-7">
              <strong>Filter:</strong> {{ lastFilterApplied }}
            </p>
          </div>
          <div v-if="selectedStopsCount > 0" class="mb-2">
            <p class="heading">
              Stops ({{ selectedStopsCount }})
            </p>
            <div class="menu">
              <ul class="menu-list">
                <li v-for="stop of selectedStops" :key="stop.id">
                  <a
                    @click="selectItem('stop', stop.id)"
                    @mouseenter="$emit('hover-stop', stop.id)"
                    @mouseleave="$emit('hover-stop', null)"
                  >
                    {{ stop.stop_name || stop.stop_id }}
                    <span class="has-text-grey is-size-7">
                      ({{ locationTypes.get(stop.location_type) || 'Node' }}
                      <template v-if="stop.level && stop.level.level_index != null">
                        · L{{ stop.level.level_index }}
                      </template>
                      <template v-else-if="!stop.level">
                        · Unassigned
                      </template>)
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div v-if="selectedPathwaysCount > 0">
            <p class="heading">
              Pathways ({{ selectedPathwaysCount }})
            </p>
            <div class="menu">
              <ul class="menu-list">
                <li v-for="pathway of selectedPathways" :key="pathway.id">
                  <a
                    @click="selectItem('pathway', pathway.id)"
                    @mouseenter="$emit('hover-pathway', pathway.id)"
                    @mouseleave="$emit('hover-pathway', null)"
                  >
                    {{ pathway.from_stop.stop_name }} → {{ pathway.to_stop.stop_name }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div v-if="selectedStopsCount === 0 && selectedPathwaysCount === 0">
          <div class="mb-2">
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
    selectedStops: {
      type: Array,
      required: true
    },
    selectedPathways: {
      type: Array,
      required: true
    },
    lastFilterApplied: {
      type: String,
      default: ''
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
    'select-stop',
    'select-pathway',
    'hover-stop',
    'hover-pathway',
    'select-location-types',
    'select-stops-with-associations',
    'select-stops-platforms-without-associations',
    'select-stops-entrances-without-associations',
    'select-stops-with-paired-pathways',
    'select-pathway-modes',
    'select-pathways-with-pairs',
    'select-pathways-oneway',
    'select-pathways-bidirectional'
  ],
  methods: {
    selectItem (type, id) {
      // First unselect all items
      this.$emit('unselect-all')
      // Then select the clicked item
      this.$nextTick(() => {
        if (type === 'stop') {
          this.$emit('select-stop', id)
        } else if (type === 'pathway') {
          this.$emit('select-pathway', id)
        }
      })
    }
  }
}
</script>

<style scoped>
.menu-list {
  max-height: 200px;
  overflow-y: auto;
}

.menu-list a {
  padding: 0.5em 0.75em;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
