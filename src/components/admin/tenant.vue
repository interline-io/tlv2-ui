<template>
  <div style="border:solid green 2px;margin:5px;padding:5px">
    <code>tenant actions: {{ tenant.actions }}</code>

    <div v-if="tenant.actions.can_view">
      You can view this tenant.
    </div>

    <div v-if="tenant.actions.can_edit">
      You can edit this tenant.
      <o-button size="small" icon-left="pencil">
        Edit
      </o-button>
    </div>

    <div v-if="tenant.actions.can_edit_members">
      You can edit tenant membership.
    </div>

    <div v-if="tenant.actions.can_create_org">
      You can create groups in this tenant.
      <o-button size="small" icon-left="pencil">
        Create group
      </o-button>
    </div>

    <div v-if="tenant.actions.can_delete_org">
      You can delete groups in this tenant.
    </div>

    <div>Tenant ID: {{ tenant.id }}</div>
    <div>Tenant Name: {{ tenant.name }}</div>

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
