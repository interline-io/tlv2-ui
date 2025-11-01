@ -1,86 +0,0 @@
<template>
  <div class="outer">
    <nav class="navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <nuxt-link class="navbar-item" :to="{ name: 'index' }">
          Test App
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
              $route
                && $route.name
                && $route.name.startsWith(item.to.name)
                ? 'is-active is-tab'
                : ''
            "
          >
            {{ item.title }}
          </nuxt-link>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            Search
          </div>
        </div>
      </div>
    </nav>

    <div class="main">
      <div class="container">
        <slot />
      </div>
    </div>

    <footer class="footer content is-small">
      <p>
        <a href="/">Footer</a>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const items = [
  {
    title: 'Home',
    to: { name: 'index' },
  },
  {
    title: 'About',
    to: { name: 'about' },
  },
]
</script>

<style scoped>
.footer {
    padding: 20px;
}

.outer {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
}

.main {
    flex: 1;
}

.main {
    flex: 1;
    padding-top: 20px;
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 20px;
}
</style>
