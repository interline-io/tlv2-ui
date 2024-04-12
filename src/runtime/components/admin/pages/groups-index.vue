<template>
  <div>
    <slot name="title">
      <tl-title title="Groups" />
    </slot>

    <slot name="description">
      <p class="content is-medium">
        Your user belongs to the following groups. Each group grants access to one or more associated feeds and their feed versions.
      </p>
    </slot>

    <o-notification
      v-if="error"
      variant="danger"
    >
      Error: {{ error }}
    </o-notification>

    <div v-for="v of groups" :key="v.id">
      <tl-msg-info no-icon :title="v.name" variant="light">
        <tl-admin-group :id="v.id" />
      </tl-msg-info>
    </div>
  </div>
</template>

<script>
import Loadable from '../../loadable'

export default {
  mixins: [Loadable],
  data () {
    return {
      groups: []
    }
  },
  mounted () { this.getData() },
  methods: {
    async getData () {
      this.loading = true
      await fetch(`${this.apiBase}/admin/groups`, {
        headers: { authorization: await this.authBearer() }
      })
        .then(this.handleError)
        .then((data) => {
          this.groups = data.groups
        })
        .catch(this.setError)
      this.loading = false
    }
  }
}
</script>
