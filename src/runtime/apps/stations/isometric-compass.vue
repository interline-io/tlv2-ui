<template>
  <div class="isometric-compass">
    <!-- Reactive 3D cube + compass ring -->
    <svg
      ref="cubeEl"
      width="100"
      height="140"
      style="cursor: grab; display: block;"
    >
      <title>Drag to orbit (rotate + tilt) · Drag ring to spin heading · Click face to snap</title>
      <g :transform="`translate(50, 48)`">
        <!-- Draw visible faces sorted back-to-front -->
        <polygon
          v-for="face in visibleFaces"
          :key="face.label"
          :points="face.points"
          :fill="face.fill"
          stroke="#444"
          stroke-width="1"
          style="cursor: pointer;"
          @click="snapFace(face.label)"
        />
        <!-- Face labels -->
        <text
          v-for="face in visibleFaces"
          :key="`lbl-${face.label}`"
          :x="face.centX"
          :y="face.centY"
          text-anchor="middle"
          dominant-baseline="middle"
          :font-size="face.label === 'Top' ? 9 : 8"
          :font-weight="face.label === 'Top' ? 'bold' : 'normal'"
          fill="#222"
          style="pointer-events: none;"
        >{{ face.label }}</text>
      </g>

      <!-- Fixed ring border -->
      <circle cx="50" cy="115" r="22" fill="rgba(255,255,255,0.6)" stroke="#bbb" stroke-width="1.2" />

      <!-- Rotating labels + ticks group: rotates by -azimuth around ring center -->
      <g :transform="`rotate(${-azimuth}, 50, 115)`" style="pointer-events: none;">
        <!-- Cardinal tick marks (longer, 4px) at N/S/E/W -->
        <line x1="50" y1="93" x2="50" y2="97" stroke="#888" stroke-width="1.5" />
        <line x1="50" y1="133" x2="50" y2="137" stroke="#888" stroke-width="1.5" />
        <line x1="28" y1="115" x2="32" y2="115" stroke="#888" stroke-width="1.5" />
        <line x1="68" y1="115" x2="72" y2="115" stroke="#888" stroke-width="1.5" />

        <!-- Diagonal tick marks (shorter, 3px) at 45° intervals -->
        <line x1="65.6" y1="99.4" x2="63.4" y2="101.6" stroke="#bbb" stroke-width="1" />
        <line x1="34.4" y1="99.4" x2="36.6" y2="101.6" stroke="#bbb" stroke-width="1" />
        <line x1="65.6" y1="130.6" x2="63.4" y2="128.4" stroke="#bbb" stroke-width="1" />
        <line x1="34.4" y1="130.6" x2="36.6" y2="128.4" stroke="#bbb" stroke-width="1" />

        <!-- Cardinal labels -->
        <text
          x="50"
          y="92"
          text-anchor="middle"
          dominant-baseline="auto"
          font-size="8"
          font-weight="700"
          fill="#c0392b"
        >N</text>
        <text
          x="50"
          y="140"
          text-anchor="middle"
          dominant-baseline="hanging"
          font-size="7"
          fill="#666"
        >S</text>
        <text
          x="73"
          y="115"
          text-anchor="start"
          dominant-baseline="middle"
          font-size="7"
          fill="#666"
        >E</text>
        <text
          x="27"
          y="115"
          text-anchor="end"
          dominant-baseline="middle"
          font-size="7"
          fill="#666"
        >W</text>
      </g>

      <!-- Fixed viewer-position indicator: small inward-pointing triangle at 6 o'clock -->
      <polygon points="50,136 47,131 53,131" fill="#555" style="pointer-events: none;" />

      <!-- Transparent ring drag target (on top of rotating content) -->
      <g>
        <title>Drag to rotate compass heading</title>
        <circle
          ref="ringEl"
          cx="50"
          cy="115"
          r="22"
          fill="transparent"
          stroke="none"
          style="cursor: grab;"
        />
      </g>
    </svg>

    <!-- Controls row: elevation buttons only -->
    <div class="compass-controls">
      <t-tooltip text="+15° elevation" position="left">
        <button class="button is-small is-outlined" @click="adjustElevation(15)">
          ▲
        </button>
      </t-tooltip>
      <t-tooltip text="-15° elevation" position="left">
        <button class="button is-small is-outlined" @click="adjustElevation(-15)">
          ▼
        </button>
      </t-tooltip>
    </div>
    <div class="compass-hint">
      <kbd>N</kbd><kbd>S</kbd><kbd>E</kbd><kbd>W</kbd><kbd>T</kbd> snap
      &middot; <kbd>←</kbd><kbd>→</kbd> rotate
      &middot; <kbd>↑</kbd><kbd>↓</kbd> tilt
      &middot; <kbd>+</kbd><kbd>−</kbd> zoom
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { drag as d3Drag } from 'd3-drag'
import { select } from 'd3-selection'

const props = defineProps<{
  azimuth: number
  elevation: number
}>()

const emit = defineEmits<{
  'update:azimuth': [value: number]
  'update:elevation': [value: number]
}>()

const cubeEl = ref<SVGElement | null>(null)
const ringEl = ref<SVGCircleElement | null>(null)

// Cube vertices: (x=east, y=north, z=up), unit cube centered at origin
const cubeVerts: [number, number, number][] = [
  [-0.5, -0.5, -0.5], // 0 SW bottom
  [0.5, -0.5, -0.5], // 1 SE bottom
  [0.5, 0.5, -0.5], // 2 NE bottom
  [-0.5, 0.5, -0.5], // 3 NW bottom
  [-0.5, -0.5, 0.5], // 4 SW top
  [0.5, -0.5, 0.5], // 5 SE top
  [0.5, 0.5, 0.5], // 6 NE top
  [-0.5, 0.5, 0.5], // 7 NW top
]

const faceDefs = [
  { idx: [4, 5, 6, 7], nx: 0, ny: 0, nz: 1, label: 'Top', lightness: 75 },
  { idx: [0, 1, 5, 4], nx: 0, ny: -1, nz: 0, label: 'S', lightness: 58 },
  { idx: [3, 7, 6, 2], nx: 0, ny: 1, nz: 0, label: 'N', lightness: 58 },
  { idx: [1, 2, 6, 5], nx: 1, ny: 0, nz: 0, label: 'E', lightness: 65 },
  { idx: [0, 4, 7, 3], nx: -1, ny: 0, nz: 0, label: 'W', lightness: 65 },
]

const scale = 38 // pixels per cube unit

const projectedVerts = computed(() => {
  const azRad = props.azimuth * Math.PI / 180
  const elRad = props.elevation * Math.PI / 180
  return cubeVerts.map(([x, y, z]) => {
    const rx = x * Math.cos(azRad) - y * Math.sin(azRad)
    const ry = x * Math.sin(azRad) + y * Math.cos(azRad)
    const mx = rx
    const my = ry * Math.cos(elRad) + z * Math.sin(elRad)
    return { svgX: mx * scale, svgY: -my * scale } // centered on (0,0); translate in template
  })
})

interface FaceResult {
  label: string
  points: string
  centX: number
  centY: number
  depth: number
  fill: string
}

const visibleFaces = computed((): FaceResult[] => {
  const azRad = props.azimuth * Math.PI / 180
  const elRad = props.elevation * Math.PI / 180
  const verts = projectedVerts.value

  return faceDefs
    .map((face) => {
      // Rotate normal by azimuth, then check screen-space z (positive = facing viewer)
      const _rnx = face.nx * Math.cos(azRad) - face.ny * Math.sin(azRad)
      const rny = face.nx * Math.sin(azRad) + face.ny * Math.cos(azRad)
      const screenZ = rny * Math.sin(elRad) + face.nz * Math.cos(elRad)
      if (screenZ < 0.01) return null

      const fv = face.idx.map(i => verts[i]!)
      const points = fv.map(v => `${v.svgX.toFixed(1)},${v.svgY.toFixed(1)}`).join(' ')
      const centX = fv.reduce((s, v) => s + v.svgX, 0) / fv.length
      const centY = fv.reduce((s, v) => s + v.svgY, 0) / fv.length
      // Tint top face slightly lighter
      const fill = `hsl(210, 40%, ${face.lightness}%)`
      return { label: face.label, points, centX, centY, depth: screenZ, fill }
    })
    .filter((f): f is FaceResult => f !== null)
    .sort((a, b) => a.depth - b.depth) // painter's: lowest depth (furthest) first
})

function snapFace (label: string) {
  switch (label) {
    case 'Top': emit('update:elevation', 90); break
    case 'N': emit('update:azimuth', 0); emit('update:elevation', 30); break
    case 'S': emit('update:azimuth', 180); emit('update:elevation', 30); break
    case 'E': emit('update:azimuth', 90); emit('update:elevation', 30); break
    case 'W': emit('update:azimuth', 270); emit('update:elevation', 30); break
  }
}

// Elevation is clamped to [MIN_ELEVATION, 90]. The lower bound of 15° keeps floor slabs
// clearly visible and prevents near-side-on views; negative elevation would flip the station.
const MIN_ELEVATION = 15

function clampElevation (v: number): number {
  return Math.max(MIN_ELEVATION, Math.min(90, v))
}

function adjustElevation (delta: number) {
  emit('update:elevation', clampElevation(props.elevation + delta))
}

let dragCleanup: (() => void) | null = null
let ringDragCleanup: (() => void) | null = null

onMounted(() => {
  if (cubeEl.value) {
    let startAz = 0
    let startEl = 0

    const dragBehavior = d3Drag<SVGElement, unknown>()
      .on('start', () => {
        startAz = props.azimuth
        startEl = props.elevation
      })
      .on('drag', (event) => {
        const dx = event.x - event.subject.x
        const dy = event.y - event.subject.y
        const newAz = ((startAz + dx * 0.7) % 360 + 360) % 360
        const newEl = clampElevation(startEl - dy * 0.5)
        emit('update:azimuth', newAz)
        emit('update:elevation', newEl)
      })

    const sel = select(cubeEl.value as unknown as Element)
    sel.call(dragBehavior as any)
    dragCleanup = () => { sel.on('.drag', null) }
  }

  if (ringEl.value) {
    let startAzRing = 0

    const ringDrag = d3Drag<SVGCircleElement, unknown>()
      .on('start', () => { startAzRing = props.azimuth })
      .on('drag', (event: any) => {
        const newAz = ((startAzRing + (event.x - event.subject.x) * 0.7) % 360 + 360) % 360
        emit('update:azimuth', newAz)
      })

    const ringSel = select(ringEl.value as unknown as Element)
    ringSel.call(ringDrag as any)
    ringDragCleanup = () => { ringSel.on('.drag', null) }
  }
})

onBeforeUnmount(() => {
  dragCleanup?.()
  ringDragCleanup?.()
})
</script>

<style scoped>
.isometric-compass {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 4px 6px 6px;
  user-select: none;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
}

.compass-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  width: 100%;
  justify-content: center;
}

.compass-hint {
  font-size: 9px;
  color: #888;
  text-align: center;
  margin-top: 4px;
  line-height: 1.6;
  white-space: nowrap;
}

.compass-hint kbd {
  display: inline-block;
  padding: 0 0.25em;
  font-size: 0.9em;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.07);
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 2px;
  line-height: 1.4;
}
</style>
