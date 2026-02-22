<template>
  <tl-apps-stations-station-pathways-editor-panel
    view-heading="View Pathway"
    edit-heading="Edit Pathway"
    :show-unselect="showUnselect"
    @unselect="$emit('unselect')"
  >
    <template #view>
      <div class="content">
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Pathway ID:</label>
          </div>
          <div class="field-body">
            <code>{{ pathway.pathway_id }}</code>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Mode:</label>
          </div>
          <div class="field-body">
            <span>{{ pathwayModeName }}</span>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label">
            <label class="label">Direction:</label>
          </div>
          <div class="field-body">
            <span>{{ pathway.is_bidirectional === 1 ? 'Bidirectional' : 'One-way' }}</span>
          </div>
        </div>
        <div v-if="pathway.length" class="field is-horizontal">
          <div class="field-label">
            <label class="label">Length:</label>
          </div>
          <div class="field-body">
            <span>{{ pathway.length }}m</span>
          </div>
        </div>
        <div v-if="pathway.traversal_time" class="field is-horizontal">
          <div class="field-label">
            <label class="label">Time:</label>
          </div>
          <div class="field-body">
            <span>{{ pathway.traversal_time }}s</span>
          </div>
        </div>
        <div v-if="pathway.stair_count" class="field is-horizontal">
          <div class="field-label">
            <label class="label">Stairs:</label>
          </div>
          <div class="field-body">
            <span>{{ pathway.stair_count }}</span>
          </div>
        </div>
        <div v-if="pathway.signposted_as" class="field is-horizontal">
          <div class="field-label">
            <label class="label">Signposted as:</label>
          </div>
          <div class="field-body">
            <span>{{ pathway.signposted_as }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="menu">
        <p class="menu-label">
          Navigate to Connected Nodes
        </p>
        <ul class="menu-list">
          <li>
            <a
              @click="$emit('select-stop', pathway.from_stop.id)"
              @mouseenter="$emit('hover-stop', pathway.from_stop.id)"
              @mouseleave="$emit('hover-stop', null)"
            >
              <span v-if="pathway.is_bidirectional === 1">↔</span>
              <span v-else>←</span>
              {{ pathway.from_stop.stop_name || `Node ${pathway.from_stop.stop_id}` }}
              <span class="has-text-grey is-size-7">
                <template v-if="fromStopLevel">
                  <template v-if="fromStopLevel.level_index != null">
                    (Level: {{ fromStopLevel.level_index }})
                  </template>
                  <template v-else-if="fromStopLevel.level_name">
                    (Level: {{ fromStopLevel.level_name }})
                  </template>
                  <template v-else>
                    (Level ID: {{ pathway.from_stop.level.id }})
                  </template>
                </template>
                <template v-else>
                  (Unassigned)
                </template>
              </span>
            </a>
          </li>
          <li>
            <a
              @click="$emit('select-stop', pathway.to_stop.id)"
              @mouseenter="$emit('hover-stop', pathway.to_stop.id)"
              @mouseleave="$emit('hover-stop', null)"
            >
              <span v-if="pathway.is_bidirectional === 1">↔</span>
              <span v-else>→</span>
              {{ pathway.to_stop.stop_name || `Node ${pathway.to_stop.stop_id}` }}
              <span class="has-text-grey is-size-7">
                <template v-if="toStopLevel">
                  <template v-if="toStopLevel.level_index != null">
                    (Level: {{ toStopLevel.level_index }})
                  </template>
                  <template v-else-if="toStopLevel.level_name">
                    (Level: {{ toStopLevel.level_name }})
                  </template>
                  <template v-else>
                    (Level ID: {{ pathway.to_stop.level.id }})
                  </template>
                </template>
                <template v-else>
                  (Unassigned)
                </template>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </template>

    <template #edit="{ cancel }">
      <tl-apps-stations-pathway-editor
        :station="station"
        :value="pathway"
        @select-stop="$emit('select-stop', $event)"
        @delete="$emit('delete', $event)"
        @update="$emit('update', $event)"
        @cancel="cancel"
      />
    </template>
  </tl-apps-stations-station-pathways-editor-panel>
</template>

<script>
import { PathwayModes } from '../../lib/pathways/pathway-icons'

export default {
  props: {
    station: {
      type: Object,
      required: true
    },
    pathway: {
      type: Object,
      required: true
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
  emits: ['select-stop', 'hover-stop', 'delete', 'update', 'unselect'],
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
        selectedPathway: this.pathway.id
      }
    },
    pathwayModeName () {
      for (const [mode, label] of PathwayModes) {
        if (mode === this.pathway.pathway_mode) {
          return label
        }
      }
      return 'Unknown'
    },
    fromStopLevel () {
      if (!this.pathway.from_stop.level?.id) {
        return null
      }
      return this.station.levels.find(l => l.id === this.pathway.from_stop.level.id)
    },
    toStopLevel () {
      if (!this.pathway.to_stop.level?.id) {
        return null
      }
      return this.station.levels.find(l => l.id === this.pathway.to_stop.level.id)
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
