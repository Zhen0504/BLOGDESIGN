<script setup>
defineProps({
  project: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <a
    v-if="project.href"
    class="compact-project-link"
    :href="project.href"
    :target="project.external ? '_blank' : undefined"
    :rel="project.external ? 'noopener noreferrer' : undefined"
  >
    <span class="project-index">{{ String(index + 1).padStart(2, '0') }}</span>
    <span class="project-name">{{ project.title }}</span>
    <span class="project-label">{{ project.label }}</span>
    <span class="project-arrow" aria-hidden="true">→</span>
  </a>

  <div v-else class="compact-project-link is-disabled" aria-disabled="true">
    <span class="project-index">{{ String(index + 1).padStart(2, '0') }}</span>
    <span class="project-name">{{ project.title }}</span>
    <span class="project-label">{{ project.label }}</span>
    <span class="project-arrow" aria-hidden="true">—</span>
  </div>
</template>

<style scoped>
.compact-project-link {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto 20px;
  align-items: center;
  width: min(340px, 100%);
  min-height: 70px;
  border: 1px solid rgba(222, 225, 239, 0.24);
  border-radius: 7px;
  padding: 0 16px;
  background: rgba(9, 11, 28, 0.34);
  color: var(--color-text);
  transition:
    border-color 180ms ease,
    background 180ms ease,
    box-shadow 180ms ease;
}

.compact-project-link:hover,
.compact-project-link:focus-visible {
  border-color: rgba(240, 186, 91, 0.62);
  background: rgba(24, 25, 54, 0.56);
  box-shadow: inset 0 0 24px rgba(103, 95, 218, 0.09);
}

.project-index,
.project-arrow {
  color: var(--color-gold);
  font-family: var(--font-ui);
}

.project-name {
  overflow: hidden;
  font-family: var(--font-serif-cn);
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-label {
  color: var(--color-muted);
  font-family: var(--font-ui);
  font-size: 10px;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.project-arrow {
  justify-self: end;
  transition: transform 180ms ease;
}

.compact-project-link:hover .project-arrow {
  transform: translateX(3px);
}

.compact-project-link.is-disabled {
  opacity: 0.54;
}
</style>
