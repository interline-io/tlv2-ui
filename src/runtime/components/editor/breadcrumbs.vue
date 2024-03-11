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
          <li v-if="currentRoute.startsWith('editor')" :class="currentRoute === 'editor' ? 'is-active' : ''">
            <nuxt-link :to="{name:'editor'}">
              Editor
            </nuxt-link>
          </li>
          <!-- feed -->
          <li v-if="feedKey">
            <span class="tag">Feed</span>
            <a href="#">{{ feedName }}</a>
          </li>
          <li v-if="feedVersionKey">
            <span class="tag">Version</span>
            <nuxt-link
              :to="{name:'editor-feedKey-feedVersionKey-stations',params:{feedKey:feedKey,feedVersionKey:feedVersionKey}}"
            >
              {{ feedVersionName }}
            </nuxt-link>
          </li>
          <!-- editor: stations -->
          <li v-if="stationKey">
            <span class="tag">Station</span>
            <nuxt-link
              :to="{name:'editor-feedKey-feedVersionKey-stations-stationKey',params:{feedKey:feedKey,feedVersionKey:feedVersionKey,stationKey:stationKey}}"
            >
              {{ stationName }}
            </nuxt-link>
          </li>
          <li v-if="levelKey">
            <span class="tag">Level</span>
            <a href="#">
              {{ levelName }}
            </a>
          </li>
          <slot />
        </div>
      </ul>
    </nav>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'

const q = gql`
query stationBreadcrumbsQuery ($stop_id: String, $feed_onestop_id: String!, $feed_version_file: String!) {
  feed_versions(where: {file: $feed_version_file, feed_onestop_id: $feed_onestop_id}) {
    stops(limit: 1, where: {stop_id: $stop_id}) {
      id
      stop_id
      stop_name
      feed_version {
        id
        sha1
        file
        feed {
          id
          name
          onestop_id
        }
      }
    }
  }
}`

export default {
  props: {
    feedKey: {
      type: String,
      default: ''
    },
    feedVersionKey: {
      type: String,
      default: ''
    },
    stationKey: {
      type: String,
      default: ''
    },
    levelKey: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      feed_versions: []
    }
  },
  computed: {
    feedVersion() {
      return this.feed_versions[0]
    },
    currentRoute () {
      return this.$route.name
    },
    feedName () {
      return this.feedVersion?.feed?.name || this.feedKey
    },
    stationName() {
      return this.feedVersion?.stops[0]?.stop_name || this.stationKey
    },
    feedVersionName() {
      return (this.feedVersion?.file || this.feedVersionKey || '').substr(0, 8)
    },
    levelName() {
      return this.levelKey
    }
  },
  apollo: {
    feed_versions: {
      query: q,
      variables() {
        return {
          feed_onestop_id: this.feedKey,
          feed_version_file: this.feedVersionKey,
          stop_id: this.stationKey
        }
      }
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
