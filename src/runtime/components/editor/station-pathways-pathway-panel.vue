<template>
  <div>
    <nav class="panel station-editor-panel">
      <p class="panel-heading">
        <span v-if="!editMode">View Pathway</span>
        <span v-else>Edit Pathway</span>
        <span class="panel-heading-buttons">
          <button
            v-if="showUnselect"
            class="button is-small"
            title="Or press ESC key to unselect"
            @click="$emit('unselect')"
          >
            Unselect
          </button>
          <button
            class="button is-small"
            :class="editMode ? 'is-primary' : ''"
            @click="editMode = !editMode"
          >
            <span class="icon is-small">
              <o-icon :icon="editMode ? 'eye' : 'pencil'" />
            </span>
            <span>{{ editMode ? 'View' : 'Edit' }}</span>
          </button>
        </span>
      </p>

      <!-- View Mode (Read-only) -->
      <div v-if="!editMode" class="panel-block is-block">
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
      </div>

      <!-- Edit Mode -->
      <div v-else class="panel-block is-block">
        <tl-editor-pathway-editor
          :station="station"
          :value="pathway"
          @select-stop="$emit('select-stop', $event)"
          @delete="$emit('delete', $event)"
          @update="$emit('update', $event)"
        />
      </div>
    </nav>
  </div>
</template>

<script>
import { PathwayModes } from './basemaps'

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
  data () {
    return {
      editMode: false
    }
  },
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
.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-heading-buttons {
  display: flex;
  gap: 0.5rem;
}

.field.is-horizontal .field-label {
  flex-grow: 0;
  flex-basis: 120px;
  text-align: left;
}

.field.is-horizontal .field-body {
  flex-grow: 1;
}

.menu-list a {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
