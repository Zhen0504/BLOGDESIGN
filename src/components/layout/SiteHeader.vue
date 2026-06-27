<script setup>
import { navigationItems } from '../../data/navigation'
</script>

<template>
  <header class="site-header">
    <!-- Header text/routes come from navigationItems; keep navigation behavior in RouterLink. -->
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
  /* Header ignores pointer events so only the pill nav itself captures clicks. */
  position: fixed;
  top: 16px;
  left: 0;
  right: 0;
  z-index: 20;
  height: auto;
  pointer-events: none;
}

.site-nav {
  /* Glass pill: fixed shape and blur are intentionally isolated from page content. */
  position: relative;
  width: min(90vw, var(--container-width));
  height: var(--header-height);
  margin: 0 auto;
  padding: 0 clamp(18px, 4vw, 32px);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.08));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(255, 255, 255, 0.12),
    inset 0 0 18px rgba(255, 255, 255, 0.10),
    0 14px 34px rgb(0 0 0 / 18%);
  backdrop-filter: blur(18px) saturate(1.8) brightness(1.12);
  -webkit-backdrop-filter: blur(18px) saturate(1.8) brightness(1.12);
  pointer-events: auto;
}

.site-nav::before {
  /* Decorative shine layer; pointer-events stays off so links remain clickable. */
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.34), transparent 34%),
    linear-gradient(270deg, rgba(32, 214, 199, 0.14), transparent 42%);
  pointer-events: none;
}

.site-logo {
  position: relative;
  z-index: 1;
  color: #f7f7fb;
  font-size: 18px;
  font-weight: 900;
  text-shadow: 0 1px 12px rgb(0 0 0 / 28%);
}

.nav-links {
  position: relative;
  z-index: 1;
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
  color: rgba(247, 247, 251, 0.76);
  font-size: 14px;
  font-weight: 700;
  text-shadow: 0 1px 10px rgb(0 0 0 / 24%);
}

.nav-link:hover,
.contact-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.24);
  color: #ffffff;
}

.contact-link {
  position: relative;
  z-index: 1;
  justify-self: end;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.16);
}

@media (max-width: 760px) {
  .site-header {
    top: 16px;
    height: auto;
  }

  .site-nav {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 14px;
  }

  .nav-links {
    /* Horizontal overflow preserves all routes on narrow screens without wrapping. */
    width: 100%;
    overflow-x: auto;
    justify-content: flex-end;
  }

  .contact-link {
    display: none;
  }
}
</style>
