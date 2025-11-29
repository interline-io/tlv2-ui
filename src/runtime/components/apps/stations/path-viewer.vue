<template>
  <div>
    <t-msg v-if="!path.length" variant="warning">
      No pathways found for this path.
    </t-msg>

    <table v-else class="table shaded is-narrow tl-path-table" cellpadding="0" cellspacing="0">
      <thead>
        <tr>
          <th>Type</th>
          <th>From</th>
          <th>To</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="edge of path" :key="edge.pathway.id">
          <td>
            <span class="tl-path-icon"><img :src="pathwayIcon(edge.pathway.pathway_mode).url" :title="pathwayIcon(edge.pathway.pathway_mode).label"></span>
          </td>
          <td>
            {{ stopName(edge.pathway.from_stop) }}
            ({{ locationType(edge.pathway.from_stop.location_type) }})
          </td>
          <td>
            {{ stopName(edge.pathway.to_stop) }}
            ({{ locationType(edge.pathway.to_stop.location_type) }})
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { PathwayModeIcons, LocationTypes } from './basemaps'

export default {
  props: {
    path: {
      type: Array, default () { return [] }
    }
  },
  data () {
    return {
      LocationTypes
    }
  },
  methods: {
    stopName (node) {
      if (node.stop_name === 'Node' && node.location_type === 3) {
        return ''
      }
      return node.stop_name
    },
    locationType (lt) {
    //   if (lt === 3) {
    //     return ''
    //   }
      return LocationTypes.get(lt)
    },
    pathwayIcon (mode) {
      const m = PathwayModeIcons[mode]
      if (!m) {
        return { url: '', label: '' }
      }
      return { url: `/icons/${m.altIcon ? m.altIcon : m.icon}.png`, label: m.label }
    }
  }
}
</script>

<style scoped>
.tl-path-table {
  width:100%;margin:0px;padding:0px;
}
.tl-path-icon {
  width:24px
}
.tl-path-icon img {
  height:20px;
}
</style>
