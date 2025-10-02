export default {
  props: {
    limit: { type: Number, default: 100 }
  },
  data () {
    return {
      hasMore: false,
      prevAfter: null,
      search: this.$route.query.search,
      entities: [],
      error: null
    }
  },
  methods: {
    showAll () {
      const newLimit = 1000
      const lastId = this.entities.length > 0 ? this.entities[this.entities.length - 1].id : 0
      this.$apollo.queries.entities.fetchMore({
        variables: {
          after: lastId,
          limit: newLimit
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (fetchMoreResult.entities.length >= newLimit) {
            this.hasMore = true
          } else {
            this.hasMore = false
          }
          return {
            entities: [...previousResult.entities, ...fetchMoreResult.entities]
          }
        }
      })
    }
  }
}
