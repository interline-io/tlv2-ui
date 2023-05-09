<template>
  <div>
    <div v-if="tenant.actions.can_create_org">
      You can create groups in this tenant.
      <o-button size="small" icon-left="pencil">
        Create group
      </o-button>
    </div>

    <div>
      Tenant Name: {{ tenant.name }}
      <o-button v-if="tenant.actions.can_edit" size="small" icon-left="pencil">
        Edit
      </o-button>
    </div>

    <div>
      Tenant Admins:
      <o-button v-if="tenant.actions.can_edit_members" size="small" icon-left="plus" />
    </div>
    <div>
      <tl-admin-user
        v-for="user of tenant.users.admins || []"
        :key="user.id"
        :user="user"
        :can-remove="tenant.actions.can_edit_members"
        @remove="removeMember"
      />
    </div>

    <div>
      Tenant Members:
      <o-button v-if="tenant.actions.can_edit_members" size="small" icon-left="plus" />
    </div>
    <div>
      <tl-admin-user
        v-for="user of tenant.users.members || []"
        :key="user.id"
        :user="user"
        :can-remove="tenant.actions.can_edit_members"
        @remove="removeMember"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  tenant: { type: Object, default() { return {} }, required: true }
})

// const addMember = function(relation, user) {
//   console.log('addMember:', relation, user)
// }

const removeMember = function(relation, user) {
  console.log('removeMember:', relation, user)
}
</script>
