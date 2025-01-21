<template>
  <div>
    <div>
      <div v-if="hasFeatures">
        <tl-route-select 
          :agency-features="agencyFeatures" 
          :collapse="true" 
          :link="true"
          :link-version="linkVersion"
          :show-stops="true"
        />
      </div>
      <div v-else>
        <slot name="default" />
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
                Select Route or Stop
              </p>
              <button type="button" class="delete" @click="close" />
            </header>
            <section class="modal-card-body">
              <tl-route-select 
                :agency-features="agencyFeatures" 
                :link="true" 
                :link-version="linkVersion"
                :show-stops="true"
              />
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
    linkVersion: { type: Boolean, default: false },
    isComponentModalActive: { type: Boolean, default: false },
    agencyFeatures: { type: Object, default () { return {} } }
  },
  computed: {
    hasFeatures() {
      return Object.keys(this.agencyFeatures).some(agency => {
        const features = this.agencyFeatures[agency]
        return (features.routes && Object.keys(features.routes).length > 0) ||
               (features.stops && Object.keys(features.stops).length > 0)
      })
    }
  },
  methods: {
    close () {
      this.$emit('close')
    }
  }
}
</script>
