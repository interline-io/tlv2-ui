<template>
  <div>
    <div class="field">
      <label class="label">Name</label>
      <div class="control">
        <input v-model="station.stop.stop_name" class="input" type="text">
      </div>
      <p class="help">
        The full name of the station complex. Capitalize and use spaces.
      </p>
    </div>

    <div class="field">
      <label class="label">ID</label>
      <div class="control">
        <input v-model="station.stop.stop_id" class="input" type="text">
      </div>
      <p class="help">
        A unique identifier for the station complex. No spaces allowed.
      </p>
    </div>

    <div class="field">
      <o-field label="Location">
        <span v-if="!station.stop.geometry" class="is-pulled-right">Draw a point by clicking on map</span>
        <span v-else class="is-pulled-right">Click the point twice to enable dragging</span>
      </o-field>
      <o-field>
        <tl-editor-basemap-control v-model="basemap" />
      </o-field>

      <tl-editor-level-map
        :basemap="basemap"
        :center="center"
        :search="true"
        width="100%"
        height="500px"
        :zoom="18"
        :draw-tools="true"
        :editable-features="editFeatures"
        :draw-default-mode="editFeatures.length > 0 ? 'simple_select' : 'draw_point'"
        @changed="setGeometry"
      />
    </div>
    <div class="block">
      <div class="level mt-5">
        <div class="level-left">
          <div class="level-item">
            <o-button
              class="button is-outlined"
              @click="$emit('cancel')"
            >
              Cancel
            </o-button>
          </div>
        </div>
        <div class="level-right">
          <template v-if="station.id">
            <div class="level-item">
              <o-button
                class="button is-primary"
                :disabled="!valid"
                @click="$emit('update', station)"
              >
                Save
              </o-button>
            </div>
          </template>
          <template v-else>
            <div class="level-item">
              <o-button
                class="button is-primary"
                :disabled="!valid"
                @click="$emit('create', station)"
              >
                Create Station
              </o-button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <hr>
    <!-- Danger Zone -->
    <div v-if="station.id" class="mt-6">
      <tl-msg-box variant="danger" title="Danger Zone">
        <p v-if="hasAssociatedContent" class="mb-4">
          This station cannot be deleted because it has associated levels or stops. If you want to delete, first remove all levels and stop associations from this station.
        </p>
        <p v-else class="mb-4">
          No associated levels or stops, so this station can be deleted if desired.
        </p>
        <o-button
          class="button is-danger"
          :disabled="hasAssociatedContent"
          @click="showDeleteModal = true"
        >
          Delete Station
        </o-button>
      </tl-msg-box>
    </div>

    <!-- Delete Confirmation Modal -->
    <tl-modal
      v-if="station.id"
      v-model="showDeleteModal"
      title="Delete Station"
    >
      <p class="mb-4">
        Are you sure you want to delete the station <strong>{{ station.stop.stop_name }}</strong>? This action cannot be undone.
      </p>
      <div class="buttons is-pulled-right">
        <o-button @click="showDeleteModal = false">
          Cancel
        </o-button>
        <o-button
          variant="danger"
          @click="confirmDelete"
        >
          Delete Station
        </o-button>
      </div>
    </tl-modal>
  </div>
</template>

<script>
import { Station } from './station'

export default {
  props: {
    center: {
      type: Array,
      default () { return [-122.431297, 37.773972] }
    },
    value: {
      type: Object,
      default () { return {} }
    }
  },
  emits: ['update', 'delete', 'create', 'cancel'],
  data () {
    return {
      station: new Station(this.value.stop),
      basemap: 'carto',
      showDeleteModal: false
    }
  },
  computed: {
    editFeatures () {
      if (!this.station.stop.geometry) { return [] }
      return [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: this.station.stop.geometry.coordinates },
          properties: {}
        }
      ]
    },
    valid () {
      return this.station.stop.geometry
        && this.station.stop.stop_name
        && this.station.stop.stop_name.length > 0
        && this.station.stop.stop_id
        && this.station.stop.stop_id.length > 0
    },
    hasAssociatedContent () {
      const hasLevels = (this.station?.levels?.length || 0) > 0
      const hasStops = (this.station?.stops?.length || 0) > 0
      return hasLevels || hasStops
    }
  },
  watch: {
    'station.stop.stop_name' (value) {
      if (value.length > 0 && this.station.id == null) {
        this.station.stop.stop_id = value.toLowerCase().replace(/\s/g, '-')
      }
    }
  },
  methods: {
    setGeometry (e) {
      if (e.features.length !== 1) {
        this.station.stop.geometry = null
        return
      }
      this.station.stop.geometry = e.features[0].geometry
    },
    confirmDelete () {
      this.showDeleteModal = false
      this.$emit('delete', this.station)
    }
  }
}
</script>
