<template>
  <div>
    <slot name="nav">
      <nav class="breadcrumb box" aria-label="breadcrumbs">
        <ul>
          <li class="is-active">
            <nuxt-link :to="{name:'admin'}">
              Admin
            </nuxt-link>
          </li>
        </ul>
      </nav>
    </slot>

    <slot name="title">
      <tl-title title="Admin" />
    </slot>
    <slot name="description" />

    <div class="content">
      <ul>
        <li>
          <nuxt-link :to="{name:'admin-groups'}">
            Groups
          </nuxt-link> (More information about groups you belong to)
        </li>
        <li>
          <nuxt-link :to="{name:'admin-tenants'}">
            Tenants
          </nuxt-link> (For system administrators)
        </li>
      </ul>
    </div>
  </div>
</template>
