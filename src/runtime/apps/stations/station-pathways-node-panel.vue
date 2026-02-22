<template>
  <tl-apps-stations-station-pathways-editor-panel
    view-heading="View Node"
    edit-heading="Edit Node"
    :show-unselect="showUnselect"
    @unselect="$emit('unselect')"
  >
    <template #view>
      <div class="content">
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Stop ID:</label>
          </div>
          <div class="field-body">
            <code>{{ stop.stop_id }}</code>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Name:</label>
          </div>
          <div class="field-body">
            <span>{{ stop.stop_name }}</span>
          </div>
        </div>
        <div v-if="stop.platform_code" class="field is-horizontal">
          <div class="field-label">
            <label class="label">Platform:</label>
          </div>
          <div class="field-body">
            <span>{{ stop.platform_code }}</span>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Type:</label>
          </div>
          <div class="field-body">
            <span>{{ locationTypeName }}</span>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Level:</label>
          </div>
          <div class="field-body">
            <span>{{ levelName }}</span>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Wheelchair:</label>
          </div>
          <div class="field-body">
            <span>{{ stop.wheelchair_boarding === 1 ? 'Accessible' : 'Not accessible' }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div v-if="pathwaysFromStop.length > 0 || pathwaysToStop.length > 0" class="menu">
        <p class="menu-label">
          Navigate to connected pathways
        </p>
        <ul class="menu-list">
          <li v-for="pw of pathwaysFromStop" :key="pw.id">
            <a
              @click="$emit('select-pathway', pw.id)"
              @mouseenter="$emit('hover-pathway', pw.id)"
              @mouseleave="$emit('hover-pathway', null)"
            >
              <span class="tl-path-icon"><img :src="pathwayIcon(pw.pathway_mode).url" :title="pathwayIcon(pw.pathway_mode).label"></span>
              <span v-if="pw.is_bidirectional === 1">↔</span>
              <span v-else>→</span>
              {{ pw.to_stop.stop_name }}
            </a>
          </li>
          <li v-for="pw of pathwaysToStop" :key="pw.id">
            <a
              @click="$emit('select-pathway', pw.id)"
              @mouseenter="$emit('hover-pathway', pw.id)"
              @mouseleave="$emit('hover-pathway', null)"
            >
              <span class="tl-path-icon"><img :src="pathwayIcon(pw.pathway_mode).url" :title="pathwayIcon(pw.pathway_mode).label"></span>
              <span v-if="pw.is_bidirectional === 1">↔</span>
              <span v-else>←</span>
              {{ pw.from_stop.stop_name }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Mode Switch -->
      <div class="menu">
        <p class="menu-label">
          Switch view
        </p>
        <ul class="menu-list">
          <li>
            <nuxt-link
              :to="{
                name: 'saas-station-editor-feedKey-feedVersionKey-stations-stationKey-diagram',
                params: modeSwitchParams,
                query: modeSwitchQuery,
              }"
            >
              <i class="mdi mdi-chart-timeline mdi-16px" /> &nbsp; View in Station Diagram
            </nuxt-link>
          </li>
        </ul>
      </div>
    </template>

    <template #edit="{ cancel }">
      <tl-apps-stations-stop-editor
        :station="station"
        :value="stop"
        :stop-associations-enabled="stopAssociationsEnabled"
        @delete="$emit('delete', $event)"
        @update="$emit('update', $event)"
        @delete-association="$emit('delete-association', $event)"
        @select-pathway="$emit('select-pathway', $event)"
        @cancel="cancel"
      />
    </template>
  </tl-apps-stations-station-pathways-editor-panel>
</template>

<script>
import { LocationTypes } from './basemaps'
import { PathwayModeIcons } from '../../lib/pathways/pathway-icons'

export default {
  props: {
    station: {
      type: Object,
      required: true
    },
    stop: {
      type: Object,
      required: true
    },
    stopAssociationsEnabled: {
      type: Boolean,
      default: false
    },
    showUnselect: {
      type: Boolean,
      default: false
    },
    feedKey: {
      type: String,
      required: true
    },
    feedVersionKey: {
      type: String,
      required: true
    },
    stationKey: {
      type: String,
      required: true
    }
  },
  emits: ['delete', 'update', 'delete-association', 'select-pathway', 'hover-pathway', 'unselect'],
  computed: {
    modeSwitchParams () {
      return {
        feedKey: this.feedKey,
        feedVersionKey: this.feedVersionKey,
        stationKey: this.stationKey
      }
    },
    modeSwitchQuery () {
      return {
        selectedStop: this.stop.id
      }
    },
    levelName () {
      return this.stop.level?.level_name || 'None'
    },
    locationTypeName () {
      const type = this.stop.location_type
      for (const [key, value] of LocationTypes.entries()) {
        if (key === type) {
          return value
        }
      }
      return 'Unknown'
    },
    pathwaysFromStop () {
      return this.stop.pathways_from_stop || []
    },
    pathwaysToStop () {
      return this.stop.pathways_to_stop || []
    }
  },
  methods: {
    pathwayIcon (mode) {
      const m = PathwayModeIcons[mode]
      if (!m) {
        return { url: '', label: '' }
      }
      return { url: `/icons/${m.altIcon ? m.altIcon : m.icon}.png`, label: m.label }
    }
  }
}
</script>

<style scoped>
.field.is-horizontal .field-label {
  flex-grow: 0;
  flex-basis: 120px;
  text-align: left;
}

.field.is-horizontal .field-body {
  flex-grow: 1;
}

.tl-path-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  margin-right: 0.5rem;
}

.tl-path-icon img {
  width: 100%;
  height: 100%;
}

.menu-list a {
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  color: #3273dc;
  transition: background-color 0.2s, color 0.2s;
}

.menu-list a:hover {
  background-color: #f5f5f5;
  color: #363636;
}
</style>
