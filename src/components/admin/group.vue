<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else-if="group">
      <tl-loading v-if="pending" />
      <div>
        <o-field label="Name" horizontal>
          <tl-admin-input :value="group.name" :can-edit="group.actions.can_edit" @save="saveName" />
        </o-field>

        <o-field label="Tenant" horizontal>
          <o-field>
            <tl-admin-ghost-button :text="group.tenant.name" />
            <o-button @click="showTenant = true">
              Show tenant
            </o-button>
          </o-field>
        </o-field>

        <tl-admin-user-group
          text="Managers"
          action-text="Add a group manager"
          :users="group.users.managers"
          :can-add="group.actions.can_edit_members"
          :can-remove="group.actions.can_edit_members"
          @add-user="addMember('manager', $event)"
          @remove-user="removeMember('manager', $event)"
        />

        <tl-admin-user-group
          text="Editors"
          action-text="Add a group editor"
          :users="group.users.editors"
          :can-add="group.actions.can_edit_members"
          :can-remove="group.actions.can_edit_members"
          @add-user="addMember('editor', $event)"
          @remove-user="removeMember('editor', $event)"
        />

        <tl-admin-user-group
          text="Viewers"
          action-text="Add a group viewer"
          :users="group.users.viewers"
          :can-add="group.actions.can_edit_members"
          :can-remove="group.actions.can_edit_members"
          @add-user="addMember('viewer', $event)"
          @remove-user="removeMember('viewer', $event)"
        />

        <tl-admin-modal v-model="showTenant" :title="`Tenant: ${ group.tenant.name }`">
          <tl-admin-tenant :id="group.tenant.id" @changed="changed" />
        </tl-admin-modal>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

const props = defineProps({
  id: { type: Number, default: 0, required: true }
})

const emits = defineEmits(['changed'])

const showTenant = ref(false)

const { data: group, pending, refresh, error } = await useAsyncData(
  'group',
  () => $fetch(`/groups/${props.id}`, {
    method: 'GET',
    baseURL: config.public.adminEndpoint
  }), {
    default: () => { return {} }
  }
)

const changed = function() {
  console.log('group ch')
  refresh()
  emits('changed')
}

const saveName = async function(value) {
  console.log('saveName', value)
  const { error } = await fetch(
    `${config.public.adminEndpoint}/groups/${props.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: value })
    }
  )
  changed()
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

<style>
.user-group {
  margin-top:20px;
  padding-top:20px;
  border-top:solid 1px #ccc;
}

</style>
