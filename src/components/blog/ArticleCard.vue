<script setup>
import { onBeforeUnmount, ref } from 'vue'

defineProps({
  post: {
    type: Object,
    required: true,
  },
})

const cardRef = ref(null)
const particleTimers = []
const activeParticles = []
const isFinePointer = () => window.matchMedia('(pointer: fine)').matches

function updateGlow(event) {
  const card = cardRef.value
  if (!card || !isFinePointer()) return

  const rect = card.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const rotateX = ((y - centerY) / centerY) * -8
  const rotateY = ((x - centerX) / centerX) * 8

  card.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`)
  card.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`)
  card.style.setProperty('--glow-intensity', '1')
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${(x - centerX) * 0.025}px, ${(y - centerY) * 0.025}px, 0)`
}

function createParticle() {
  const card = cardRef.value
  if (!card || !isFinePointer()) return

  const particle = document.createElement('span')
  const x = Math.random() * card.clientWidth
  const y = Math.random() * card.clientHeight

  particle.className = 'article-particle'
  particle.style.left = `${x}px`
  particle.style.top = `${y}px`
  particle.style.setProperty('--particle-x', `${(Math.random() - 0.5) * 96}px`)
  particle.style.setProperty('--particle-y', `${(Math.random() - 0.5) * 96}px`)
  card.appendChild(particle)
  activeParticles.push(particle)
}

function startParticles() {
  if (!isFinePointer()) return

  clearParticles()
  for (let index = 0; index < 12; index += 1) {
    particleTimers.push(window.setTimeout(createParticle, index * 80))
  }
}

function clearParticles() {
  while (particleTimers.length) {
    window.clearTimeout(particleTimers.pop())
  }

  while (activeParticles.length) {
    activeParticles.pop()?.remove()
  }
}

function resetCard() {
  const card = cardRef.value
  if (!card) return

  card.style.setProperty('--glow-intensity', '0')
  card.style.transform = ''
  clearParticles()
}

function createRipple(event) {
  const card = cardRef.value
  if (!card || !isFinePointer()) return

  const rect = card.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const maxDistance = Math.max(
    Math.hypot(x, y),
    Math.hypot(x - rect.width, y),
    Math.hypot(x, y - rect.height),
    Math.hypot(x - rect.width, y - rect.height),
  )
  const ripple = document.createElement('span')

  ripple.className = 'article-ripple'
  ripple.style.width = `${maxDistance * 2}px`
  ripple.style.height = `${maxDistance * 2}px`
  ripple.style.left = `${x - maxDistance}px`
  ripple.style.top = `${y - maxDistance}px`
  card.appendChild(ripple)
  window.setTimeout(() => ripple.remove(), 900)
}

onBeforeUnmount(clearParticles)
</script>

<template>
  <article
    ref="cardRef"
    class="article-card magic-bento-card magic-bento-card--border-glow"
    :class="{
      'article-card-featured': post.featured,
      'article-card-muted': post.muted,
      'article-card-with-image': post.image,
    }"
    @pointerenter="startParticles"
    @pointermove="updateGlow"
    @pointerleave="resetCard"
    @click="createRipple"
  >
    <div v-if="post.image" class="article-card__image" aria-hidden="true">
      <img
        :src="post.image.src"
        :alt="post.image.alt"
        :style="{ objectPosition: post.image.position }"
      >
    </div>

    <div class="article-card__header">
      <p class="article-category">{{ post.category }}</p>
      <p class="article-meta">{{ post.meta }}</p>
    </div>

    <div class="article-card__content">
      <h2>{{ post.title }}</h2>
      <p class="article-summary">{{ post.summary }}</p>
      <ul class="article-tags" aria-label="文章关键词">
        <li v-for="tag in post.tags" :key="tag">#{{ tag }}</li>
      </ul>
    </div>
  </article>
</template>

<style scoped>
.article-card {
  --glow-color: 132, 0, 255;
  --glow-x: 50%;
  --glow-y: 50%;
  --glow-intensity: 0;
  --glow-radius: 220px;
  position: relative;
  overflow: hidden;
  min-height: 210px;
  aspect-ratio: 4 / 3;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid #2f293a;
  border-radius: 20px;
  padding: 1.25em;
  background: #120f17;
  color: #ffffff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform-style: preserve-3d;
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    border-color 220ms ease;
  will-change: transform;
}

.article-card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(
      calc(var(--glow-radius) * 0.92) circle at var(--glow-x) var(--glow-y),
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.10)) 0%,
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.045)) 34%,
      transparent 68%
    );
  opacity: 1;
  pointer-events: none;
}

.article-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
  padding: 7px;
  background:
    radial-gradient(
      var(--glow-radius) circle at var(--glow-x) var(--glow-y),
      rgba(var(--glow-color), calc(var(--glow-intensity) * 1)) 0%,
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.72)) 28%,
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.20)) 48%,
      transparent 68%
    );
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  pointer-events: none;
}

.article-card:hover {
  border-color: rgba(var(--glow-color), 0.72);
  box-shadow:
    inset 0 0 0 1px rgba(var(--glow-color), 0.10),
    0 4px 20px rgba(46, 24, 78, 0.42),
    0 0 30px rgba(var(--glow-color), 0.20);
}

.article-card-featured {
  --glow-color: 132, 0, 255;
}

.article-card-with-image {
  background: #100d16;
}

.article-card-muted {
  opacity: 0.78;
}

.article-card__image {
  position: absolute;
  inset: 0 0 auto;
  z-index: 1;
  height: 62%;
  overflow: hidden;
  border-radius: inherit;
  opacity: 0.46;
  pointer-events: none;
}

.article-card__image::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(18, 15, 23, 0.12), #120f17 96%),
    linear-gradient(90deg, rgba(18, 15, 23, 0.42), transparent 52%);
}

.article-card__image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  filter: saturate(0.9) contrast(1.05);
}

.article-card__header,
.article-card__content {
  position: relative;
  z-index: 3;
}

.article-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.article-category,
.article-meta {
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.2;
}

.article-category {
  color: #ffffff;
}

.article-meta {
  color: rgba(255, 255, 255, 0.56);
  text-align: right;
}

.article-card h2 {
  display: -webkit-box;
  margin: 0 0 0.32em;
  overflow: hidden;
  color: #ffffff;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.15;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.article-summary {
  display: -webkit-box;
  margin: 0 0 0.85em;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  line-height: 1.38;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.article-tags li {
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 999px;
  padding: 5px 8px;
  background: rgba(255, 255, 255, 0.055);
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  line-height: 1;
}

.article-card :deep(.article-particle) {
  position: absolute;
  z-index: 4;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(var(--glow-color), 1);
  box-shadow: 0 0 6px rgba(var(--glow-color), 0.7);
  pointer-events: none;
  animation: particle-float 2.4s ease-in-out infinite alternate;
}

.article-card :deep(.article-particle)::before {
  content: '';
  position: absolute;
  inset: -2px;
  z-index: -1;
  border-radius: inherit;
  background: rgba(var(--glow-color), 0.2);
}

.article-card :deep(.article-ripple) {
  position: absolute;
  z-index: 1;
  border-radius: 50%;
  background:
    radial-gradient(
      circle,
      rgba(var(--glow-color), 0.38) 0%,
      rgba(var(--glow-color), 0.26) 28%,
      rgba(var(--glow-color), 0.12) 52%,
      transparent 74%
    );
  mix-blend-mode: screen;
  pointer-events: none;
  animation: ripple-out 900ms ease-out forwards;
}

@keyframes particle-float {
  from {
    opacity: 0.4;
    transform: translate3d(0, 0, 0) scale(0.65) rotate(0deg);
  }

  to {
    opacity: 1;
    transform: translate3d(var(--particle-x), var(--particle-y), 0) scale(1) rotate(220deg);
  }
}

@keyframes ripple-out {
  from {
    opacity: 1;
    transform: scale(0);
  }

  to {
    opacity: 0;
    transform: scale(1);
  }
}

@media (max-width: 720px), (pointer: coarse) {
  .article-card {
    min-height: 180px;
    transform: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-card,
  .article-card :deep(.article-particle),
  .article-card :deep(.article-ripple) {
    animation: none;
    transition: none;
  }
}
</style>
