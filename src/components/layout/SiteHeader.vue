<script setup>
import { navigationItems } from '../../data/navigation'
</script>

<template>
  <header class="site-header">
    <nav class="site-nav" aria-label="主导航">
      <RouterLink class="site-logo" to="/" aria-label="Leo Team Blog 首页">
        Leo Team Blog
      </RouterLink>

      <div class="nav-links">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.to"
          class="nav-link"
          :to="item.to"
        >
          {{ item.label }}
        </RouterLink>
      </div>

      <RouterLink class="contact-link" to="/about">联系我们</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  height: var(--header-height);
  border-bottom: 1px solid rgb(229 231 235 / 70%);
  background: rgb(255 255 255 / 86%);
  backdrop-filter: blur(14px);
}

.site-nav {
  width: min(100%, var(--container-width));
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--space-page-x);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 24px;
}

.site-logo {
  font-size: 18px;
  font-weight: 900;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link,
.contact-link {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  padding: 0 14px;
  color: var(--color-muted);
  font-size: 14px;
  font-weight: 700;
}

.nav-link:hover,
.contact-link:hover,
.nav-link.router-link-active {
  background: var(--color-surface);
  color: var(--color-text);
}

.contact-link {
  justify-self: end;
  border: 1px solid var(--color-border);
  background: #ffffff;
}

@media (max-width: 760px) {
  .site-header {
    height: auto;
  }

  .site-nav {
    min-height: var(--header-height);
    grid-template-columns: 1fr;
    justify-items: start;
    gap: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .nav-links {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .contact-link {
    display: none;
  }
}
</style>
