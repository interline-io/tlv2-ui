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
          This feed currently belongs to a group: {{ perms.group.name }}
          <o-button @click="showGroup = true">
            Show Group
          </o-button>
        </p>
        <p v-else>
          This feed does not belong to a group.
          <o-button size="small" icon-left="pencil">
            Assign
          </o-button>
        </p>
      </div>
    </tl-msg-info>

    <tl-admin-modal v-model="showGroup" text="Show group" :title="`Group: ${perms.group.name }`">
      <tl-admin-group :id="perms.group.id" @changed="changed" />
    </tl-admin-modal>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

const showGroup = ref(false)

const props = defineProps({
  id: { type: Number, default: 0, required: true }
})

const emits = defineEmits(['changed'])

const { data: perms, refresh, error } = await useAsyncData(
  'perms',
  () => $fetch(`/feeds/${props.id}`, {
    method: 'GET',
    baseURL: config.public.adminEndpoint
  }), {
    default: () => { return {} }
  }
)

const changed = function() {
  console.log('fp ch')
  refresh()
  emits('changed')
}

</script>
