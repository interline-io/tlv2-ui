<template>
  <div>
    <table class="table is-fullwidth is-shaded">
      <thead>
        <th>Feed</th>
        <th>Versions</th>
      </thead>
      <tbody>
        <tr v-for="feed of feeds" :key="feed.id">
          <td>
            <nuxt-link :to="{name:'feeds-feedKey', params:{feedKey:feed.onestop_id}}">
              {{ feed.onestop_id }} <span v-if="feed.name">: {{ feed.name }}</span>
            </nuxt-link>
          </td>
          <td>{{ feed.feed_versions.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'

const feedQuery = gql`
  query($ids:[Int!]) {
    feeds(ids:$ids) {
      id
      onestop_id
      name
      feed_versions {
        id
        sha1
        name
      }
    }
  }
  `

export default {
  props: {
    feedIds: { type: Array, default () { return [] } },
    graphqlClient: { type: String, default: 'default' }

  },
  data () {
    return {
      feeds: [],
      error: null,
      fvs: []
    }
  },
  apollo: {
    feeds: {
      client: this.graphqlClient,
      query: feedQuery,
      variables () {
        return { ids: this.feedIds }
      },
      fetchPolicy: 'no-cache',
      error (e) {
        this.error = e
      }
    }
  }
}
</script>
