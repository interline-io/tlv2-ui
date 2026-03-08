<template>
  <div class="station-isometric-viewer" style="position: relative;">
    <!-- Empty state -->
    <div v-if="stopsWithGeometry.length === 0" class="notification is-light" style="margin: 2rem;">
      No stops with geometry to display.
    </div>

    <template v-else>
      <!-- Export buttons -->
      <div style="position: absolute; top: 8px; left: 8px; z-index: 10; display: flex; gap: 6px;">
        <t-button size="small" outlined @click="downloadSvg">
          <i class="mdi mdi-download" /> SVG
        </t-button>
        <t-button size="small" outlined @click="downloadPng">
          <i class="mdi mdi-image" /> PNG
        </t-button>
      </div>

      <!-- Bottom-left legend -->
      <div class="iso-legend" style="position: absolute; bottom: 8px; left: 8px; z-index: 10;">
        <div class="iso-legend-header" @click="legendExpanded = !legendExpanded">
          <span>Legend</span>
          <i :class="legendExpanded ? 'mdi mdi-chevron-down' : 'mdi mdi-chevron-right'" style="margin-left: 4px;" />
        </div>
        <div v-if="legendExpanded" class="iso-legend-body">
          <div v-if="legendStopTypes.length" class="iso-legend-section">
            <div class="iso-legend-title">Stops</div>
            <div v-for="entry in legendStopTypes" :key="entry.label" class="iso-legend-row">
              <svg width="14" height="14" style="flex-shrink:0;">
                <circle cx="7" cy="7" r="5" :fill="entry.color" stroke="#fff" stroke-width="1" />
              </svg>
              <span>{{ entry.label }}</span>
            </div>
          </div>
          <div v-if="legendPathwayEntries.length" class="iso-legend-section">
            <div class="iso-legend-title">Pathways</div>
            <div v-for="entry in legendPathwayEntries" :key="entry.label" class="iso-legend-row">
              <svg width="24" height="14" style="flex-shrink:0;">
                <line x1="2" y1="7" x2="22" y2="7" :stroke="entry.color" stroke-width="2.5" :stroke-dasharray="entry.dashed ? '5,3' : 'none'" />
              </svg>
              <span>{{ entry.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top-right controls: compass + floor height -->
      <div style="position: absolute; top: 8px; right: 10px; z-index: 10; display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
        <tl-apps-stations-isometric-compass
          :azimuth="azimuth"
          :elevation="elevation"
          @update:azimuth="azimuth = $event"
          @update:elevation="elevation = $event"
        />
        <div style="display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.92); padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.12);">
          <label style="font-size: 11px; white-space: nowrap; color: #555;">Floor height</label>
          <input v-model.number="floorHeight" type="range" min="3" max="10" step="1" style="width: 72px;">
          <span style="font-size: 11px; min-width: 26px; color: #444;">{{ floorHeight }}m</span>
        </div>
        <div class="iso-layers-panel">
          <div class="iso-layers-group">
            <div class="iso-layers-heading">Base</div>
            <label class="iso-layers-row">
              <input v-model="basemap" type="radio" value="none">
              None
            </label>
            <label class="iso-layers-row">
              <input v-model="basemap" type="radio" value="ground">
              Ground plane
            </label>
            <label v-if="nearmapsApikey" class="iso-layers-row">
              <input v-model="basemap" type="radio" value="aerial">
              Aerial imagery
            </label>
            <div class="iso-layers-divider" />
            <label class="iso-layers-row">
              <input v-model="showCompass" type="checkbox">
              Compass rose
            </label>
          </div>
          <div class="iso-layers-group">
            <div class="iso-layers-heading">Station</div>
            <label class="iso-layers-row">
              <input v-model="showSlabs" type="checkbox">
              Floor slabs
            </label>
            <label class="iso-layers-row">
              <input v-model="showPathways" type="checkbox">
              Pathways
            </label>
            <label class="iso-layers-row" :title="routeIds.length === 0 ? 'No routes found for this station' : ''">
              <input v-model="showRoutes" type="checkbox" :disabled="routeIds.length === 0">
              Routes
              <span v-if="routeIds.length === 0" style="color: #aaa;">(none)</span>
            </label>
            <label class="iso-layers-row">
              <input v-model="showNodeLabels" type="checkbox">
              Node labels
            </label>
          </div>
        </div>
      </div>

      <!-- Main SVG -->
      <svg
        ref="svgEl"
        :width="svgWidth"
        :height="svgHeight"
        style="display: block; background: #f8f9fa; cursor: move;"
        @click.self="onSvgClick"
      >
        <g ref="zoomGroup">
          <!-- Aerial imagery tiles (rendered first, at z=0 ground level) -->
          <image
            v-for="(tile, ti) in aerialTiles"
            :key="`tile-${ti}`"
            :href="tile.url"
            x="0"
            y="0"
            width="256"
            height="256"
            preserveAspectRatio="none"
            :transform="tile.matrix"
            opacity="0.9"
          />

          <!-- Ground plane at level_index=0, drawn first (behind everything) -->
          <!-- Hidden when aerial imagery is shown -->
          <polygon
            v-if="showGroundPlane && !showAerialImagery && groundPlanePoints"
            :points="groundPlanePoints"
            fill="#a8c4a2"
            fill-opacity="0.28"
            stroke="#7aaa72"
            stroke-width="1"
            stroke-opacity="0.5"
          />

          <!-- Compass rose projected onto ground plane -->
          <g v-if="projectedCompass" style="pointer-events: none;">
            <line
              v-for="(l, i) in projectedCompass.otherLines"
              :key="`cl-${i}`"
              :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2"
              stroke="#555" stroke-width="1.2" stroke-linecap="round"
            />
            <line
              :x1="projectedCompass.northLine.x1"
              :y1="projectedCompass.northLine.y1"
              :x2="projectedCompass.northLine.x2"
              :y2="projectedCompass.northLine.y2"
              stroke="#c0392b" stroke-width="2" stroke-linecap="round"
            />
            <polygon :points="projectedCompass.northArrow" fill="#c0392b" />
            <circle
              :cx="projectedCompass.center.x"
              :cy="projectedCompass.center.y"
              r="2.5" fill="white" stroke="#555" stroke-width="1"
            />
            <text
              v-for="label in projectedCompass.labels"
              :key="`clabel-${label.text}`"
              :x="label.x"
              :y="label.y"
              :fill="label.isNorth ? '#c0392b' : '#444'"
              font-size="10"
              font-weight="600"
              text-anchor="middle"
              dominant-baseline="middle"
              style="user-select: none;"
            >{{ label.text }}</text>
          </g>

          <!-- Route lines at z=0 (above ground plane, below level geometry) -->
          <path
            v-for="(rl, ri) in projectedRouteLines"
            :key="`rl-${ri}`"
            :d="rl.d"
            :stroke="rl.color"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
            opacity="0.7"
          />

          <!-- Render levels bottom to top (painter's algorithm) -->
          <g v-for="lvl in projectedLevels" :key="lvl.levelId">
            <template v-if="showSlabs">
              <!-- Side wall quads -->
              <polygon
                v-for="(wall, wi) in lvl.wallPolygons"
                :key="`wall-${wi}`"
                :points="wall.points"
                :fill="wall.fill"
                :fill-opacity="0.85"
                stroke="none"
              />
              <!-- Top face polygons (evenodd for holes) -->
              <path
                v-for="(face, fi) in lvl.topFacePolygons"
                :key="`face-${fi}`"
                :d="face.d"
                :fill="face.fill"
                fill-rule="evenodd"
                :fill-opacity="0.75"
                stroke="#555"
                stroke-width="0.5"
              />
            </template>
          </g>

          <template v-if="showPathways">
            <!-- Same-level pathways -->
            <line
              v-for="pw in sameLevelPathways"
              :key="`pw-${pw.pw.id}`"
              :x1="pw.x1"
              :y1="pw.y1"
              :x2="pw.x2"
              :y2="pw.y2"
              :stroke="pw.stroke"
              :stroke-width="pathwayStrokeWidth"
              :class="isSelectedPathway(pw.pw.id) ? 'pw-selected' : ''"
              style="cursor: pointer;"
              @click.stop="onPathwayClick(pw.pw.id)"
            />

            <!-- Cross-level pathways (dashed) -->
            <line
              v-for="pw in crossLevelPathways"
              :key="`cpw-${pw.pw.id}`"
              :x1="pw.x1"
              :y1="pw.y1"
              :x2="pw.x2"
              :y2="pw.y2"
              :stroke="pw.stroke"
              :stroke-width="pathwayStrokeWidth"
              :stroke-dasharray="`${5 / zoomScale},${3 / zoomScale}`"
              :class="isSelectedPathway(pw.pw.id) ? 'pw-selected' : ''"
              style="cursor: pointer;"
              @click.stop="onPathwayClick(pw.pw.id)"
            />
          </template>

          <!-- Stop circles -->
          <g v-for="lvl in projectedLevels" :key="`stops-${lvl.levelId}`">
            <circle
              v-for="stop in lvl.stops"
              :key="`stop-${stop.stop.id}`"
              :cx="stop.sx"
              :cy="stop.sy"
              :r="stopRadius"
              :fill="isSelectedStop(stop.stop.id) ? '#f28e2b' : stop.fill"
              stroke="#fff"
              :stroke-width="stopStrokeWidth"
              style="cursor: pointer;"
              @click.stop="onStopClick(stop.stop.id)"
              @mouseenter="hoveredStop = stop.stop"
              @mouseleave="hoveredStop = null"
            />
          </g>

          <!-- Permanent node labels (optional layer) -->
          <template v-if="showNodeLabels">
            <g v-for="lvl in projectedLevels" :key="`labels-${lvl.levelId}`">
              <text
                v-for="stop in lvl.stops"
                :key="`label-${stop.stop.id}`"
                :x="stop.sx + labelOffset"
                :y="stop.sy + labelFontSize * 0.35"
                :font-size="labelFontSize"
                fill="#333"
                style="pointer-events: none; user-select: none;"
              >{{ stop.stop.stop_name || stop.stop.stop_id }}</text>
            </g>
          </template>

          <!-- Hover label -->
          <g v-if="hoveredStop && hoveredStopPos">
            <rect
              :x="hoveredStopPos.sx + labelOffset"
              :y="hoveredStopPos.sy - labelFontSize * 1.3"
              :width="hoveredLabelWidth"
              :height="labelFontSize * 1.7"
              :rx="3 / zoomScale"
              fill="rgba(255,255,255,0.9)"
              stroke="#ccc"
              :stroke-width="0.5 / zoomScale"
            />
            <text
              :x="hoveredStopPos.sx + labelOffset + 4 / zoomScale"
              :y="hoveredStopPos.sy - labelFontSize * 0.25"
              :font-size="labelFontSize"
              fill="#333"
              style="pointer-events: none;"
            >{{ hoveredStopLabel }}</text>
          </g>
        </g>
      </svg>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { useRuntimeConfig } from '#imports'
import gql from 'graphql-tag'
import { zoom as d3Zoom } from 'd3-zoom'
import { select } from 'd3-selection'
import type { Station, Stop, Level, Pathway } from './station'
import { projectPoint, projectRing, projectLocalPoint, computeCentroid, levelZ } from './isometric-projection'
import type { ProjectionConfig, ProjectedPoint } from './isometric-projection'

const props = defineProps<{
  station: Station
  selectedStop?: number
  selectedPathway?: number
  clientId?: string
}>()

const emit = defineEmits<{
  'update:selection': [ids: string[]]
}>()

// --- Reactive state ---
const azimuth = ref(225)
const elevation = ref(35) // true isometric ≈ arcsin(1/√3) ≈ 35.26°
const floorHeight = ref(5) // typical transit floor-to-floor: 4.5–5m
const hoveredStop = ref<Stop | null>(null)
const selectedElements = ref<string[]>([])
const zoomScale = ref(1)
const legendExpanded = ref(true)

// --- Layer visibility ---
type Basemap = 'none' | 'ground' | 'aerial'
const basemap = ref<Basemap>('ground')
const showGroundPlane = computed(() => basemap.value === 'ground')
const showAerialImagery = computed(() => basemap.value === 'aerial')
const showCompass = ref(true)
const showRoutes = ref(true)
const showSlabs = ref(true)
const showPathways = ref(true)
const showNodeLabels = ref(false)

// --- Nearmap API key ---
const runtimeConfig = useRuntimeConfig()
const nearmapsApikey = computed(() => (runtimeConfig.public.tlv2 as any)?.nearmapsApikey || '')

// --- Route geometry query ---
interface RouteGeomEntry {
  combined_geometry: { type: string, coordinates: number[][] | number[][][] } | null
}
interface RouteWithGeom {
  id: number
  route_id?: string
  route_short_name?: string
  route_color?: string
  route_type?: number
  geometries: RouteGeomEntry[]
}

const ROUTE_GEOMETRY_QUERY = gql`
  query($route_ids: [Int!]!) {
    routes(ids: $route_ids) {
      id
      route_id
      route_short_name
      route_color
      route_type
      geometries {
        combined_geometry
      }
    }
  }
`

const routeIds = computed((): number[] => {
  const ids = new Set<number>()
  for (const stop of props.station.stops) {
    for (const rs of stop.route_stops) {
      if (rs.route?.id != null) ids.add(rs.route.id)
    }
  }
  return [...ids]
})

const { result: routeQueryResult } = useQuery<{ routes: RouteWithGeom[] }>(
  ROUTE_GEOMETRY_QUERY,
  () => ({ route_ids: routeIds.value }),
  () => ({
    enabled: showRoutes.value && routeIds.value.length > 0,
    clientId: props.clientId,
    fetchPolicy: 'cache-first' as const,
  })
)

// Map each route ID to the z-height derived from the platform stops (location_type=0) it serves.
// Per GTFS spec, platforms (type 0) are the stops where vehicles board/alight and are the
// direct connection between route geometry and the station pathway network. Boarding areas
// (type 4) are sub-locations on a platform; we use them as a fallback if no type-0 stops
// are found for the route. In both cases we pick the most common level_index.
const routeLevelZMap = computed((): Map<number, number> => {
  // Two passes: first collect type-0 counts, then type-4 as fallback
  const byType = new Map<number, Map<number, Map<number, number>>>() // routeId → typeKey → levelIndex → count
  for (const stop of props.station.stops) {
    const lt = stop.location_type ?? 0
    if (lt !== 0 && lt !== 4) continue
    const li = stop.level?.level_index ?? 0
    for (const rs of stop.route_stops) {
      if (rs.route?.id == null) continue
      const rid = rs.route.id
      if (!byType.has(rid)) byType.set(rid, new Map())
      const typeMap = byType.get(rid)!
      if (!typeMap.has(lt)) typeMap.set(lt, new Map())
      const counts = typeMap.get(lt)!
      counts.set(li, (counts.get(li) ?? 0) + 1)
    }
  }
  const result = new Map<number, number>()
  for (const [rid, typeMap] of byType) {
    // Prefer type-0 (platform) stops; fall back to type-4 (boarding area)
    const counts = typeMap.get(0) ?? typeMap.get(4) ?? new Map<number, number>()
    let bestLi = 0
    let bestCount = 0
    for (const [li, count] of counts) {
      if (count > bestCount) { bestCount = count; bestLi = li }
    }
    result.set(rid, levelZ(bestLi, floorHeight.value))
  }
  return result
})

const CLIP_BUFFER_METERS = 300  // added beyond the furthest stop/level vertex
const CLIP_MIN_METERS = 400     // floor so tiny stations still have context

// Adaptive clip radius: bounding circle of all stop + level geometry, plus buffer.
// Used consistently for ground plane, aerial imagery, and route lines.
const stationClipRadius = computed((): number => {
  const originLon = centroid.value.lon
  const originLat = centroid.value.lat
  const cosLat = Math.cos(originLat * Math.PI / 180)
  let maxDist = 0
  function checkLonLat (lon: number, lat: number) {
    const lx = (lon - originLon) * 111320 * cosLat
    const ly = (lat - originLat) * 111320
    const d = Math.sqrt(lx * lx + ly * ly)
    if (d > maxDist) maxDist = d
  }
  for (const stop of stopsWithGeometry.value) {
    checkLonLat(stop.geometry!.coordinates[0] as number, stop.geometry!.coordinates[1] as number)
  }
  for (const lvl of sortedLevels.value) {
    if (!lvl.geometry) continue
    for (const polygon of lvl.geometry.coordinates) {
      for (const ring of polygon) {
        for (const pos of ring) {
          checkLonLat(pos[0] as number, pos[1] as number)
        }
      }
    }
  }
  return Math.max(maxDist + CLIP_BUFFER_METERS, CLIP_MIN_METERS)
})

// --- Aerial imagery / tile math ---

// Convert lon/lat to XYZ tile coordinates (standard Web Mercator, Y origin at top)
function lonLatToTileXY (lon: number, lat: number, z: number): { x: number, y: number } {
  const n = 2 ** z
  const x = Math.floor((lon + 180) / 360 * n)
  const latRad = lat * Math.PI / 180
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
  return { x: Math.max(0, Math.min(n - 1, x)), y: Math.max(0, Math.min(n - 1, y)) }
}

// Convert tile (x, y) at zoom z to the lon/lat of its top-left corner
function tileTopLeftLonLat (tx: number, ty: number, z: number): { lon: number, lat: number } {
  const n = 2 ** z
  const lon = tx / n * 360 - 180
  const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * ty / n))) * 180 / Math.PI
  return { lon, lat }
}

// Geographic bounding box (lon/lat) derived from stationClipRadius around the centroid.
// A square clip radius converts directly to degree offsets — no geometry iteration needed.
const stationGeoBbox = computed((): { minLon: number, maxLon: number, minLat: number, maxLat: number } | null => {
  if (stopsWithGeometry.value.length === 0) return null
  const r = stationClipRadius.value
  const originLon = centroid.value.lon
  const originLat = centroid.value.lat
  const cosLat = Math.cos(originLat * Math.PI / 180)
  const dLon = r / (111320 * cosLat)
  const dLat = r / 111320
  return {
    minLon: originLon - dLon,
    maxLon: originLon + dLon,
    minLat: originLat - dLat,
    maxLat: originLat + dLat,
  }
})

interface AerialTile {
  url: string
  matrix: string // SVG matrix(a,b,c,d,e,f)
}

const aerialTiles = computed((): AerialTile[] => {
  if (!showAerialImagery.value || !nearmapsApikey.value) return []
  const bbox = stationGeoBbox.value
  if (!bbox) return []
  const cfg = projConfig.value
  const W = 256 // tile pixel size
  const z = 19  // always use max zoom for highest resolution

  const tl = lonLatToTileXY(bbox.minLon, bbox.maxLat, z)
  const br = lonLatToTileXY(bbox.maxLon, bbox.minLat, z)

  const tiles: AerialTile[] = []
  for (let tx = tl.x; tx <= br.x; tx++) {
    for (let ty = tl.y; ty <= br.y; ty++) {
      // Geographic corners of this tile
      const corner00 = tileTopLeftLonLat(tx, ty, z)       // top-left
      const corner10 = tileTopLeftLonLat(tx + 1, ty, z)   // top-right
      const corner01 = tileTopLeftLonLat(tx, ty + 1, z)   // bottom-left

      // Project tile corners onto the SVG at z=0 (ground plane level)
      const p00 = projectPoint(corner00.lon, corner00.lat, 0, cfg)
      const p10 = projectPoint(corner10.lon, corner10.lat, 0, cfg)
      const p01 = projectPoint(corner01.lon, corner01.lat, 0, cfg)

      // Affine matrix mapping tile pixel (px, py) → SVG (a·px + c·py + e, b·px + d·py + f)
      // Derived from 3 corner correspondences: TL(0,0), TR(W,0), BL(0,W)
      const e = sx(p00.mx)
      const f = sy(p00.my)
      const a = (sx(p10.mx) - e) / W
      const b = (sy(p10.my) - f) / W
      const c = (sx(p01.mx) - e) / W
      const d = (sy(p01.my) - f) / W

      const url = `https://api.nearmap.com/tiles/v3/Vert/${z}/${tx}/${ty}.jpg?apikey=${nearmapsApikey.value}`
      tiles.push({ url, matrix: `matrix(${a},${b},${c},${d},${e},${f})` })
    }
  }
  return tiles
})

const projectedRouteLines = computed((): { d: string, color: string }[] => {
  if (!showRoutes.value || !routeQueryResult.value) return []
  const cfg = projConfig.value
  const cosLat = Math.cos(cfg.originLat * Math.PI / 180)
  const lines: { d: string, color: string }[] = []

  for (const route of routeQueryResult.value.routes) {
    const color = route.route_color ? `#${route.route_color}` : '#999'
    const geom = route.geometries[0]?.combined_geometry
    if (!geom) continue
    const routeZ = routeLevelZMap.value.get(route.id) ?? 0

    const rings: number[][][] =
      geom.type === 'LineString'
        ? [geom.coordinates as number[][]]
        : geom.type === 'MultiLineString'
          ? (geom.coordinates as number[][][])
          : []

    for (const ring of rings) {
      let d = ''
      let penDown = false
      for (const coord of ring) {
        const lon = coord[0] as number
        const lat = coord[1] as number
        const lx = (lon - cfg.originLon) * 111320 * cosLat
        const ly = (lat - cfg.originLat) * 111320
        if (Math.sqrt(lx * lx + ly * ly) > stationClipRadius.value) {
          penDown = false
          continue
        }
        const p = projectPoint(lon, lat, routeZ, cfg)
        if (!penDown) {
          d += `M ${sx(p.mx).toFixed(1)} ${sy(p.my).toFixed(1)}`
          penDown = true
        } else {
          d += ` L ${sx(p.mx).toFixed(1)} ${sy(p.my).toFixed(1)}`
        }
      }
      if (d) lines.push({ d, color })
    }
  }
  return lines
})

// Sync incoming props to selection state
watch(() => props.selectedStop, (id) => {
  if (id != null) selectStop(id)
}, { immediate: true })

watch(() => props.selectedPathway, (id) => {
  if (id != null) selectPathway(id)
}, { immediate: true })

// --- DOM refs ---
const svgEl = ref<SVGSVGElement | null>(null)
const zoomGroup = ref<SVGGElement | null>(null)
const svgWidth = 900
const svgHeight = 700
const padding = 60

// --- Derived data ---
const stopsWithGeometry = computed(() => props.station.stops.filter(s => s.geometry))

// Center of rotation = centroid of level_index=0 (ground level) stops.
// Falls back to all stops if none are at ground level.
const centroid = computed(() => {
  const groundStops = props.station.stops.filter(s => s.level?.level_index === 0)
  return computeCentroid(groundStops.length > 0 ? groundStops : props.station.stops)
})

const projConfig = computed((): ProjectionConfig => ({
  originLon: centroid.value.lon,
  originLat: centroid.value.lat,
  azimuth: azimuth.value,
  elevation: elevation.value,
  floorHeight: floorHeight.value
}))

// Sort levels by level_index ascending (bottom first). Unassigned (null index) gets index = -0.125
const sortedLevels = computed((): Level[] => {
  return [...props.station.levels].sort((a, b) => {
    const ai = a.level_index ?? -0.125
    const bi = b.level_index ?? -0.125
    return ai - bi
  })
})

// Compute physical station extent using azimuth=0, elevation=0 (flat horizontal view).
// elevation=0 correctly captures both east and north spread (elevation=90 collapses the y-axis).
// azimuth=0 is arbitrary since we take max(xSpread, ySpread).
// Does NOT depend on current azimuth/elevation so scale stays stable while rotating.
const physicalExtentMeters = computed((): number => {
  const cfg: ProjectionConfig = {
    originLon: centroid.value.lon,
    originLat: centroid.value.lat,
    azimuth: 0,
    elevation: 0,
    floorHeight: floorHeight.value
  }
  const pts: ProjectedPoint[] = []
  for (const stop of stopsWithGeometry.value) {
    pts.push(projectPoint(
      stop.geometry!.coordinates[0] as number,
      stop.geometry!.coordinates[1] as number,
      0, cfg
    ))
  }
  for (const lvl of sortedLevels.value) {
    if (!lvl.geometry) continue
    for (const polygon of lvl.geometry.coordinates) {
      for (const ring of polygon) {
        for (const pos of ring) {
          pts.push(projectPoint(pos[0] as number, pos[1] as number, 0, cfg))
        }
      }
    }
  }
  if (pts.length < 2) return 200
  return Math.max(
    Math.max(...pts.map(p => p.mx)) - Math.min(...pts.map(p => p.mx)),
    Math.max(...pts.map(p => p.my)) - Math.min(...pts.map(p => p.my))
  )
})

// Fixed pixels-per-meter: station centroid maps to SVG center, scale stable across rotation.
// The 0.45 factor leaves room for z-extent and diagonal worst-case.
const pixelsPerMeter = computed((): number => {
  const avail = Math.min(svgWidth, svgHeight) - padding * 2
  return (avail * 0.45) / Math.max(physicalExtentMeters.value, 1)
})

function sx (mx: number): number { return svgWidth / 2 + mx * pixelsPerMeter.value }
function sy (my: number): number { return svgHeight / 2 - my * pixelsPerMeter.value }
function pt (p: ProjectedPoint): string { return `${sx(p.mx)},${sy(p.my)}` }

// Ground plane: a square in local meter space centered on the station centroid,
// sized to stationClipRadius. Projected to a parallelogram in SVG space.
const groundPlanePoints = computed((): string | null => {
  if (stopsWithGeometry.value.length === 0) return null
  const r = stationClipRadius.value
  const cfg = projConfig.value
  const corners = [
    projectLocalPoint(-r, -r, 0, cfg),
    projectLocalPoint(r, -r, 0, cfg),
    projectLocalPoint(r, r, 0, cfg),
    projectLocalPoint(-r, r, 0, cfg),
  ]
  return corners.map(p => `${sx(p.mx)},${sy(p.my)}`).join(' ')
})

// Compass rose projected onto the ground plane at z=0.
// Positioned in the SW corner of the clip area so it's typically in open space.
interface CompassRose {
  center: { x: number, y: number }
  northLine: { x1: number, y1: number, x2: number, y2: number }
  northArrow: string
  otherLines: { x1: number, y1: number, x2: number, y2: number }[]
  labels: { text: string, x: number, y: number, isNorth: boolean }[]
}

const projectedCompass = computed((): CompassRose | null => {
  if (!showCompass.value || stopsWithGeometry.value.length === 0) return null
  const cfg = projConfig.value
  const r = stationClipRadius.value

  // SW corner inset — typically the "near" corner at the default azimuth=225
  const cx = -r * 0.72
  const cy = -r * 0.72
  const arm = r * 0.14        // arm length in meters
  const arrowW = arm * 0.20   // arrowhead half-width
  const arrowBase = arm * 0.68 // fraction along arm where arrowhead base sits
  const labelDist = arm * 1.35 // label distance from center

  function proj (lx: number, ly: number) {
    const p = projectLocalPoint(lx, ly, 0, cfg)
    return { x: sx(p.mx), y: sy(p.my) }
  }

  const center = proj(cx, cy)
  const northTip = proj(cx, cy + arm)
  const southTip = proj(cx, cy - arm)
  const eastTip = proj(cx + arm, cy)
  const westTip = proj(cx - arm, cy)
  const northArrowBase = proj(cx, cy + arrowBase)
  const northArrowLeft = proj(cx - arrowW, cy + arrowBase)
  const northArrowRight = proj(cx + arrowW, cy + arrowBase)

  // Label positions: slightly beyond each arm tip
  const northLabel = proj(cx, cy + labelDist)
  const southLabel = proj(cx, cy - labelDist)
  const eastLabel = proj(cx + labelDist, cy)
  const westLabel = proj(cx - labelDist, cy)

  return {
    center,
    northLine: { x1: center.x, y1: center.y, x2: northTip.x, y2: northTip.y },
    northArrow: `${northTip.x},${northTip.y} ${northArrowLeft.x},${northArrowLeft.y} ${northArrowRight.x},${northArrowRight.y}`,
    otherLines: [
      { x1: center.x, y1: center.y, x2: southTip.x, y2: southTip.y },
      { x1: center.x, y1: center.y, x2: eastTip.x, y2: eastTip.y },
      { x1: center.x, y1: center.y, x2: westTip.x, y2: westTip.y },
    ],
    labels: [
      { text: 'N', x: northLabel.x, y: northLabel.y, isNorth: true },
      { text: 'S', x: southLabel.x, y: southLabel.y, isNorth: false },
      { text: 'E', x: eastLabel.x, y: eastLabel.y, isNorth: false },
      { text: 'W', x: westLabel.x, y: westLabel.y, isNorth: false },
    ],
  }
})

// Level HSL color
function levelColor (sortedIdx: number, part: 'top' | 'wall'): string {
  const hue = (200 + sortedIdx * 40) % 360
  if (part === 'top') return `hsl(${hue}, 55%, 65%)`
  return `hsl(${hue}, 55%, 40%)`
}

// Stop color by location_type
function stopColor (locationType: number | null | undefined): string {
  switch (locationType) {
    case 0: return '#4e79a7'
    case 1: return '#f28e2b'
    case 2: return '#59a14f'
    case 3: return '#9c755f'
    case 4: return '#e15759'
    default: return '#bab0ac'
  }
}

// Pathway color by pathway_mode
function pathwayColor (mode: number | undefined): string {
  switch (mode) {
    case 1: return '#aaa'
    case 2: return '#e15759'
    case 3: return '#76b7b2'
    case 4: return '#f28e2b'
    case 5: return '#59a14f'
    case 6: return '#b07aa1'
    case 7: return '#ff9da7'
    default: return '#aaa'
  }
}

interface LevelProjection {
  levelId: string
  wallPolygons: { points: string, fill: string }[]
  topFacePolygons: { d: string, fill: string }[]
  stops: { stop: Stop, sx: number, sy: number, fill: string }[]
}

const projectedLevels = computed((): LevelProjection[] => {
  const cfg = projConfig.value
  return sortedLevels.value.map((lvl, sortedIdx) => {
    // z = walking surface (floor of this level). Slab rises from z up to zTop (ceiling).
    // Stops sit at z so they appear on the floor, not the roof.
    const z = levelZ(lvl.level_index, floorHeight.value)
    const zTop = z + floorHeight.value
    const topFill = levelColor(sortedIdx, 'top')
    const wallFill = levelColor(sortedIdx, 'wall')

    const wallPolygons: { points: string, fill: string }[] = []
    const topFacePolygons: { d: string, fill: string }[] = []

    if (lvl.geometry) {
      for (const polygon of lvl.geometry.coordinates) {
        // Build top face path (exterior ring + holes with evenodd)
        let pathD = ''
        for (const ring of polygon) {
          const topPts = projectRing(ring, zTop, cfg)
          pathD += 'M ' + topPts.map(p => `${sx(p.mx)} ${sy(p.my)}`).join(' L ') + ' Z '
        }
        topFacePolygons.push({ d: pathD.trim(), fill: topFill })

        // Build wall quads from exterior ring edges
        const extRing = polygon[0]
        if (!extRing) continue
        for (let i = 0; i < extRing.length - 1; i++) {
          const posA = extRing[i]
          const posB = extRing[i + 1]
          if (!posA || !posB) continue
          const aTop = projectPoint(posA[0] as number, posA[1] as number, zTop, cfg)
          const bTop = projectPoint(posB[0] as number, posB[1] as number, zTop, cfg)
          const aBot = projectPoint(posA[0] as number, posA[1] as number, z, cfg)
          const bBot = projectPoint(posB[0] as number, posB[1] as number, z, cfg)
          wallPolygons.push({
            points: `${pt(aTop)} ${pt(bTop)} ${pt(bBot)} ${pt(aBot)}`,
            fill: wallFill
          })
        }
      }
    }

    // Stops for this level
    const lvlStops: { stop: Stop, sx: number, sy: number, fill: string }[] = []
    for (const stop of props.station.stops) {
      const stopLvlId = stop.level?.id ?? null
      const thisLvlId = lvl.id ?? null
      if (stopLvlId !== thisLvlId) continue
      if (!stop.geometry) continue
      const projected = projectPoint(stop.geometry.coordinates[0] as number, stop.geometry.coordinates[1] as number, z, cfg)
      lvlStops.push({
        stop,
        sx: sx(projected.mx),
        sy: sy(projected.my),
        fill: stopColor(stop.location_type)
      })
    }

    return {
      levelId: `l-${lvl.id ?? 'unassigned'}`,
      wallPolygons,
      topFacePolygons,
      stops: lvlStops
    }
  })
})

// All projected pathways, split by cross-level vs same-level
interface ProjectedPathway {
  pw: Pathway
  x1: number
  y1: number
  x2: number
  y2: number
  stroke: string
  crossLevel: boolean
}

const projectedPathways = computed((): ProjectedPathway[] => {
  const cfg = projConfig.value
  return props.station.pathways.map((pw): ProjectedPathway | null => {
    const from = pw.from_stop
    const to = pw.to_stop
    if (!from.geometry || !to.geometry) return null
    const fromZ = levelZ(from.level?.level_index, floorHeight.value)
    const toZ = levelZ(to.level?.level_index, floorHeight.value)
    const fromPt = projectPoint(from.geometry.coordinates[0] as number, from.geometry.coordinates[1] as number, fromZ, cfg)
    const toPt = projectPoint(to.geometry.coordinates[0] as number, to.geometry.coordinates[1] as number, toZ, cfg)
    const cross = from.level?.id !== to.level?.id
    return {
      pw,
      x1: sx(fromPt.mx),
      y1: sy(fromPt.my),
      x2: sx(toPt.mx),
      y2: sy(toPt.my),
      stroke: pathwayColor(pw.pathway_mode),
      crossLevel: cross
    }
  }).filter((x): x is ProjectedPathway => x !== null)
})

const sameLevelPathways = computed(() => projectedPathways.value.filter(p => !p.crossLevel))
const crossLevelPathways = computed(() => projectedPathways.value.filter(p => p.crossLevel))

// Legend: only include types/modes actually present in the station
const STOP_TYPE_LABELS: Record<number, string> = {
  0: 'Platform',
  1: 'Station',
  2: 'Entrance / Exit',
  3: 'Generic Node',
  4: 'Boarding Area',
}

const PATHWAY_MODE_LABELS: Record<number, string> = {
  1: 'Walkway',
  2: 'Stairs',
  3: 'Sidewalk',
  4: 'Escalator',
  5: 'Elevator',
  6: 'Fare Gate',
  7: 'Exit Gate',
}

const legendStopTypes = computed(() => {
  const seen = new Set<number>()
  for (const stop of stopsWithGeometry.value) {
    seen.add(stop.location_type ?? -1)
  }
  return [...seen].sort().map(t => ({
    label: STOP_TYPE_LABELS[t] ?? 'Other',
    color: stopColor(t === -1 ? null : t),
  }))
})

const legendPathwayEntries = computed(() => {
  const seenModes = new Set<number>()
  let hasCross = false
  for (const pw of projectedPathways.value) {
    seenModes.add(pw.pw.pathway_mode ?? 1)
    if (pw.crossLevel) hasCross = true
  }
  const entries: { label: string, color: string, dashed: boolean }[] = []
  for (const mode of [...seenModes].sort()) {
    entries.push({
      label: PATHWAY_MODE_LABELS[mode] ?? `Mode ${mode}`,
      color: pathwayColor(mode),
      dashed: false,
    })
  }
  if (hasCross) {
    entries.push({ label: 'Cross-level', color: '#888', dashed: true })
  }
  return entries
})

// Hover label
const hoveredStopPos = computed(() => {
  if (!hoveredStop.value) return null
  for (const lvl of projectedLevels.value) {
    const found = lvl.stops.find(s => s.stop.id === hoveredStop.value!.id)
    if (found) return found
  }
  return null
})

const hoveredStopLabel = computed(() => {
  if (!hoveredStop.value) return ''
  return hoveredStop.value.stop_name || hoveredStop.value.stop_id || String(hoveredStop.value.id)
})

// Inverse-zoom sizes: keep visual pixel size constant as user zooms in/out
const stopRadius = computed(() => 6 / zoomScale.value)
const stopStrokeWidth = computed(() => 1.5 / zoomScale.value)
const pathwayStrokeWidth = computed(() => 2 / zoomScale.value)
const labelFontSize = computed(() => 11 / zoomScale.value)
const labelOffset = computed(() => 8 / zoomScale.value)
const hoveredLabelWidth = computed(() => Math.max(60, hoveredStopLabel.value.length * 7 + 8) / zoomScale.value)

// --- Selection ---
function isSelectedStop (id: number | undefined): boolean {
  return selectedElements.value.includes(`s-${id}`)
}

function isSelectedPathway (id: number | undefined): boolean {
  return selectedElements.value.includes(`p-${id}`)
}

function onStopClick (id: number | undefined) {
  if (id == null) return
  const eid = `s-${id}`
  selectedElements.value = [eid]
  emit('update:selection', selectedElements.value)
}

function onPathwayClick (id: number | undefined) {
  if (id == null) return
  const eid = `p-${id}`
  selectedElements.value = [eid]
  emit('update:selection', selectedElements.value)
}

function onSvgClick () {
  clearSelection()
}

function selectStop (id: number) {
  selectedElements.value = [`s-${id}`]
  emit('update:selection', selectedElements.value)
}

function selectPathway (id: number) {
  selectedElements.value = [`p-${id}`]
  emit('update:selection', selectedElements.value)
}

function clearSelection () {
  selectedElements.value = []
  emit('update:selection', selectedElements.value)
}

defineExpose({ selectStop, selectPathway, clearSelection })

// --- Export ---
const stationName = computed(() => props.station.stop?.stop_name || 'station')

function downloadSvg () {
  if (!svgEl.value) return
  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svgEl.value as unknown as Node)
  const blob = new Blob([svgStr], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${stationName.value}-isometric.svg`
  a.click()
  URL.revokeObjectURL(url)
}

function downloadPng () {
  if (!svgEl.value) return
  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svgEl.value as unknown as Node)
  const canvas = document.createElement('canvas')
  canvas.width = svgEl.value.clientWidth * 2
  canvas.height = svgEl.value.clientHeight * 2
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)
  const img = new Image()
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${stationName.value}-isometric.png`
      a.click()
    })
    URL.revokeObjectURL(url)
  }
  img.src = url
}

// --- d3-zoom ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let zoomBehavior: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let zoomSel: any = null
let zoomCleanup: (() => void) | null = null

onMounted(() => {
  nextTick(() => {
    if (!svgEl.value || !zoomGroup.value) return
    zoomBehavior = d3Zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event: any) => {
        select(zoomGroup.value! as unknown as Element).attr('transform', event.transform)
        zoomScale.value = event.transform.k
      })
    zoomSel = select(svgEl.value as unknown as Element)
    zoomSel.call(zoomBehavior)
    zoomCleanup = () => { zoomSel.on('.zoom', null) }
    window.addEventListener('keydown', handleKeyDown)
  })
})

onBeforeUnmount(() => {
  zoomCleanup?.()
  window.removeEventListener('keydown', handleKeyDown)
})

const ROTATE_STEP = 15  // degrees per arrow key press
const ZOOM_FACTOR = 1.25
const MIN_ELEVATION = 15

function handleKeyDown (e: KeyboardEvent) {
  // Ignore when focus is inside a form field
  const tag = ((e.target as HTMLElement)?.tagName || '').toLowerCase()
  if (['input', 'textarea', 'select'].includes(tag) || (e.target as HTMLElement)?.isContentEditable) return

  // No modifier keys for all shortcuts
  if (e.metaKey || e.ctrlKey || e.altKey) return

  switch (e.key) {
    case 'Escape':
      clearSelection()
      break
    // = or + → zoom in  (same physical key; = doesn't require Shift)
    case '=':
    case '+':
      e.preventDefault()
      if (zoomBehavior && zoomSel) zoomBehavior.scaleBy(zoomSel, ZOOM_FACTOR)
      break
    // - → zoom out
    case '-':
      e.preventDefault()
      if (zoomBehavior && zoomSel) zoomBehavior.scaleBy(zoomSel, 1 / ZOOM_FACTOR)
      break
    case 'ArrowLeft':
      e.preventDefault()
      azimuth.value = ((azimuth.value - ROTATE_STEP) % 360 + 360) % 360
      break
    case 'ArrowRight':
      e.preventDefault()
      azimuth.value = ((azimuth.value + ROTATE_STEP) % 360 + 360) % 360
      break
    case 'ArrowUp':
      e.preventDefault()
      elevation.value = Math.min(90, elevation.value + ROTATE_STEP)
      break
    case 'ArrowDown':
      e.preventDefault()
      elevation.value = Math.max(MIN_ELEVATION, elevation.value - ROTATE_STEP)
      break
  }
}
</script>

<style scoped>
.station-isometric-viewer {
  width: 100%;
  position: relative;
}

.pw-selected {
  filter: drop-shadow(0 0 3px orange);
}

.iso-legend {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  font-size: 11px;
  color: #333;
  min-width: 120px;
  max-width: 180px;
  user-select: none;
}

.iso-legend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  font-weight: 600;
  cursor: pointer;
}

.iso-legend-header:hover {
  background: rgba(0,0,0,0.04);
  border-radius: 6px;
}

.iso-legend-body {
  padding: 0 8px 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.iso-legend-section {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.iso-legend-title {
  font-weight: 600;
  color: #666;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 1px;
}

.iso-legend-row {
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.3;
}

.iso-layers-panel {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  font-size: 11px;
  color: #444;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.iso-layers-group {
  padding: 5px 8px 6px;
}

.iso-layers-group + .iso-layers-group {
  border-top: 1px solid #e0e0e0;
}

.iso-layers-heading {
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}

.iso-layers-row {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  line-height: 1.6;
  white-space: nowrap;
}

.iso-layers-divider {
  border-top: 1px solid #e8e8e8;
  margin: 3px 0;
}
</style>
