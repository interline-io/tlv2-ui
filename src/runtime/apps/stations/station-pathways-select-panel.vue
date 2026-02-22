<template>
  <div>
    <nav class="panel station-editor-panel">
      <p class="panel-heading">
        <span>Select</span>
        <span v-if="selectedStopsCount > 0 || selectedPathwaysCount > 0" class="panel-heading-buttons">
          <button
            class="button is-small"
            @click="$emit('unselect-all')"
          >
            Unselect All <kbd>ESC</kbd>
          </button>
        </span>
      </p>
      <div class="panel-block is-block">
        <div v-if="selectedStopsCount > 0 || selectedPathwaysCount > 0" class="mb-4">
          <div v-if="lastFilterApplied" class="notification is-info is-light py-2 px-3 mb-3">
            <p class="is-size-7">
              <strong>Filter:</strong> {{ lastFilterApplied }}
            </p>
          </div>
          <div v-if="selectedStopsCount > 0" class="mb-2">
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
          <t-field
            v-for="(section, si) of filterSections"
            :key="section.label"
            :label="section.label"
            :class="{ 'mb-3': si < filterSections.length - 1 }"
          >
            <template v-for="(group, gi) of section.groups" :key="group.label">
              <p class="subcategory-label">
                {{ group.label }}
              </p>
              <div class="filter-buttons" :class="{ 'mb-2': gi < section.groups.length - 1 }">
                <t-tooltip v-for="btn of group.buttons" :key="btn.key" :text="btn.tooltip" position="bottom">
                  <t-button size="small" :disabled="!btn.count" @click="$emit(btn.event, btn.arg)">
                    {{ btn.label }}
                  </t-button>
                </t-tooltip>
              </div>
            </template>
          </t-field>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
function makeBtn (key, label, event, count, noun, arg) {
  const tooltip = count
    ? `${count} ${noun}`
    : `No ${noun} in this station`
  return { key, label, event, count, tooltip, arg }
}

export default {
  props: {
    filterCounts: {
      type: Object,
      default: () => ({})
    },
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
  computed: {
    filterSections () {
      const fc = this.filterCounts
      const stopCounts = fc.stopsByLocationType || {}
      const pwCounts = fc.pathwaysByMode || {}
      return [
        {
          label: 'Select Stops',
          groups: [
            {
              label: 'By type',
              buttons: [...this.locationTypes].map(([type, label]) =>
                makeBtn(type, label, 'select-location-types', stopCounts[type] || 0, `${label} stops`, type)
              )
            },
            {
              label: 'By filter',
              buttons: [
                makeBtn('assoc', 'With associations', 'select-stops-with-associations', fc.stopsWithAssociations || 0, 'stops with associations'),
                makeBtn('plat-no-assoc', 'Platforms w/o assoc.', 'select-stops-platforms-without-associations', fc.platformsWithoutAssociations || 0, 'platforms without associations'),
                makeBtn('ent-no-assoc', 'Entrances w/o assoc.', 'select-stops-entrances-without-associations', fc.entrancesWithoutAssociations || 0, 'entrances without associations'),
                makeBtn('paired-pw', 'With paired pathways', 'select-stops-with-paired-pathways', fc.stopsWithPairedPathways || 0, 'stops with paired pathways')
              ]
            }
          ]
        },
        {
          label: 'Select Pathways',
          groups: [
            {
              label: 'By mode',
              buttons: [...this.pathwayModes].map(([mode, label]) =>
                makeBtn(mode, label, 'select-pathway-modes', pwCounts[mode] || 0, `${label} pathways`, mode)
              )
            },
            {
              label: 'By direction',
              buttons: [
                makeBtn('pairs', 'With pairs', 'select-pathways-with-pairs', fc.pathwaysWithPairs || 0, 'pathways with pairs'),
                makeBtn('oneway', 'One-directional', 'select-pathways-oneway', fc.pathwaysOneway || 0, 'one-directional pathways'),
                makeBtn('bidir', 'Bi-directional', 'select-pathways-bidirectional', fc.pathwaysBidirectional || 0, 'bi-directional pathways')
              ]
            }
          ]
        }
      ]
    }
  },
  methods: {
    selectItem (type, id) {
      this.$emit('unselect-all')
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
.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-heading-buttons {
  display: flex;
  gap: 0.5rem;
}

.menu-list {
  max-height: 200px;
  overflow-y: auto;
}

.menu-list a {
  display: flex;
  align-items: center;
  padding: 0.5em 0.75em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: #3273dc;
  transition: background-color 0.2s, color 0.2s;
}

.menu-list a:hover {
  background-color: #f5f5f5;
  color: #363636;
}

.subcategory-label {
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.35rem;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.button kbd {
  display: inline-block;
  margin-left: 0.3em;
  padding: 0 0.3em;
  font-size: 0.7em;
  font-family: monospace;
  line-height: 1.4;
  color: inherit;
  background-color: rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  opacity: 0.75;
}
</style>
