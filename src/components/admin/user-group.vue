<template>
  <div class="user-group">
    <div class="field">
      <label class="label">
        {{ text }}
      </label>
      <div class="field is-grouped is-grouped-multiline">
        <tl-admin-modal v-if="canAdd" v-slot="scope" :title="actionText">
          <tl-admin-user-search @select-user="emits('addUser', $event); scope.close();" />
        </tl-admin-modal>
        <tl-admin-user
          v-for="user of users || []"
          :key="user.id"
          :user="user"
          :action="canRemove ? 'remove' : null"
          @select-user="emits('removeUser', $event)"
        />
      </div>
    </div>
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

</script>

<style>
.user-group {
  margin-top:20px;
  padding-top:20px;
  border-top:solid 1px #ccc;
}

</style>
