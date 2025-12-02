<template>
  <div>
    <div class="columns">
      <div class="column is-one-half">
        <t-field label="Pathway ID">
          <code v-if="readOnly">{{ pathway.pathway_id }}</code>
          <t-input v-else v-model="pathway.pathway_id" />
        </t-field>
        <t-field label="From">
          <span class="button stop-label" @click="$emit('select-stop', pathway.from_stop.id)">
            <template v-if="pathway.from_stop.stop_name">
              {{ pathway.from_stop.stop_name }}</template>
            <template v-else>
              Node (id: {{ pathway.from_stop.stop_id }})
            </template>

          </span>
        </t-field>
        <t-field label="To">
          <span class="button stop-label" @click="$emit('select-stop', pathway.to_stop.id)">
            <template v-if="pathway.to_stop.stop_name">
              {{ pathway.to_stop.stop_name }}</template>
            <template v-else>
              Node (id: {{ pathway.to_stop.stop_id }})
            </template>
          </span>
        </t-field>

        <t-field label="Mode">
          <t-select v-model="pathway.pathway_mode" :disabled="readOnly">
            <option v-for="[mode, label] in PathwayModes" :key="mode" :value="mode">
              {{ label }}
            </option>
          </t-select>
        </t-field>

        <t-field>
          <t-switch v-model="pathway.is_bidirectional" :true-value="1" :false-value="0" :disabled="readOnly">
            Bidirectional
          </t-switch>
        </t-field>

        <t-field label="Signposted as">
          <span v-if="readOnly">{{ pathway.signposted_as }}</span>
          <t-input v-else v-model="pathway.signposted_as" placeholder="Forward" />
        </t-field>
        <t-field>
          <span v-if="readOnly">{{ pathway.reverse_signposted_as }}</span>
          <t-input v-else v-model="pathway.reverse_signposted_as" placeholder="Reverse" />
        </t-field>
      </div>

      <div class="column is-one-half">
        <t-field label="Length">
          <t-field>
            <t-input
              v-model="pathway.length"
              number
              type="number"
              min="0"
              step="0.01"
              :disabled="readOnly"
              controls-position="compact"
            />
          </t-field>
        </t-field>

        <t-field label="Traversal time">
          <t-field>
            <t-input
              v-model="pathway.traversal_time"
              number
              type="number"
              min="0"
              :disabled="readOnly"
              controls-position="compact"
            />
          </t-field>
        </t-field>

        <t-field label="Stair count">
          <t-field>
            <t-input
              v-model="pathway.stair_count"
              number
              type="number"
              controls-position="compact"
              :disabled="readOnly"
            />
          </t-field>
        </t-field>

        <t-field label="Max slope">
          <t-field>
            <t-input
              v-model="pathway.max_slope"
              number
              type="number"
              step="0.01"
              controls-position="compact"
              :disabled="readOnly"
            />
          </t-field>
        </t-field>

        <t-field label="Minimum width">
          <t-field>
            <t-input
              v-model="pathway.min_width"
              number
              min="0"
              step="0.01"
              type="number"
              controls-position="compact"
              :disabled="readOnly"
            />
          </t-field>
        </t-field>
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
import { haversinePosition } from '../../../geom'
import { PathwayModes } from './basemaps'
import { Pathway } from './station'

export default {
  props: {
    station: {
      type: Object,
      default () { return {} }
    },
    value: {
      type: Object,
      default () { return {} }
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
      return haversinePosition(
        this.pathway.from_stop.geometry.coordinates,
        this.pathway.to_stop.geometry.coordinates
      ).toFixed(2)
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
