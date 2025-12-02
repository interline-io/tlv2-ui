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
          <t-select v-model="pathwayModeStr" :disabled="readOnly">
            <option v-for="[mode, label] in PathwayModes" :key="mode" :value="String(mode)">
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
              type="number"
              min="0"
              step="0.01"
              :disabled="readOnly"
            />
          </t-field>
        </t-field>

        <t-field label="Traversal time">
          <t-field>
            <t-input
              v-model="pathway.traversal_time"
              type="number"
              min="0"
              :disabled="readOnly"
            />
          </t-field>
        </t-field>

        <t-field label="Stair count">
          <t-field>
            <t-input
              v-model="pathway.stair_count"
              type="number"
              :disabled="readOnly"
            />
          </t-field>
        </t-field>

        <t-field label="Max slope">
          <t-field>
            <t-input
              v-model="pathway.max_slope"
              type="number"
              step="0.01"
              :disabled="readOnly"
            />
          </t-field>
        </t-field>

        <t-field label="Minimum width">
          <t-field>
            <t-input
              v-model="pathway.min_width"
              min="0"
              step="0.01"
              type="number"
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

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { haversinePosition } from '../../../geom'
import { PathwayModes } from './basemaps'
import { Pathway } from './station'
import type { PathwayData, StationData } from './types'

export default defineComponent({
  props: {
    station: {
      type: Object as PropType<StationData>,
      default: () => ({} as StationData)
    },
    value: {
      type: Object as PropType<PathwayData>,
      default: () => ({} as PathwayData)
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
    pathwayModeStr: {
      get (): string {
        return String(this.pathway.pathway_mode ?? '')
      },
      set (value: string) {
        this.pathway.pathway_mode = value ? Number.parseInt(value, 10) : undefined
      }
    },
    stopLength (): string {
      const fromCoords = this.pathway.from_stop?.geometry?.coordinates
      const toCoords = this.pathway.to_stop?.geometry?.coordinates
      if (!fromCoords || !toCoords) {
        return '0.00'
      }
      return haversinePosition(fromCoords, toCoords).toFixed(2)
    },
    stopTraversalTime (): number {
      return Number.parseFloat(this.stopLength) * 1.30
    }
  },
  watch: {
    'pathway.pathway_mode' (value: number) {
      if (value === 7) {
        this.pathway.is_bidirectional = 0
      } else {
        this.pathway.is_bidirectional = 1
      }
    }
  }
})
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
