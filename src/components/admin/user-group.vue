<template>
  <div>
    <o-field horizontal :label="text" is-grouped-multiline is-grouped-left>
      <o-button icon-left="plus" size="small" @click="showUserPicker = true" />
      <o-field grouped group-multiline tags>
        <tl-admin-user
          v-for="user of users || []"
          :key="user.id"
          :user="user"
          :action="canRemove ? 'remove' : null"
          @select-user="emits('removeUser', $event)"
        />
      </o-field>
    </o-field>
    <tl-admin-modal v-if="canAdd" v-slot="scope" v-model="showUserPicker" :title="actionText">
      <tl-admin-user-search @select-user="emits('addUser', $event); scope.close();" />
    </tl-admin-modal>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '' },
  actionText: { type: String, default: '' },
  users: { type: Array, default () { return [] }, required: true },
  canAdd: { type: Boolean, default: false },
  canRemove: { type: Boolean, default: false }

})

const emits = defineEmits(['addUser', 'removeUser'])

const showUserPicker = ref(false)

</script>

<style>
.user-group {
  margin-top:20px;
  padding-top:20px;
  border-top:solid 1px #ccc;
}

</style>
