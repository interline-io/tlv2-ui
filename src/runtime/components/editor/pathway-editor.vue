<template>
  <div>
    <div class="columns">
      <div class="column is-one-half">
        <o-field label="Pathway ID">
          <code v-if="readOnly">{{ pathway.pathway_id }}</code>
          <o-input v-else v-model="pathway.pathway_id" />
        </o-field>
        <o-field label="From">
          <span class="button stop-label" @click="$emit('select-stop', pathway.from_stop.id)">
            <template v-if="pathway.from_stop.stop_name">
              {{ pathway.from_stop.stop_name }}</template>
            <template v-else>
              Node (id: {{ pathway.from_stop.stop_id }})
            </template>

          </span>
        </o-field>
        <o-field label="To">
          <span class="button stop-label" @click="$emit('select-stop', pathway.to_stop.id)">
            <template v-if="pathway.to_stop.stop_name">
              {{ pathway.to_stop.stop_name }}</template>
            <template v-else>
              Node (id: {{ pathway.to_stop.stop_id }})
            </template>
          </span>
        </o-field>

        <o-field label="Mode">
          <o-select v-model="pathway.pathway_mode" :disabled="readOnly">
            <option v-for="[mode, label] in PathwayModes" :key="mode" :value="mode">
              {{ label }}
            </option>
          </o-select>
        </o-field>

        <o-field>
          <o-switch v-model="pathway.is_bidirectional" :true-value="1" :false-value="0" :disabled="readOnly">
            Bidirectional
          </o-switch>
        </o-field>

        <o-field label="Signposted as">
          <span v-if="readOnly">{{ pathway.signposted_as }}</span>
          <o-input v-else v-model="pathway.signposted_as" placeholder="Forward" />
        </o-field>
        <o-field>
          <span v-if="readOnly">{{ pathway.reverse_signposted_as }}</span>
          <o-input v-else v-model="pathway.reverse_signposted_as" placeholder="Reverse" />
        </o-field>
      </div>

      <div class="column is-one-half">
        <o-field label="Length">
          <o-field>
            <o-input
              v-model="pathway.length"
              number
              type="number"
              min="0"
              step="0.01"
              :disabled="readOnly"
              controls-position="compact"
            />
          </o-field>
        </o-field>

        <o-field label="Traversal time">
          <o-field>
            <o-input
              v-model="pathway.traversal_time"
              number
              type="number"
              min="0"
              :disabled="readOnly"
              controls-position="compact"
            />
          </o-field>
        </o-field>

        <o-field label="Stair count">
          <o-field>
            <o-input
              v-model="pathway.stair_count"
              number
              type="number"
              controls-position="compact"
              :disabled="readOnly"
            />
          </o-field>
        </o-field>

        <o-field label="Max slope">
          <o-field>
            <o-input
              v-model="pathway.max_slope"
              number
              type="number"
              step="0.01"
              controls-position="compact"
              :disabled="readOnly"
            />
          </o-field>
        </o-field>

        <o-field label="Minimum width">
          <o-field>
            <o-input
              v-model="pathway.min_width"
              number
              min="0"
              step="0.01"
              type="number"
              controls-position="compact"
              :disabled="readOnly"
            />
          </o-field>
        </o-field>
      </div>
    </div>

    <template v-if="!readOnly">
      <div v-if="pathway.id" class="buttons">
        <span class="button is-primary" @click="$emit('update', pathway)">Save Pathway</span>
        <span class="button is-danger" @click="$emit('delete', pathway)">Delete Pathway</span>
      </div>
      <div v-else class="buttons">
        <span class="button is-primary" @click="$emit('create', pathway)">Add Pathway</span>
      </div>
    </template>
  </div>
</template>

<script>
import haversine from 'haversine'
import { PathwayModes } from './basemaps'
import { Pathway } from './station'

export default {
  props: {
    station: {
      type: Object,
      default () { return {} },
      required: true
    },
    value: {
      type: Object,
      default () {
        return {}
      },
      required: true
    },
    readOnly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: ['select-stop', 'update', 'delete', 'create'],
  data () {
    return {
      pathway: new Pathway(this.value).setDefaults(),
      PathwayModes
    }
  },
  computed: {
    stopLength () {
      return haversine({
        latitude: this.pathway.from_stop.geometry.coordinates[1],
        longitude: this.pathway.from_stop.geometry.coordinates[0]
      }, {
        latitude: this.pathway.to_stop.geometry.coordinates[1],
        longitude: this.pathway.to_stop.geometry.coordinates[0]
      }, { unit: 'meter' }).toFixed(2)
    },
    stopTraversalTime () {
      return this.stopLength * 1.30
    }
  },
  watch: {
    'pathway.pathway_mode' (value) {
      if (value === 7) {
        this.pathway.is_bidirectional = 0
      } else {
        this.pathway.is_bidirectional = 1
      }
    }
  }
}
</script>

<style scoped>
.stop-label {
  max-width:200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  justify-content: left;
}
</style>
