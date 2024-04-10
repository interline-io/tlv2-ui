<script>
const OBJECTTYPES = {
  empty_object: 0,
  tenant: 1,
  org: 2,
  feed: 3,
  feed_version: 4,
  user: 5
}

const RELATIONS = {
  empty_relation: 0,
  admin: 1,
  member: 2,
  manager: 3,
  viewer: 4,
  editor: 5,
  parent: 6
}

export default {
  methods: {
    ObjectTypes (v) {
      return OBJECTTYPES[v]
    },
    Relations (v) {
      return RELATIONS[v]
    }
  }
}
</script>
