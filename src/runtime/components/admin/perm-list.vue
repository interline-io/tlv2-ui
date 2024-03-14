<template>
  <div>
    <div v-if="showUser" class="pb-2">
      You are logged in as {{ user.nickname }} ({{ user.email }})
    </div>

    <div v-if="actionText" class="pb-2">
      {{ actionText }}
    </div>

    <div class="field is-grouped is-grouped-multiline">
      <div
        v-for="[k,v] of Object.entries(actions)"
        :key="k"
        class="control"
      >
        <div class="tags has-addons">
          <span class="tag is-list">{{ k.replace('can_','').replaceAll('_',' ') }}</span>
          <span
            v-if="v"
            class="tag is-primary"
          ><o-icon
            icon="check"
            size="small"
          /></span>
          <span
            v-else
            class="tag is-warning"
          ><o-icon
            icon="alert"
            size="small"
          /></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthzMixin from './authz-mixin'

export default {
  mixins: [AuthzMixin],
  props: {
    showUser: { type: Boolean, default: false },
    actions: { type: Object, default () { return { can_view: false } } },
    actionText: { type: String, default: null }
  }
}
</script>
