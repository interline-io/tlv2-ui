<template>
  <div style="border:solid red 2px;margin:5px;padding:5px">
    <code>group actions: {{ group.actions }}</code>

    <div v-if="group.actions.can_view">
      You can view this group.
    </div>

    <div v-if="group.actions.can_edit">
      You can edit this group.
      <o-button size="small" icon-left="pencil">
        Edit
      </o-button>
    </div>

    <div v-if="group.actions.can_edit_members">
      You can edit group membership.
    </div>

    <div v-if="group.actions.can_create_feed">
      You can create feeds in this group.
      <o-button size="small" icon-left="pencil">
        Create feed
      </o-button>
    </div>

    <div v-if="group.actions.can_delete_feed">
      You can delete feeds in this group.
    </div>

    <div>Group ID: {{ group.id }}</div>
    <div>Group Name: {{ group.name }}</div>
    <div>
      Group Managers:
      <tl-admin-user-search title="Add a group manager" @select-user="addMember('manager', $event)" />
    </div>
    <div>
      <tl-admin-user
        v-for="user of group.users.managers || []"
        :key="user.id"
        :user="user"
        :can-remove="group.actions.can_edit_members"
        @remove="removeMember"
      />
    </div>

    <div>
      Group Editors:
      <tl-admin-user-search title="Add a group editor" @select-user="addMember('editor', $event)" />
    </div>
    <div>
      <tl-admin-user
        v-for="user of group.users.editors || []"
        :key="user.id"
        :user="user"
        :can-remove="group.actions.can_edit_members"
        @remove="removeMember"
      />
    </div>

    <div>
      Group Viewers:
      <tl-admin-user-search title="Add a group viewer" @select-user="addMember('viewer', $event)" />
    </div>
    <div>
      <tl-admin-user
        v-for="user of group.users.viewers || []"
        :key="user.id"
        :user="user"
        :can-remove="group.actions.can_edit_members"
        @remove="removeMember"
      />
    </div>

    <div>
      This group belongs to a tenant:
      <tl-admin-tenant :tenant="group.tenant" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  group: { type: Object, default() { return {} }, required: true }
})

const showUserSelect = ref(false)

const addMember = function(relation, user) {
  console.log('addMember:', relation, user)
}

const removeMember = function(relation, user) {
  console.log('removeMember:', relation, user)
}

</script>
