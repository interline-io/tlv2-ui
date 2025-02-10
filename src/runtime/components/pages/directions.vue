<template>
  <div class="tl-map">
    <tl-map-viewer
      :key="0"
      :enable-scroll-zoom="true"
      :zoom="14"
      :markers="directionMarkers"
      :features="directionFeatures"
      :auto-fit="false"
      map-class="tall"
      :hash="true"
      @map-click="directionMapClick"
    />
    <div class="tl-map-panel tl-map-panel-tabs">
      <o-tabs
        v-model="activeTab"
        class="tl-tabs block"
        position="centered"
        type="boxed"
      >
        <o-tab-item
          id="routes"
          label="Directions"
        >
          <div class="directions-outer">
            <tl-login-gate>
              <tl-directions
                :from-place="fromPlaceCoords"
                :to-place="toPlaceCoords"
                :mode="props.modeParam || 'TRANSIT'"
                :depart-at="departAt"
                @set-places="setPlaces"
                @set-mode="setMode"
                @set-features="directionFeatures = $event"
                @reset="directionReset"
                @set-depart-at="setDepartAt"
              />
              <template #loginText>
                <p>
                  You must be logged in to use this feature.
                </p>
              </template>
            </tl-login-gate>
          </div>
        </o-tab-item>
      </o-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, navigateTo } from '#imports'

const route = useRoute()

const props = defineProps({
  fromPlaceParam: {
    type: String,
    default: ''
  },
  toPlaceParam: {
    type: String,
    default: ''
  },
  modeParam: {
    type: String,
    default: () => 'WALK'
  },
  departAtParam: {
    type: String,
    default: () => new Date().toISOString()
  }
})

const activeTab = ref(1)

const directionFeatures = ref([])

const departAt = computed((): string => {
  const loadTime = (new Date()).toISOString()
  return props.departAtParam?.toString() || loadTime
})

const fromPlaceCoords = computed((): number[] => {
  const coords = splitCoords(props.fromPlaceParam)
  return coords.length === 2 ? coords : []
})

const toPlaceCoords = computed((): number[] => {
  const coords = splitCoords(props.toPlaceParam)
  return coords.length === 2 ? coords : []
})

// TODO: Does not reset map when goes empty
const directionMarkers = computed(() => {
  const ret = []
  if (fromPlaceCoords.value.length === 2) {
    ret.push({
      lng: fromPlaceCoords.value[0],
      lat: fromPlaceCoords.value[1],
      color: 'green',
      label: 'A',
      draggable: true,
      onDragEnd: (c: any) => {
        setPlaces([c.target.getLngLat().lng, c.target.getLngLat().lat], toPlaceCoords.value)
      }
    })
  }
  if (toPlaceCoords.value.length === 2) {
    ret.push({
      lng: toPlaceCoords.value[0],
      lat: toPlaceCoords.value[1],
      color: 'red',
      label: 'B',
      draggable: true,
      onDragEnd: (c: any) => {
        setPlaces(fromPlaceCoords.value, [c.target.getLngLat().lng, c.target.getLngLat().lat])
      }
    })
  }
  return ret
})

function splitCoords(v: any): number[] {
  const vs = (v || '').split(',').map(parseFloat).filter(v => !isNaN(v))
  if (vs.length === 2) {
    return vs
  }
  return []
}

function directionMapClick(e: any) {
  const coords = [e.lngLat.lng, e.lngLat.lat]
  if (fromPlaceCoords.value.length === 0 || toPlaceCoords.value.length === 2) {
    setPlaces(coords, [])
  } else {
    setPlaces(fromPlaceCoords.value, coords)
  }
}

async function setDepartAt(v: string) {
  await navigateTo({
    query: { ...route.query, departAt: v },
    hash: window.location.hash
  })
}

async function setMode(v: string) {
  await navigateTo({
    query: { ...route.query, mode: v },
    hash: window.location.hash
  })
}

async function directionReset() {
  directionFeatures.value = []
  await navigateTo({
    query: { },
    hash: window.location.hash
  })
}

async function setPlaces(fromPlace: number[] | null, toPlace: number[] | null) {
  const pathNoHash = route.path.split('#')[0]
  const fromPlaceStr = (fromPlace || []).map(v => v.toFixed(6)).join(',')
  const toPlaceStr = (toPlace || []).map(v => v.toFixed(6)).join(',')
  await navigateTo({
    path: pathNoHash,
    query: { ...route.query, fromPlace: fromPlaceStr, toPlace: toPlaceStr },
    hash: window.location.hash
  })
}
</script>

<style scoped>
.directions-outer {
  width: 500px;
}
</style>
