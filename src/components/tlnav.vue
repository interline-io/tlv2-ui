<template>
  <nav
    class="navbar"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="navbar-brand">
      <nuxt-link
        class="navbar-item"
        :to="{ name: 'index' }"
      >
        <div class="logo-image" />
      </nuxt-link>
    </div>

    <div class="navbar-menu">
      <div class="navbar-start">
        <nuxt-link
          v-for="item in items"
          :key="item.title"
          :to="item.to"
          class="navbar-item is-hoverable"
          :class="
            $route && $route.name && $route.name.startsWith(item.to.name)
              ? 'is-active is-tab'
              : ''
          "
        >
          {{ item.title }}
        </nuxt-link>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">

          <tl-nav-search-bar
            @focus="searchFocus = true"
            @blur="searchFocus = false"
          />
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      searchFocus: false,
      apikey: null,
      items: [
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
          title: 'Operators',
          icon: 'lightbulb',
          to: { name: 'operators' }
        },
        {
          title: 'Source Feeds',
          icon: 'lightbulb',
          to: { name: 'feeds' }
        }
      ]
    }
  },
  computed: {
    searchBarWidth() {
      return { 'flex-grow': this.searchFocus ? 1 : 0.25 }
    }
  }
}
</script>

<style scoped>
.navbar {
  background: #f9f9f9;
}

a {
  color: #000;
}

.logo-image {
  background: url('/svg/transitland_logo.svg');
  background-size: contain;
  background-repeat: no-repeat;
  margin-left: 20px;
  margin-right: 20px;
  width: 80px;
  height: 40px;
}

.notification {
  padding: 0.6em;
}

.notification p {
  display: block;
}

.client-only-placeholder {
  display: flex;
}
</style>
