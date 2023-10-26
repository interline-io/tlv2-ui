<template>
  <div>
    <div>
      <div v-if="Object.keys(agencyFeatures).length > 0">
        <tl-route-select :agency-features="agencyFeatures" :collapse="true" :link="true" />
      </div>
      <div v-else>
        <h6 class="title is-6">
          Select routes
        </h6>
        <div v-if="currentZoom < 8">
          Zoom in to select routes and to see stop points.
        </div>
        <div v-else>
          Use your cursor to highlight routes and see their names here. Click for more details.
        </div>
      </div>
    </div>
    <div v-if="isComponentModalActive">
      <o-modal
        :active="isComponentModalActive"
        has-modal-card
        :on-cancel="close"
      >
        <template #default>
          <div v-if="isComponentModalActive" class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">
                Select Route
              </p>
              <button type="button" class="delete" @click="close" />
            </header>
            <section class="modal-card-body">
              <tl-route-select :agency-features="agencyFeatures" :link="true" :link-version="linkVersion" />
            </section>
          </div>
        </template>
      </o-modal>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    currentZoom: { type: Number, default () { return 0 } },
    linkVersion: { type: Boolean, default: false },
    isComponentModalActive: { type: Boolean, default: false },
    agencyFeatures: { type: Object, default () { return {} } }
  },
  methods: {
    close () {
      this.$emit('close')
    }
  }
}
</script>
