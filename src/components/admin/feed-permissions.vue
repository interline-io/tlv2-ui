<template>
  <div>
    <tl-msg-info>
      <tl-msg-error v-if="error">
        {{ error }}
      </tl-msg-error>
      <div v-else>
        <p v-if="perms.actions.can_create_feed_version">
          You can upload feed versions to this feed.
          <o-button size="small" icon-left="pencil">
            Upload
          </o-button>
        </p>

        <p v-if="perms.group">
          This feed currently belongs to a group: {{ perms.group.name || 'Test Group' }}
          <tl-admin-modal text="Show group" :title="`Group: ${perms.group.name || 'Test Group'}`">
            <tl-admin-group :group="perms.group" />
          </tl-admin-modal>
        </p>
        <p v-else>
          This feed does not belong to a group.
          <o-button size="small" icon-left="pencil">
            Assign
          </o-button>
        </p>
      </div>
    </tl-msg-info>
  </div>
</template>

<script setup>
const props = defineProps({
  id: { type: Number, default: 0, required: true }
})
const config = useRuntimeConfig()

const { data: perms, error } = await useAsyncData(
  'perms',
  () => $fetch(`/feeds/${props.id}/permissions`, {
    method: 'GET',
    baseURL: config.public.adminEndpoint
  }), {
    default: () => { return {} }
  }
)

</script>
