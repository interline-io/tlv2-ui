<template>
  <div>
    <o-field
      horizontal
      :label="text"
      is-grouped-multiline
      is-grouped-left
    >
      <o-button
        v-if="canAdd"
        icon-left="plus"
        size="small"
        @click="showUserPicker = true"
      />
      <o-field
        grouped
        group-multiline
        tags
      >
        <tl-apps-admin-tenant-item
          v-for="v of nameSort(tenants || [])"
          :key="v.id"
          :value="v"
          :action="canRemove ? 'remove' : null"
          @select="$emit('removePermissions', { type: 'tenant', id: $event, refrel: 'member' })"
        />

        <tl-apps-admin-group-item
          v-for="v of nameSort(groups || [])"
          :key="v.id"
          :value="v"
          :action="canRemove ? 'remove' : null"
          @select="$emit('removePermissions', { type: 'org', id: $event, refrel: 'viewer' })"
        />

        <tl-apps-admin-user-item
          v-for="v of nameSort(users || [])"
          :key="v.id"
          :user="v"
          :action="canRemove ? 'remove' : null"
          @select="$emit('removePermissions', { type: 'user', id: $event })"
        />
      </o-field>
    </o-field>
    <tl-modal
      v-slot="scope"
      v-model="showUserPicker"
      :title="actionText"
    >
      <tl-apps-admin-entrel-search
        :action-info="actionInfo"
        :show-users="showUsers"
        :show-groups="showGroups"
        :show-tenants="showTenants"
        :show-user-star="showUserStar"
        @select="$emit('addPermissions', $event); scope.close();"
      />
    </tl-modal>
  </div>
</template>

<script>
import { nameSort } from '../../lib/filters'

export default {
  props: {
    text: { type: String, default: '' },
    actionText: { type: String, default: '' },
    actionInfo: { type: Object, default () { return {} } },
    entrels: { type: Array, default () { return [] } },
    canAdd: { type: Boolean, default: false },
    canRemove: { type: Boolean, default: false },
    showUsers: { type: Boolean, default: true },
    showGroups: { type: Boolean, default: false },
    showTenants: { type: Boolean, default: false },
    showUserStar: { type: Boolean, default: false }
  },
  emits: ['addPermissions', 'removePermissions'],
  data () {
    return {
      showUserPicker: false
    }
  },
  computed: {
    users () {
      return this.entrels.filter((v) => { return v.type === 5 })
    },
    groups () {
      return this.entrels.filter((v) => { return v.type === 2 })
    },
    tenants () {
      return this.entrels.filter((v) => { return v.type === 1 })
    }
  },
  methods: {
    nameSort
  }
}
</script>
