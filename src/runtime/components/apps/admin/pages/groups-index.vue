<template>
  <div>
    <slot name="title">
      <tl-title title="Groups" />
    </slot>

    <slot name="description">
      <p class="content">
        Your user belongs to the following groups. Each group grants access to one or more associated feeds and their feed versions.
      </p>
    </slot>

    <o-notification
      v-if="error"
      variant="danger"
    >
      Error: {{ error }}
    </o-notification>

    <ul>
      <li v-for="v of groups" :key="v.id">
        <tl-apps-admin-group-item
          :key="v.id"
          :value="v"
        />
      </li>
    </ul>
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
      return await this.fetchAdmin('/groups').then((data) => {
        this.groups = data.groups
      })
    }
  }
}
</script>
