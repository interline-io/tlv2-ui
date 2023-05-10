<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else-if="tenant">
      <tl-loading v-if="pending" />

      <o-field label="Name">
        <tl-admin-input :value="tenant.name" :can-edit="tenant.actions.can_edit" @save="saveName" />
      </o-field>

      <div v-if="tenant.actions.can_create_org">
        You can create groups in this tenant.
        <o-button size="small" icon-left="pencil" @click="createGroup">
          Create group
        </o-button>
      </div>

      <div>
        Tenant groups:
        <div v-for="group of tenant.groups" :key="group.id">
          {{ group.id }}: {{ group.name }}
        </div>
      </div>

      <tl-admin-user-group
        text="Admins"
        action-text="Add a tenant admin"
        :users="tenant.users.managers"
        :can-add="tenant.actions.can_edit_members"
        :can-remove="tenant.actions.can_edit_members"
        @add-user="addMember('admin', $event)"
        @remove-user="removeMember('admin', $event)"
      />

      <tl-admin-user-group
        text="Members"
        action-text="Add a tenant member"
        :users="tenant.users.editors"
        :can-add="tenant.actions.can_edit_members"
        :can-remove="tenant.actions.can_edit_members"
        @add-user="addMember('member', $event)"
        @remove-user="removeMember('member', $event)"
      />
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

const props = defineProps({
  id: { type: Number, default: 0, required: true }
})

const { data: tenant, pending, refresh, error } = await useAsyncData(
  'tenant',
  () => $fetch(`/tenants/${props.id}`, {
    method: 'GET',
    baseURL: config.public.adminEndpoint
  }), {
    default: () => { return {} }
  }
)

const createGroup = async function() {
  console.log('createGroup:')
  const { error } = await fetch(
    `${config.public.adminEndpoint}/tenants/${props.id}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Group' })
    }
  )
  refresh()
}

const saveName = async function(value) {
  console.log('saveName', value)
  const { error } = await fetch(
    `${config.public.adminEndpoint}/tenants/${props.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: value })
    }
  )
  refresh()
}

const addMember = async function(relation, user) {
  console.log('addMember:', relation, user)
  const { error } = await fetch(
    `${config.public.adminEndpoint}/groups/${props.id}/permissions/${relation}/${user}`, {
      method: 'POST'
    }
  )
  refresh()
}

const removeMember = async function(relation, user) {
  console.log('removeMember:', relation, user)
  const { error } = await fetch(
    `${config.public.adminEndpoint}/groups/${props.id}/permissions/${relation}/${user}`, {
      method: 'DELETE'
    }
  )
  refresh()
}

</script>
