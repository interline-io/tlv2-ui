export default {
  props: {
    limit: { type: Number, default: 100 }
  },
  data() {
    return {
      hasMore: false,
      prevAfter: null,
      search: null,
      entities: [],
      error: null
    }
  },
  computed: {
    maxId() {
      return Math.max(...this.entities.map((s) => { return s.id }))
    },
    entityPage() {
      return this.entities
    }
  },
  methods: {
    showAll() {
      const newLimit = 1000
      this.$apollo.queries.entities.fetchMore({
        variables: {
          after: this.maxId,
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
