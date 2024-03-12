<template>
  <div>
    <slot name="nav">
      <nav class="breadcrumb box" aria-label="breadcrumbs">
        <ul>
          <li>
            <nuxt-link :to="{ name: 'admin'}">
              Admin
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{ name: 'admin-groups'}">
              Groups
            </nuxt-link>
          </li>
          <li class="is-active">
            <nuxt-link to="{ name: 'admin-groups-groupKey', params: { groupKey: tenantKey}}">
              {{ groupKey }}
            </nuxt-link>
          </li>
        </ul>
      </nav>
    </slot>

    <slot name="title">
      <tl-title title="Group" />
    </slot>

    <tl-admin-group :id="groupKey" />
  </div>
</template>

<script>
export default {
  props: {
    groupKey: { type: String, default: '', required: true }
  }
}
</script>
