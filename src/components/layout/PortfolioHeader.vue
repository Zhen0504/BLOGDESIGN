<script setup>
import { sectionDefinitions, getSectionPath } from '../../data/portfolio'

defineProps({
  activeSection: {
    type: Object,
    required: true,
  },
})

const navigationSections = sectionDefinitions.filter((section) => section.id !== '00')
</script>

<template>
  <header class="portfolio-header">
    <RouterLink class="portfolio-brand" to="/" aria-label="Orbit Archive overview">
      ZHEN
    </RouterLink>

    <nav class="portfolio-nav" aria-label="Primary navigation">
      <RouterLink
        v-for="section in navigationSections"
        :key="section.id"
        class="portfolio-nav-link"
        :to="getSectionPath(section)"
        :aria-current="activeSection.id === section.id ? 'page' : undefined"
      >
        {{ section.navLabel }}
      </RouterLink>
    </nav>

    <span class="header-status" aria-hidden="true"></span>
  </header>
</template>

<style scoped>
.portfolio-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: var(--header-height);
  padding: max(22px, env(safe-area-inset-top)) var(--space-page-x) 16px;
  pointer-events: none;
}

.portfolio-brand,
.portfolio-nav,
.header-status {
  pointer-events: auto;
}

.portfolio-brand {
  width: fit-content;
  color: var(--color-text);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5em;
}

.portfolio-nav {
  display: flex;
  align-items: center;
  gap: clamp(22px, 3.4vw, 54px);
}

.portfolio-nav-link {
  position: relative;
  padding: 8px 0;
  color: var(--color-muted);
  font-family: var(--font-ui);
  font-size: 11px;
  letter-spacing: 0.28em;
  transition: color 180ms ease;
  white-space: nowrap;
}

.portfolio-nav-link::after {
  position: absolute;
  right: 0.28em;
  bottom: 1px;
  left: 0;
  height: 1px;
  background: var(--color-gold);
  content: '';
  opacity: 0;
  transform: scaleX(0.35);
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.portfolio-nav-link:hover,
.portfolio-nav-link[aria-current='page'] {
  color: var(--color-text);
}

.portfolio-nav-link[aria-current='page']::after {
  opacity: 0.82;
  transform: scaleX(1);
}

.header-status {
  justify-self: end;
  width: 7px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--color-gold);
  box-shadow: 0 0 14px rgba(240, 186, 91, 0.82);
}

@media (max-width: 760px) {
  .portfolio-header {
    grid-template-columns: 1fr;
    gap: 10px;
    align-items: start;
    padding-top: max(18px, env(safe-area-inset-top));
  }

  .portfolio-nav {
    justify-content: flex-start;
    gap: clamp(14px, 5vw, 22px);
    width: 100%;
    overflow-x: auto;
    padding-bottom: 5px;
    scrollbar-width: none;
  }

  .portfolio-nav::-webkit-scrollbar {
    display: none;
  }

  .portfolio-nav-link {
    flex: 0 0 auto;
    font-size: 9px;
    letter-spacing: 0.13em;
  }

  .header-status {
    display: none;
  }
}
</style>
