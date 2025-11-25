<template>
  <div>
    <tl-apps-admin-group
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
import Loadable from './loadable'

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
      return await this.fetchAdmin(`/groups/${this.id}`).then((data) => {
        this.group = data
      })
    }
  }
}
</script>
