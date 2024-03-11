<template>
  <div>
    <h2 class="title is-2">
      Groups
    </h2>

    <p class="content is-medium">
      Your user belongs to the following groups. Each group grants access to one or more associated feeds and their feed versions.
    </p>

    <div v-for="v of groups" :key="v.id">
      <tl-msg-info no-icon :title="v.name" variant="light">
        <admin-group :id="v.id" />
      </tl-msg-info>
    </div>
  </div>
</template>

<script>
import AuthzMixin from '../authz-mixin'

export default {
  mixins: [AuthzMixin],
  data () {
    return {
      groups: [],
      error: null
    }
  },
  mounted () { this.getData() },
  methods: {
    async getData () {
      this.loading = true
      await fetch(`${this.apiBase()}/admin/groups`, {
        headers: { authorization: await this.getAuthToken() }
      }).then((data) => {
        return data.json()
      }).then((data) => {
        this.groups = data.groups
      })
      this.loading = false
    }
  }
}
</script>
