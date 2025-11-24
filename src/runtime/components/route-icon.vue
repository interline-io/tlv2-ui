<template>
  <div class="tl-route-icon">
    <span class="tl-route-icon-icon">
      <o-icon :icon="routeTypeIcon" />
    </span>
    <span v-if="routeShortName" class="tl-route-icon-short-name">{{ routeShortName }}</span>
    <span v-if="nameIcon" class="tl-route-name-icon">
      <o-icon :icon="nameIcon" />
    </span>
    <span v-if="routeLongName && routeShortName != routeLongName">
      {{ routeLongName }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getBasicRouteType } from '../lib/routetypes'

type RouteIconType = 'tram' | 'subway' | 'train' | 'bus' | 'ferry' | 'gondola' | ''

const props = withDefaults(defineProps<{
  nameIcon?: string | null
  routeType?: number | null
  routeShortName?: string | null
  routeLongName?: string | null
  routeLink?: string | null
}>(), {
  nameIcon: null,
  routeType: null,
  routeShortName: null,
  routeLongName: null,
  routeLink: null
})

// Route type to icon mapping
const ROUTE_TYPE_ICONS: Record<number, RouteIconType> = {
  0: 'tram', // Light rail, streetcar, tram
  1: 'subway', // Subway, metro
  2: 'train', // Rail
  3: 'bus', // Bus
  4: 'ferry', // Ferry
  5: 'tram', // Cable tram
  6: 'gondola', // Aerial lift, suspended cable car
  7: 'tram', // Funicular
  11: 'tram', // Trolleybus
  12: 'train' // Monorail
}

// Computed properties
const routeTypeIcon = computed<RouteIconType>(() => {
  if (props.routeType === null || props.routeType === undefined) {
    return ''
  }

  const rt = getBasicRouteType(props.routeType)
  const code = rt.parentType ? rt.parentType.code : rt.routeType.code

  return ROUTE_TYPE_ICONS[code] || ''
})
</script>

<style scoped>
.tl-route-icon {
    /* white-space: nowrap; */
    overflow: hidden;
    padding:0px;
    margin:0px;
    margin-bottom:10px;
    /* background:red; */
}

.tl-route-icon .tl-route-icon-short-name {
    display:inline-block;
    padding-top:4px;
    padding-bottom:4px;
    padding-left:8px;
    padding-right:8px;
    margin:0px;
    margin-right:4px;
    outline:solid 1px #ccc;
    outline-offset: -1px;
    border-radius: 5px;
    /* white-space: nowrap; */
    /* background:#efefef; */
}

.tl-route-icon .tl-route-icon-long-name {
    display:inline-block;
    margin:0px;
    padding:0px;
    /* white-space: nowrap; */
    /* background:blue; */
}

.tl-route-icon .tl-route-icon-icon {
    display:inline-block;
    width:26px;
    text-align:center;
    position:relative;
    top:3px;
    /* background:green; */
}

.tl-route-icon .route-name-icon {
    display:inline-block;
    position:relative;
    top:3px;
    /* background:green; */
}
</style>
