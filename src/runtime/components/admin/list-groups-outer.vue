<template>
  <div>
    <tl-admin-group
      :id="id"
      :editable="false"
      :show-feeds="true"
      :show-members="false"
      :show-actions="false"
      :show-tenant="false"
    />
  </div>
</template>

<script>
import Loadable from '../loadable'

export default {
  mixins: [Loadable],
  props: { id: { type: Number, default: null } },
  data () {
    return {
      group: []
    }
  },
  computed: {
    feedIds () {
      return this.group?.feeds?.map((s) => { return s.id })
    }
  },
  mounted () { this.getData() },
  methods: {
    async getData () {
      this.loading = true
      await fetch(`${this.apiBase}/admin/groups/${this.id}`, {
        headers: { authorization: await this.authBearer() }
      })
        .then(this.handleError)
        .then((data) => {
          this.group = data
        })
      this.loading = false
    }
  }
}
</script>
