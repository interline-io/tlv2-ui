<template>
  <div>
    <o-field label="Name">
      {{ group.name || 'Test Group' }}
      <o-button v-if="group.actions.can_edit" size="small" icon-left="pencil">
        Edit
      </o-button>
    </o-field>

    <o-field label="Parent">
      {{ group.tenant.name || 'Test Tenant' }}
      <tl-admin-modal text="Show tenant" title="Tenant">
        <tl-admin-tenant :tenant="group.tenant" />
      </tl-admin-modal>
    </o-field>

    <div class="user-group">
      <div class="field">
        <label class="label">
          Managers
          <tl-admin-modal title="Add a group manager">
            <tl-admin-user-search @select-user="addMember('manager', $event)" />
          </tl-admin-modal>
        </label>
        <div class="field is-grouped is-grouped-multiline">
          <tl-admin-user
            v-for="user of group.users.managers || []"
            :key="user.id"
            :user="user"
            :can-remove="group.actions.can_edit_members"
            @remove-user="removeMember('manager', $event)"
          />
        </div>
      </div>
    </div>

    <div class="user-group">
      <div class="field">
        <label class="label">
          Editors
          <tl-admin-modal title="Add a group editor">
            <tl-admin-user-search @select-user="addMember('editor', $event)" />
          </tl-admin-modal>
        </label>
        <div class="field is-grouped is-grouped-multiline">
          <tl-admin-user
            v-for="user of group.users.editors || []"
            :key="user.id"
            :user="user"
            :can-remove="group.actions.can_edit_members"
            @remove-user="removeMember('editor', $event)"
          />
        </div>
      </div>

      <div class="user-group">
        <div class="field">
          <label class="label">
            Viewers
            <tl-admin-modal title="Add a group viewer">
              <tl-admin-user-search @select-user="addMember('viewer', $event)" />
            </tl-admin-modal>
          </label>
          <div class="field is-grouped is-grouped-multiline">
            <tl-admin-user
              v-for="user of group.users.viewers || []"
              :key="user.id"
              :user="user"
              :can-remove="group.actions.can_edit_members"
              @remove-user="removeMember('viewer', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

const props = defineProps({
  group: { type: Object, default() { return {} }, required: true }
})

const addMember = async function(relation, user) {
  console.log('addMember:', relation, user)
  const { data, error } = await fetch(
    `${config.public.adminEndpoint}/groups/${props.group.id}/permissions/${relation}/${user}`, {
      method: 'POST'
    }
  )
}

const removeMember = async function(relation, user) {
  console.log('removeMember:', relation, user)
  const { data, error } = await fetch(
    `${config.public.adminEndpoint}/groups/${props.group.id}/permissions/${relation}/${user}`, {
      method: 'DELETE'
    }
  )
}

</script>

<style>
.user-group {
  margin-top:20px;
  padding-top:20px;
  border-top:solid 1px #ccc;
}

</style>
