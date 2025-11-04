<template>
  <nav
    class="navbar"
    role="navigation"
    aria-label="main navigation"
  >
    <div
      class="navbar-brand"
      style="margin-right:30px"
    >
      <nuxt-link
        class="navbar-item"
        :to="{ name: 'index' }"
      >
        <img
          src="~/assets/interline-logo-small.png"
          height="20"
        >
      </nuxt-link>
    </div>

    <div class="navbar-menu">
      <div class="navbar-start">
        <nuxt-link
          v-for="item in items"
          :key="item.title"
          :to="item.to"
          class="navbar-item is-hoverable"
          :class="$route && $route.name && $route.name.startsWith(item.to.name)
            ? 'is-active is-tab'
            : ''
          "
        >
          {{ item.title }}
        </nuxt-link>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <tl-dark-mode />
        </div>
        <div class="navbar-item">
          <tl-nav-search-bar />
        </div>
        <div class="navbar-item">
          <tl-user-icon />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
const items = [
  {
    title: 'Home',
    icon: 'home',
    to: { name: 'index' }
  },
  {
    title: 'Map',
    icon: 'lightbulb',
    to: { name: 'map' }
  },
  {
    title: 'Places',
    to: { name: 'places' }
  },
  {
    title: 'Operators',
    icon: 'lightbulb',
    to: { name: 'operators' }
  },

  {
    title: 'Feeds',
    icon: 'lightbulb',
    to: { name: 'feeds' }
  },
  {
    title: 'Editor',
    icon: 'lightbulb',
    to: { name: 'editor' }
  },
  {
    title: 'Admin',

    icon: 'lightbulb',
    to: { name: 'admin' }
  }
]
</script>

<style scoped lang="scss">
@media (prefers-color-scheme: dark) {
  .navbar img {
    filter: invert(1);
  }
}

html[data-theme=dark] .navbar img {
  filter: invert(1);
}
html[data-theme=light] .navbar img {
  filter: invert(0);
}
</style>
