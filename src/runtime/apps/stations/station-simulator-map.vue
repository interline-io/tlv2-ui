<template>
  <div ref="mapContainer" class="simulator-mini-map" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Map as MapLibreMap, Marker, LngLatBounds } from 'maplibre-gl'
import type { LngLatLike } from 'maplibre-gl'
import { useBasemapLayers } from '../../composables/useBasemapLayers'
import { computeArc, terminalBearing } from './station-simulator-helpers'

interface Props {
  doorCoords: [number, number]
  otherCoords: [number, number]
  type: 'entry' | 'exit'
}

const props = defineProps<Props>()

const mapContainer = ref<HTMLElement>()
const map = ref<MapLibreMap | null>(null)
const markers: Marker[] = []

const color = props.type === 'entry' ? '#1e88e5' : '#2e7d32'

onMounted(() => {
  if (!mapContainer.value) { return }

  const { basemapLayers } = useBasemapLayers()
  const carto = basemapLayers.value.carto

  // For entry: arc goes door → platform (direction of travel)
  // For exit:  arc goes platform → door (direction of travel)
  const arcStart: [number, number] = props.type === 'entry' ? props.doorCoords : props.otherCoords
  const arcEnd: [number, number] = props.type === 'entry' ? props.otherCoords : props.doorCoords
  const arcPts = computeArc(arcStart, arcEnd)
  const bearing = terminalBearing(arcPts)

  const mapInst = new MapLibreMap({
    container: mapContainer.value,
    interactive: false,
    attributionControl: false,
    style: {
      version: 8,
      sources: {
        carto: carto.source as any,
        arc: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: arcPts },
            properties: {}
          }
        }
      },
      layers: [
        { id: 'carto', source: 'carto', ...carto.layer } as any,
        {
          id: 'arc-line',
          type: 'line',
          source: 'arc',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': color,
            'line-width': 2.5,
            'line-dasharray': [3, 2]
          }
        }
      ]
    }
  })

  mapInst.on('load', () => {
    const bounds = new LngLatBounds(props.doorCoords, props.doorCoords)
    bounds.extend(props.otherCoords)
    mapInst.fitBounds(bounds, { padding: 50, maxZoom: 19, animate: false })

    // Arrowhead at the arc destination end
    const arrowEl = document.createElement('div')
    arrowEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><polygon points="9,1 16,14 9,10 2,14" fill="${color}" stroke="white" stroke-width="1" transform="rotate(${bearing.toFixed(1)},9,9)"/></svg>`
    markers.push(
      new Marker({ element: arrowEl, anchor: 'center' })
        .setLngLat(arcEnd as LngLatLike)
        .addTo(mapInst as any)
    )

    // Label marker at the door/exit location
    const doorEl = document.createElement('div')
    doorEl.style.cssText = `background:white;border:2px solid ${color};border-radius:3px;padding:2px 5px;font-size:9px;font-weight:700;color:${color};box-shadow:0 1px 3px rgba(0,0,0,.25);white-space:nowrap;`
    doorEl.textContent = props.type === 'entry' ? 'ENTER' : 'EXIT'
    markers.push(
      new Marker({ element: doorEl, anchor: 'bottom' })
        .setLngLat(props.doorCoords as LngLatLike)
        .addTo(mapInst as any)
    )
  })

  map.value = mapInst as any
})

onBeforeUnmount(() => {
  for (const m of markers) { m.remove() }
  map.value?.remove()
  map.value = null
})
</script>

<style scoped>
.simulator-mini-map {
  width: 100%;
  height: 130px;
  border-radius: 6px;
  margin: 0.4rem 0 0.6rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>
