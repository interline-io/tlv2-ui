<template>
  <div>
    <div class="columns">
      <div class="column is-one-half">
        <o-field label="Stop ID">
          <code v-if="readOnly">{{ stop.stop_id }}</code>
          <o-input v-else v-model="stop.stop_id" />
        </o-field>

        <o-field label="Name">
          <span v-if="readOnly">{{ stop.stop_name }}</span>
          <o-input v-else v-model="stop.stop_name" />
        </o-field>

        <o-field label="Platform Code">
          <span v-if="readOnly">{{ stop.platform_code }}</span>
          <o-input v-else v-model="stop.platform_code" />
        </o-field>

        <o-field label="Location Type">
          <o-select v-model="stop.location_type" :disabled="readOnly">
            <option v-for="[type,label] of LocationTypes.entries()" :key="type" :value="type">
              {{ label }}
            </option>
          </o-select>
        </o-field>

        <o-field>
          <o-switch v-model="stop.wheelchair_boarding" :true-value="1" :false-value="0" :disabled="readOnly">
            Wheelchair boarding
          </o-switch>
        </o-field>

        <o-field label="Level">
          <o-select v-model="stop.level.id" :disabled="readOnly">
            <option v-for="level of station.levels" :key="level.id" :value="level.id">
              {{ level.level_name }}
            </option>
          </o-select>
        </o-field>

        <o-field v-if="(stop.location_type === 4 || stop.location_type === 0 || (stop.parent && stop.parent.id !== station.id))" label="Parent">
          <o-dropdown
            v-model="stop.parent.id"
            aria-role="list"
            :scrollable="true"
            :max-height="200"
          >
            <template #trigger>
              <button class="button" type="button">
                <template v-if="parentstop">
                  {{ parentstop.stop_name }} &nbsp;
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
            <o-dropdown-item :value="null" aria-role="listitem">
              <h3>No parent</h3>
            </o-dropdown-item>
            <o-dropdown-item v-for="ss of platformStops" :key="ss.id" :value="ss.id" aria-role="listitem">
              <h3>{{ ss.stop_name }}</h3>
              <small> Platform: {{ routeSummary(ss) }}</small>
            </o-dropdown-item>
          </o-dropdown>
        </o-field>

        <o-field v-if="pathways_from_stop.length > 0" label="Pathways (From)">
          <ul>
            <li v-for="pw of pathways_from_stop" :key="pw.id">
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
        <o-field v-if="pathways_to_stop.length" label="Pathways (To)">
          <ul>
            <li v-for="pw of pathways_to_stop" :key="pw.id">
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

        <o-field v-if="stop.route_stops?.length" label="Routes (Direct)">
          <ul>
            <li v-for="rt of stop.route_stops || []" :key="rt.route.id">
              {{ rt.route.agency.agency_id }}:{{ rt.route.route_short_name || rt.route.route_long_name }}
            </li>
          </ul>
        </o-field>

        <template v-if="stop.stop_ext">
          <o-field v-if="stop.stop_ext" label="Target">
            <span v-if="!stop.stop_ext.target_active_stop" class="button is-danger">
              Not Found: {{ stop.stop_ext.target_feed_onestop_id }}:{{ stop.stop_ext.target_stop_id }}
            </span>
            <span v-else>
              {{ stop.stop_ext.target_feed_onestop_id }}:{{ stop.stop_ext.target_stop_id }}
            </span>
          </o-field>
          <o-field label="Target Feed">
            <o-input v-model="stop.stop_ext.target_feed_onestop_id" />
          </o-field>
          <o-field label="Target Stop">
            <o-input v-model="stop.stop_ext.target_stop_id" />
          </o-field>
          <o-field v-if="stop.stop_ext?.target_active_stop" label="Routes (Associated)">
            <ul>
              <li v-for="rt of stop.stop_ext?.target_active_stop?.route_stops" :key="rt.route.id">
                {{ rt.route.agency.agency_id }}:{{ rt.route.route_short_name || rt.route.route_long_name }}
              </li>
            </ul>
          </o-field>
          <span v-if="!readOnly" class="button is-danger" @click="$emit('delete-association', stop)">Remove association</span>
        </template>
        <template v-else-if="!readOnly">
          <span class="button is-primary" @click="$emit('create-association', stop)">Add association</span>
        </template>
      </div>
    </div>

    <template v-if="!readOnly">
      <div v-if="stop.id" class="buttons">
        <span class="button is-primary" @click="$emit('update', stop)">Save stop</span>
        <span class="button is-danger" @click="$emit('delete', stop)">Delete stop</span>
      </div>
      <div v-else class="buttons">
        <span class="button is-primary" @click="$emit('create', stop)">Add stop</span>
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
    currentMode: {
      type: String,
      reqiored: false,
      default: 'pathways'
    }
  },
  emits: ['select-pathway', 'delete-association', 'create-association', 'update', 'delete', 'create'],
  data () {
    return {
      pathways_from_stop: this.value.pathways_from_stop || [],
      pathways_to_stop: this.value.pathways_to_stop || [],
      stop: new Stop(this.value).setDefaults(),
      LocationTypes
    }
  },
  computed: {
    platformStops () {
      return this.station.stops.filter((s) => { return s.location_type === 0 })
    },
    parentstop () {
      if (this.stop.parent?.id === this.station.id) {
        return this.station.stop
      }
      for (const s of this.station.stops) {
        if (s.id === this.stop.parent?.id) {
          return s
        }
      }
      return null
    },
    coordinates () {
      return `${this.stop.geometry.coordinates[0].toFixed(5)}, ${this.stop.geometry.coordinates[1].toFixed(5)}`
    }
  },
  methods: {
    pathwayIcon (mode) {
      const m = PathwayModeIcons[mode]
      if (!m) {
        return { url: '', label: '' }
      }
      return { url: `/icons/${m.altIcon ? m.altIcon : m.icon}.png`, label: m.label }
    },
    routeSummary (stop) {
      if (stop.stop_ext && stop.stop_ext.target_active_stop && stop.stop_ext.target_active_stop.route_stops) {
        return stop.stop_ext.target_active_stop.route_stops.map((rs) => { return `${rs.route.agency.agency_id}:${rs.route.route_short_name || rs.route.route_long_name}` }).join(', ')
      }
      return ''
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
</style>
