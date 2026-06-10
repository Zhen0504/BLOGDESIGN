<script setup>
import { RouterView } from 'vue-router'
import SiteFooter from './components/layout/SiteFooter.vue'
import SiteHeader from './components/layout/SiteHeader.vue'
</script>

<template>
  <div class="app-shell">
    <SiteHeader />
    <main class="app-main">
      <RouterView />
    </main>
    <SiteFooter />
  </div>
</template>
