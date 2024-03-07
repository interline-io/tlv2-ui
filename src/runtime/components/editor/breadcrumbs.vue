<template>
  <div>
    <nav class="breadcrumb box" aria-label="breadcrumbs">
      <ul>
        <div class="level-item">
          <li>
            <nuxt-link to="/">
              Home
            </nuxt-link>
          </li>
          <!-- mode -->
          <li v-if="name.startsWith('editor')" :class="name === 'editor' ? 'is-active' : ''">
            <nuxt-link :to="{name:'editor'}">
              Editor
            </nuxt-link>
          </li>
          <li v-if="name.startsWith('analyst') || forceAnalyst" :class="name === 'analyst' ? 'is-active' : ''">
            <nuxt-link :to="{name:'analyst'}">
              Analyst
            </nuxt-link>
          </li>
          <!-- feed -->
          <li v-if="feedKey">
            <span class="tag">Feed</span>
            <a href="#">{{ feedName || feedKey }}</a>
          </li>
          <li v-if="feedVersionKey">
            <span class="tag">Version</span>
            <nuxt-link
              :to="{name:'editor-feedKey-feedVersionKey-stations',params:{feedKey:feedKey,feedVersionKey:feedVersionKey}}"
            >
              {{ feedVersionName || feedVersionKey.substr(0,8) }}
            </nuxt-link>
          </li>
          <!-- editor: fares -->
          <li v-if="showFares">
            <nuxt-link
              :to="{name:'editor-feedKey-feedVersionKey-fares', params: {feedKey:feedKey,feedVersionKey:feedVersionKey}}"
            >
              Fares
            </nuxt-link>
          </li>
          <!-- editor: stations -->
          <li v-if="stationKey">
            <span class="tag">Station</span>
            <nuxt-link
              :to="{name:'editor-feedKey-feedVersionKey-stations-stationKey',params:{feedKey:feedKey,feedVersionKey:feedVersionKey,stationKey:stationKey}}"
            >
              {{ stationName || stationKey }}
            </nuxt-link>
          </li>
          <li v-if="levelId">
            <span class="tag">Level</span>
            <a href="#">
              {{ levelName || levelId }}
            </a>
          </li>
          <slot />
        </div>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  props: {
    forceAnalyst: {
      type: Boolean,
      default: false
    },
    feedKey: {
      type: String,
      default: ''
    },
    feedName: {
      type: String,
      default: ''
    },
    feedVersionKey: {
      type: String,
      default: ''
    },
    feedVersionName: {
      type: String,
      default: ''
    },
    stationKey: {
      type: String,
      default: ''
    },
    showFares: {
      type: Boolean,
      default: false
    },
    stationName: {
      type: String,
      default: ''
    },
    levelId: {
      type: String,
      default: ''
    },
    levelName: {
      type: String,
      default: ''
    }
  },
  computed: {
    name () {
      return this.$route.name
    }
  }
}
</script>

<style scoped>
nav {
  margin: 1em 0;
}
.tag {
  margin-left: 1em;
}
</style>
