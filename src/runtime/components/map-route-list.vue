<template>
  <div>
    <div>
      <div v-if="Object.keys(agencyFeatures).length > 0">
        <tl-route-select :agency-features="agencyFeatures" :collapse="true" :link="true" />
      </div>
      <div v-else>
        <slot name="default" />
      </div>
    </div>
    <div v-if="isComponentModalActive">
      <o-modal
        :active="isComponentModalActive"
        has-modal-card
        @close="close"
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

<script setup lang="ts">
// Types for route and agency features
interface Route {
  id: number
  onestop_id: string
  feed_onestop_id: string
  feed_version_sha1: string
  route_id: string
  route_type: number
  route_short_name?: string | null
  route_long_name?: string | null
}

interface AgencyFeatures {
  [agencyName: string]: Route[]
}

// Props
withDefaults(defineProps<{
  linkVersion?: boolean
  isComponentModalActive?: boolean
  agencyFeatures?: AgencyFeatures
}>(), {
  linkVersion: false,
  isComponentModalActive: false,
  agencyFeatures: () => ({})
})

// Emits
const emit = defineEmits<{
  close: []
}>()

// Methods
const close = (): void => {
  emit('close')
}
</script>
