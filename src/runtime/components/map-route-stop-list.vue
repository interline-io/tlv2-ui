<template>
  <div>
    <div v-if="hasFeatures">
      <tl-route-stop-select 
        :agency-features="agencyFeatures" 
        :collapse="true" 
        :link="true"
        :show-stops="true"
      />
    </div>
    <div v-else>
      <slot />
    </div>

    <o-modal
      v-if="isComponentModalActive"
      :active="true"
      has-modal-card
      @close="$emit('close')"
    >
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Select Route or Stop</p>
        </header>
        <section class="modal-card-body">
          <tl-route-stop-select 
            :agency-features="agencyFeatures" 
            :link="true"
            :show-stops="true"
          />
        </section>
      </div>
    </o-modal>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isComponentModalActive?: boolean
  agencyFeatures: Record<string, {
    routes?: Record<string, {
      id: string | number
      route_type: number
      route_short_name: string
      route_long_name: string
      onestop_id: string
      feed_onestop_id: string
      feed_version_sha1: string
      route_id: string
    }>
    stops?: Record<string, {
      id: string | number
      location_type: number
      stop_name: string
      onestop_id: string
      feed_onestop_id: string
      feed_version_sha1: string
      stop_id: string
    }>
  }>
}

const props = withDefaults(defineProps<Props>(), {
  isComponentModalActive: false
})

defineEmits(['close'])

const hasFeatures = computed(() => {
  return Object.keys(props.agencyFeatures).some(agency => {
    const features = props.agencyFeatures[agency]
    return (features.routes && Object.keys(features.routes).length > 0) ||
           (features.stops && Object.keys(features.stops).length > 0)
  })
})
</script>
