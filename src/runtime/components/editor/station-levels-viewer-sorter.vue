<template>
  <div>
    <div v-for="(group, i) in groupedSortedStationLevels" :key="i" class="columns">
      <div v-for="level in group" :key="level.level_id" class="column">
        <div class="box m-1 p-1 columns">
          <div class="column is-2">
            <span class="tag is-light is-large">{{ level.level_index }}</span>
          </div>
          <div class="column">
            <h5 class="title is-5">
              {{ level.level_name }}
            </h5>
            <div class="content">
              <strong>ID:</strong> {{ level.level_id }}
            </div>
            <div class="field is-grouped is-grouped-multiline">
              <div class="control">
                <div class="tags has-addons">
                  <span class="tag" :class="level.stops.filter((s)=>{return s.location_type === 2}).length > 0 ? 'is-warning' : ''">{{ level.stops.filter((s)=>{return s.location_type === 2}).length }}</span>
                  <div class="tag">
                    entrances
                  </div>
                </div>
              </div>
              <div class="control">
                <div class="tags has-addons">
                  <span class="tag" :class="level.stops.filter((s)=>{return s.location_type === 0}).length > 0 ? 'is-warning' : ''">{{ level.stops.filter((s)=>{return s.location_type === 0}).length }}</span>
                  <div class="tag">
                    platforms
                  </div>
                </div>
              </div>
              <div class="control">
                <div class="tags has-addons">
                  <span class="tag" :class="level.stops.filter((s)=>{return s.location_type === 3}).length > 0 ? 'is-warning' : ''">{{ level.stops.filter((s)=>{return s.location_type === 3}).length }}</span>
                  <div class="tag">
                    nodes
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="column is-3 has-text-right">
            <nuxt-link
              v-if="level.id"
              :to="{name:'editor-feedKey-feedVersionKey-stations-stationKey-levels-levelKey-edit', params: {feedKey:station.stop.feed_version.feed.onestop_id,feedVersionKey:station.stop.feed_version.file,stationKey:station.stop.stop_id,levelKey:level.level_id}}"
              class="button is-primary is-outlined"
            >
              Edit Level
            </nuxt-link>
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

<script>
import groupBy from 'lodash.groupby'

export default {
  props: {
    station: { type: Object, default () { return {} } }
  },
  computed: {
    groupedSortedStationLevels () {
      const levelsObjByIndex = groupBy(this.station.levels, l => l.level_index)
      const levelIndexes = Object.keys(levelsObjByIndex).map(i => parseInt(i)).sort((a, b) => b - a)
      const levelsArrByIndex = levelIndexes.map(i => levelsObjByIndex[i])
      return levelsArrByIndex
    }
  }
}
</script>
