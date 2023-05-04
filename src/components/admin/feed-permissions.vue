<template>
  <div>
    <tl-msg-info>
      <tl-msg-error v-if="error">
        {{ error }}
      </tl-msg-error>
      <div v-else>
        <code>feed actions: {{ perms.actions }}</code>

        <div v-if="perms.actions.can_view">
          You can view this feed.
        </div>

        <!-- <div v-if="perms.actions.can_edit">
          You can edit this feed.
          <o-button size="small" icon-left="pencil">
            Edit
          </o-button>
        </div> -->

        <div v-if="perms.actions.can_create_feed_version">
          You can upload feed versions to this feed.
          <o-button size="small" icon-left="pencil">
            Upload
          </o-button>
        </div>

        <div v-if="perms.actions.can_create_feed_version">
          You can delete feed versions from this feed.
        </div>

        <div v-if="perms.actions.can_edit">
          You can assign this feed to a different group.
          <o-button size="small" icon-left="pencil">
            Assign
          </o-button>
        </div>

        <div v-if="perms.group">
          This feed currently belongs to a group:
          <tl-admin-group :group="perms.group" />
        </div>
        <div v-else>
          This feed does not belong to a group.
        </div>

        <br>
        <div>raw response:</div>
        <div>{{ perms }}</div>
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
