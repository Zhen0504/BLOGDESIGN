<script setup>
import { getSectionPath, sectionDefinitions } from '../../data/portfolio'

defineProps({
  activeSection: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <aside class="section-indicator" aria-label="Section position">
    <span class="indicator-number" aria-live="polite">{{ activeSection.id }}</span>
    <nav class="indicator-dots" aria-label="Portfolio sections">
      <RouterLink
        v-for="section in sectionDefinitions"
        :key="section.id"
        class="indicator-dot"
        :class="{ 'is-active': activeSection.id === section.id }"
        :to="getSectionPath(section)"
        :title="section.navLabel"
        :aria-label="`Go to ${section.navLabel}`"
        :aria-current="activeSection.id === section.id ? 'step' : undefined"
      >
        <span></span>
      </RouterLink>
    </nav>
    <span class="indicator-line" aria-hidden="true"></span>
  </aside>
</template>

<style scoped>
.section-indicator {
  position: fixed;
  top: 50%;
  right: clamp(22px, 3vw, 54px);
  z-index: 24;
  display: grid;
  justify-items: center;
  gap: 17px;
  transform: translateY(-50%);
}

.indicator-number {
  color: var(--color-gold);
  font-family: var(--font-ui);
  font-size: 12px;
  letter-spacing: 0.18em;
}

.indicator-dots {
  display: grid;
  gap: 13px;
}

.indicator-dot {
  display: grid;
  width: 14px;
  aspect-ratio: 1;
  place-items: center;
  border-radius: 50%;
}

.indicator-dot span {
  width: 7px;
  aspect-ratio: 1;
  border-radius: inherit;
  background: rgba(160, 164, 185, 0.5);
  transition:
    background 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.indicator-dot:hover span,
.indicator-dot:focus-visible span {
  background: var(--color-text);
  transform: scale(1.18);
}

.indicator-dot.is-active {
  border: 1px solid rgba(237, 240, 248, 0.42);
}

.indicator-dot.is-active span {
  background: var(--color-gold);
  box-shadow: 0 0 9px rgba(240, 186, 91, 0.72);
}

.indicator-line {
  width: 1px;
  height: 50px;
  margin-top: 4px;
  background: linear-gradient(180deg, rgba(232, 234, 242, 0.58), transparent);
}

@media (max-width: 760px) {
  .section-indicator {
    top: auto;
    right: auto;
    bottom: max(18px, env(safe-area-inset-bottom));
    left: 50%;
    display: flex;
    align-items: center;
    gap: 12px;
    transform: translateX(-50%);
  }

  .indicator-number,
  .indicator-line {
    display: none;
  }

  .indicator-dots {
    display: flex;
    gap: 11px;
  }
}
</style>
