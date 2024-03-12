<template>
  <div v-if="station">
    <slot name="nav">
      <nav class="breadcrumb box" aria-label="breadcrumbs">
        <ul>
          <li>
            <nuxt-link :to="{name:'editor'}">
              Editor
            </nuxt-link>
          </li>
          <li>
            <span class="tag">Feed</span>
            <a href="#">{{ feedName }}</a>
          </li>
          <li>
            <span class="tag">Version</span>
            <nuxt-link
              :to="{name:'editor-feedKey-feedVersionKey-stations',params:{feedKey,feedVersionKey}}"
            >
              {{ feedVersionName }}
            </nuxt-link>
          </li>
          <li>
            <span class="tag">Station</span>
            <nuxt-link
              :to="{name:'editor-feedKey-feedVersionKey-stations-stationKey',params:{feedKey,feedVersionKey,stationKey}}"
            >
              {{ stationName }}
            </nuxt-link>
          </li>
          <li class="is-active">
            <a href="#">New Level</a>
          </li>
        </ul>
      </nav>
    </slot>

    <slot name="title">
      <tl-title title="Edit Station">
        New Level
      </tl-title>
    </slot>

    <tl-editor-level-editor
      :station="station"
      :center="station.geometry.coordinates"
      @create="createLevelHandler"
    />
  </div>
</template>

<script>
import { navigateTo } from '#app'
import StationMixin from './station-mixin'

export default {
  mixins: [StationMixin],
  head: {
    title: 'Editor: New Level'
  },
  methods: {
    createLevelHandler (level) {
      this.station.createLevel(this.$apollo, level).then(() => {
        navigateTo({
          name: 'editor-feedKey-feedVersionKey-stations-stationKey',
          params: {
            feedKey: this.feedKey,
            feedVersionKey: this.feedVersionKey,
            stationKey: this.stationKey
          }
        })
      }).catch(this.error)
    }
  }
}
</script>
