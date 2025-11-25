<template>
  <div>
    <div v-for="(group, i) in groupedSortedStationLevels" :key="i" class="columns">
      <div v-for="level in group" :key="level.level_id" class="column">
        <div :class="level.level_index != null ? 'box m-1 p-1 columns' : 'm-1 p-1 columns'">
          <div class="column is-2">
            <span v-if="level.level_index != null" class="tag is-light is-large">{{ level.level_index }}</span>
          </div>
          <div class="column">
            <h5 class="title is-5">
              {{ level.level_name }}
            </h5>
            <div v-if="level.id" class="content">
              <strong>ID:</strong> {{ level.level_id }}
            </div>
            <div class="field is-grouped is-grouped-multiline">
              <div class="control">
                <div class="tags has-addons">
                  <span class="tag" :class="level.stops.filter((s: any) => { return s.location_type === 2 }).length > 0 ? 'is-warning' : ''">{{ level.stops.filter((s: any) => { return s.location_type === 2 }).length }}</span>
                  <div class="tag">
                    entrances
                  </div>
                </div>
              </div>
              <div class="control">
                <div class="tags has-addons">
                  <span class="tag" :class="level.stops.filter((s: any) => { return s.location_type === 0 }).length > 0 ? 'is-warning' : ''">{{ level.stops.filter((s: any) => { return s.location_type === 0 }).length }}</span>
                  <div class="tag">
                    platforms
                  </div>
                </div>
              </div>
              <div class="control">
                <div class="tags has-addons">
                  <span class="tag" :class="level.stops.filter((s: any) => { return s.location_type === 3 }).length > 0 ? 'is-warning' : ''">{{ level.stops.filter((s: any) => { return s.location_type === 3 }).length }}</span>
                  <div class="tag">
                    nodes
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="column is-3 has-text-right">
            <tl-link
              v-if="level.id"
              route-key="apps-stations-feedKey-feedVersionKey-stations-stationKey-levels-levelKey-edit"
              :to="{ params: { feedKey: station.stop.feed_version.feed.onestop_id, feedVersionKey: station.stop.feed_version.id, stationKey: station.stop.stop_id, levelKey: level.level_id } }"
              class="button is-primary is-outlined"
            >
              Edit Level
            </tl-link>
          </div>
        </div>
      </div>
    </div>
    <!-- TODO: -->
    <!-- <o-button variant="primary" outlined>
      Reorder Levels
    </o-button> -->
    <slot name="bottom-button-bar" />
  </div>
</template>

<script lang="ts">
export default {
  props: {
    station: { type: Object, default () { return {} } }
  },
  computed: {
    groupedSortedStationLevels () {
      const m: Map<number, any[]> = new Map()
      for (const lvl of this.station.levels) {
        const idx = lvl.level_index
        if (idx == null) {
          continue
        }
        const a = m.get(idx) || []
        a.push(lvl)
        m.set(idx, a)
      }
      const keys = [...m.keys()].sort((a, b) => b - a)
      const ret = keys.map(s => (m.get(s) || []))
      ret.push(this.station.levels.filter((s: any) => (s.level_index == null)))
      return ret
    }
  }
}
</script>
