<template>
  <div>
    <div class="columns">
      <div class="column is-one-half">
        <o-field label="Stop ID">
          <code v-if="readOnly">{{ entity.stop_id }}</code>
          <span v-else-if="targetActiveStop">
            <o-input v-model="targetActiveStop.stop_id" disabled icon-right="target" /><br>
            <o-input v-model="entity.stop_id" class="mt-2" />
          </span>
          <o-input v-else v-model="entity.stop_id" />
        </o-field>

        <o-field label="Name">
          <span v-if="readOnly">{{ entity.stop_name }}</span>
          <span v-else-if="targetActiveStop">
            <o-input v-model="targetActiveStop.stop_name" disabled icon-right="target" /><br>
            <o-input v-model="entity.stop_name" class="mt-2" />
          </span>
          <o-input v-else v-model="entity.stop_name" />
        </o-field>

        <o-field label="Platform Code">
          <span v-if="readOnly">{{ entity.platform_code }}</span>
          <o-input v-else v-model="entity.platform_code" />
        </o-field>

        <o-field label="Location Type">
          <o-select v-model="entity.location_type" :disabled="readOnly">
            <option v-for="[type,label] of LocationTypes.entries()" :key="type" :value="type">
              {{ label }}
            </option>
          </o-select>
        </o-field>

        <o-field>
          <o-switch v-model="entity.wheelchair_boarding" :true-value="1" :false-value="0" :disabled="readOnly">
            Wheelchair boarding
          </o-switch>
        </o-field>
      </div>

      <div class="column is-one-half">
        <o-field label="Level">
          <o-select v-model="entity.level.id" :disabled="readOnly">
            <option v-for="level of station.levels" :key="level.id" :value="level.id">
              {{ level.level_name }}
            </option>
          </o-select>
        </o-field>

        <o-field v-if="(entity.location_type === 4 || (entity.parent && entity.parent?.id !== station.id))" label="Parent">
          <o-dropdown
            v-model="entity.parent.id"
            aria-role="list"
            :scrollable="true"
            :max-height="200"
          >
            <template #trigger>
              <button class="button stop-label" type="button">
                <template v-if="parentStop">
                  {{ parentStop.stop_name }} &nbsp;
                </template>
                <template v-else>
                  None
                </template>
                <o-icon icon="menu-down" />
              </button>
            </template>
            <o-dropdown-item :value="station.stop.id" aria-role="listitem">
              <h3>{{ station.stop.stop_name }}</h3>
              <small> Station </small>
            </o-dropdown-item>
            <!-- Stops can be "lost" if parent is unset completely. Don't allow this in UI -->
            <!-- <o-dropdown-item :value="-1" aria-role="listitem">
              <h3>No parent</h3>
            </o-dropdown-item> -->
            <o-dropdown-item v-for="ss of platformStops" :key="ss.id" :value="ss.id" aria-role="listitem" :disabled="ss.id === entity.id">
              <h3>{{ ss.stop_name }}</h3>
              <small> Platform: {{ routeSummary(ss) }}</small>
            </o-dropdown-item>
          </o-dropdown>
        </o-field>

        <!-- Association editor -->
        <template v-if="showStopAssociations">
          <!-- A target association is set (from result) -->
          <o-field v-if="value.external_reference?.target_feed_onestop_id" label="Target">
            <span v-if="targetActiveStop" class="button stop-label is-info">
              <o-icon icon="check" class="mr-2" /> {{ targetActiveStop.stop_name }} ({{ targetActiveStop.stop_id }})
            </span>
            <span v-else class="button stop-label is-danger">
              <o-icon icon="alert-circle-outline" class="mr-2" /> Not found: {{ value.external_reference.target_feed_onestop_id }}:{{ value.external_reference.target_stop_id }}
            </span>
          </o-field>

          <!-- Edit target -->
          <o-field label="Target Feed">
            <o-input v-model="entity.external_reference.target_feed_onestop_id" />
          </o-field>
          <o-field label="Target Stop">
            <o-input v-model="entity.external_reference.target_stop_id" />
          </o-field>
          <span v-if="!readOnly" class="button stop-label" @click="deleteAssociation">Remove association</span><br><br>
        </template>
        <template v-else-if="stopAssociationsEnabled && !readOnly">
          <span class="button" @click="createAssociation">Add association</span>
        </template>
      </div>
    </div>

    <!-- Pathways viewer -->
    <o-field v-if="!hidePathways && pathwaysFromStop.length > 0" label="Pathways (From)">
      <ul>
        <li v-for="pw of pathwaysFromStop" :key="pw.id">
          <span class="button" :title="pw.pathway_id" @click="$emit('select-pathway', pw.id)">
            <span class="tl-path-icon"><img :src="pathwayIcon(pw.pathway_mode).url" :title="pathwayIcon(pw.pathway_mode).label"></span>
            <span v-if="pw.is_bidirectional === 1">
              ↔
            </span>
            <span v-else>
              →
            </span>
            {{ pw.to_stop.stop_name }}
          </span>
        </li>
      </ul>
    </o-field>
    <o-field v-if="!hidePathways && pathwaysToStop.length" label="Pathways (To)">
      <ul>
        <li v-for="pw of pathwaysToStop" :key="pw.id">
          <span class="button" :title="pw.pathway_id" @click="$emit('select-pathway', pw.id)">
            <span class="tl-path-icon"><img :src="pathwayIcon(pw.pathway_mode).url" :title="pathwayIcon(pw.pathway_mode).label"></span>
            <span v-if="pw.is_bidirectional === 1">
              ↔
            </span>
            <span v-else>
              ←
            </span>
            {{ pw.from_stop.stop_name }}
          </span>
        </li>
      </ul>
    </o-field>

    <!-- Show target routes -->
    <o-field v-if="targetActiveStop" label="Routes (Associated)">
      <ul>
        <li v-for="rt of targetActiveStop.route_stops" :key="rt.route.id">
          {{ rt.route.agency.agency_id }}:{{ rt.route.route_short_name || rt.route.route_long_name }}
        </li>
      </ul>
    </o-field>

    <!-- Associated routes viewer -->
    <o-field v-if="value.route_stops?.length" label="Routes (Direct)">
      <ul>
        <li v-for="rt of value.route_stops || []" :key="rt.route.id">
          {{ rt.route.agency.agency_id }}:{{ rt.route.route_short_name || rt.route.route_long_name }}
        </li>
      </ul>
    </o-field>

    <template v-if="!readOnly">
      <div v-if="entity.id" class="field is-grouped">
        <div class="control">
          <span class="button" @click="$emit('cancel')">Cancel</span>
        </div>
        <div class="control is-expanded" />
        <div class="control">
          <span class="button is-danger" @click="deleteStop">Delete stop</span>
        </div>
        <div class="control">
          <span class="button is-primary" @click="updateStop">Save stop</span>
        </div>
      </div>
      <div v-else class="field is-grouped">
        <div class="control">
          <span class="button" @click="$emit('cancel')">Cancel</span>
        </div>
        <div class="control is-expanded" />
        <div class="control">
          <span class="button is-primary" @click="createStop">Add stop</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { LocationTypes, PathwayModeIcons } from './basemaps'
import { Stop } from './station'

export default {
  props: {
    value: {
      type: Object,
      required: true,
      default () { return {} }
    },
    station: {
      type: Object,
      required: true,
      default () { return null }
    },
    readOnly: {
      type: Boolean,
      required: false,
      default: false
    },
    stopAssociationsEnabled: {
      type: Boolean,
      required: false,
      default: false
    },
    currentMode: {
      type: String,
      reqiored: false,
      default: 'pathways'
    },
    hidePathways: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: ['select-pathway', 'create-association', 'update', 'delete', 'create', 'cancel'],
  data () {
    const stopCopy = new Stop(this.value).setDefaults()
    const entity = {
      id: stopCopy.id,
      stop_id: stopCopy.stop_id,
      stop_name: stopCopy.stop_name,
      platform_code: stopCopy.platform_code,
      location_type: stopCopy.location_type,
      geometry: stopCopy.geometry,
      wheelchair_boarding: stopCopy.wheelchair_boarding,
      parent: { id: stopCopy.parent?.id },
      level: { id: stopCopy.level?.id },
      external_reference: stopCopy.external_reference
        ? {
            target_feed_onestop_id: stopCopy.external_reference?.target_feed_onestop_id || null,
            target_stop_id: stopCopy.external_reference?.target_stop_id || null,
          }
        : null
    }
    return {
      showStopAssociations: stopCopy.external_reference ? true : false,
      targetActiveStop: stopCopy.external_reference?.target_active_stop || null,
      pathwaysFromStop: stopCopy.pathways_from_stop || [],
      pathwaysToStop: stopCopy.pathways_to_stop || [],
      entity: entity,
      originalEntity: JSON.parse(JSON.stringify(entity)),
      LocationTypes,
    }
  },
  computed: {
    platformStops () {
      return this.station.stops.filter((s) => { return s.location_type === 0 })
    },
    parentStop () {
      if (this.entity.parent?.id === this.station.id) {
        return this.station.stop
      }
      for (const s of this.station.stops) {
        if (s.id === this.entity.parent?.id) {
          return s
        }
      }
      return null
    },
    coordinates () {
      return `${this.entity.geometry.coordinates[0].toFixed(5)}, ${this.entity.geometry.coordinates[1].toFixed(5)}`
    }
  },
  methods: {
    updateStop () {
      this.$emit('update', new Stop(this.entity))
    },
    createStop () {
      this.$emit('create', new Stop(this.entity))
    },
    deleteStop () {
      this.$emit('delete', new Stop(this.entity))
    },
    createAssociation () {
      this.entity.external_reference = {
        target_feed_onestop_id: '',
        target_stop_id: ''
      }
      this.showStopAssociations = true
    },
    deleteAssociation () {
      this.showStopAssociations = false
      this.entity.external_reference = { target_feed_onestop_id: null, target_stop_id: null }
    },
    pathwayIcon (mode) {
      const m = PathwayModeIcons[mode]
      if (!m) {
        return { url: '', label: '' }
      }
      return { url: `/icons/${m.altIcon ? m.altIcon : m.icon}.png`, label: m.label }
    },
    routeSummary (ss) {
      return (ss?.external_reference?.target_active_stop?.route_stops || [])
        .map((rs) => { return `${rs.route.agency.agency_id}:${rs.route.route_short_name || rs.route.route_long_name}` })
        .join(', ')
    }
  }
}
</script>

<style>
.tl-path-icon {
  width:24px;
}
.tl-path-icon img {
  height: 20px;
}
.stop-label {
  max-width:200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  justify-content: left;
}
</style>
