<template>
  <div class="tl-route-icon">
    <span class="tl-route-icon-icon">
      <o-icon :icon="routeTypeIcon" :title="routeTypeIcon" />
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

<script>
import { getBasicRouteType } from '../lib/route-types'

export default {
  props: {
    nameIcon: {
      type: String,
      default: null
    },
    routeType: {
      type: Number,
      default: null
    },
    routeShortName: {
      type: String,
      default: null
    },
    routeLongName: {
      type: String,
      default: null
    },
    routeLink: {
      type: String,
      default: null
    }
  },
  computed: {
    routeTypeIcon () {
      const rt = getBasicRouteType(this.routeType)
      const code = rt.parentType ? rt.parentType.code : rt.routeType.code
      switch (code) {
        case 0:
          return 'tram'
        case 1:
          return 'subway'
        case 2:
          return 'train'
        case 3:
          return 'bus'
        case 4:
          return 'ferry'
        case 5:
          return 'tram'
        case 6:
          return 'gondola'
        case 7:
          return 'tram'
        case 11:
          return 'tram'
        case 12:
          return 'train'
      }
      return ''
    }
  }
}
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
}</style>
