<template>
  <div class="tl-route-icon">
    <span class="tl-route-icon-icon">
      <o-icon :icon="routeTypeIcon" />
    </span>
    <span v-if="routeShortName" class="tl-route-icon-short-name">{{ routeShortName }}</span>
    <span v-if="nameIcon" class="tl-route-name-icon">
      <o-icon :icon="nameIcon" />
    </span>
    <span v-if="routeLongName && routeShortName != routeLongName" class="tl-route-icon-long-name">
      {{ routeLongName }}
    </span>
  </div>
</template>

<script>
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
      switch (this.routeType) {
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