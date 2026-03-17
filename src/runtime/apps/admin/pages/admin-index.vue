<template>
  <div>
    <slot name="title">
      <tl-title title="Admin" />
    </slot>
    <slot name="description" />

    <div class="content">
      <ul>
        <li>
          <tl-link route-key="apps-admin-groups">
            Groups
          </tl-link> (More information about groups you belong to)
        </li>
        <li>
          <tl-link route-key="apps-admin-tenants">
            Tenants
          </tl-link> (For system administrators)
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
