<script setup lang="ts">
import { navigationGroups } from '../navigation'
</script>

<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        tlv2-ui Component Library
      </h1>
      <p class="subtitle">
        Interactive demos and testing playground for all t-* components
      </p>

      <div class="content">
        <div v-for="group in navigationGroups" :key="group.title">
          <h2 class="title is-3">
            {{ group.title }}
          </h2>
          <div class="buttons">
            <NuxtLink
              v-for="item in group.items"
              :key="item.path"
              :to="item.path"
              :class="`button is-${group.variant}`"
            >
              <t-icon :icon="item.icon" />
              <span>{{ item.name }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.button {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
