<template>
  <div id="app">
    <header class="navbar is-primary" role="navigation" aria-label="main navigation">
      <div class="container">
        <div class="navbar-brand">
          <NuxtLink to="/" class="navbar-item">
            <strong>tlv2-ui Component Library</strong>
          </NuxtLink>
        </div>
        <div class="navbar-menu">
          <div class="navbar-end">
            <div class="navbar-item">
              <t-theme-toggle />
            </div>
          </div>
        </div>
      </div>
    </header>
    <NuxtPage />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  flex-shrink: 0;
}

.navbar-item strong {
  color: white;
  font-size: 1.1rem;
}

.navbar-item {
  color: white;
}

.navbar-brand .navbar-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
