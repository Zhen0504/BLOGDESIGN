<script setup>
import HeroSection from '../components/home/HeroSection.vue'

function handlePreviewPointerMove(event) {
  // Convert pointer position to edge proximity and angle, then let CSS handle
  // the border glow rendering through custom properties.
  const card = event.currentTarget
  const rect = card.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const cx = rect.width / 2
  const cy = rect.height / 2
  const dx = x - cx
  const dy = y - cy
  const kx = dx === 0 ? Infinity : cx / Math.abs(dx)
  const ky = dy === 0 ? Infinity : cy / Math.abs(dy)
  const edgeProximity = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1) * 100
  let cursorAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90

  if (cursorAngle < 0) {
    cursorAngle += 360
  }

  card.style.setProperty('--edge-proximity', edgeProximity.toFixed(3))
  card.style.setProperty('--cursor-angle', `${cursorAngle.toFixed(3)}deg`)
}

function handlePreviewPointerLeave(event) {
  // Reset glow intensity when the pointer leaves the card.
  event.currentTarget.style.setProperty('--edge-proximity', '0')
}
</script>

<template>
  <HeroSection />

  <section id="home-preview" class="page-section preview-section">
    <div class="page-container preview-grid">
      <article
        class="preview-item"
        @pointermove="handlePreviewPointerMove"
        @pointerleave="handlePreviewPointerLeave"
      >
        <p class="eyebrow">Blog</p>
        <h2>技术文章</h2>
        <p>沉淀课程学习、前端实践和项目复盘。</p>
      </article>
      <article
        class="preview-item"
        @pointermove="handlePreviewPointerMove"
        @pointerleave="handlePreviewPointerLeave"
      >
        <p class="eyebrow">Projects</p>
        <h2>项目展示</h2>
        <p>展示团队协作完成的阶段性成果。</p>
      </article>
      <article
        class="preview-item"
        @pointermove="handlePreviewPointerMove"
        @pointerleave="handlePreviewPointerLeave"
      >
        <p class="eyebrow">Team</p>
        <h2>团队成员</h2>
        <p>介绍成员分工、技能方向和协作方式。</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.preview-section {
  border-top: 1px solid var(--color-border);
  background: #17141f;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.preview-item {
  /* CSS variables are updated by pointer events; default values keep cards calm. */
  --edge-proximity: 0;
  --edge-sensitivity: 18;
  --color-sensitivity: 28;
  --cursor-angle: 45deg;
  --cone-spread: 25;
  position: relative;
  isolation: isolate;
  overflow: visible;
  min-height: 210px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 28px;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: var(--shadow-soft);
}

.preview-item::before {
  /* Thin gradient border appears only when the pointer is close enough to an edge. */
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background:
    conic-gradient(
      from var(--cursor-angle) at center,
      transparent 0 34%,
      #20d6c7 42%,
      #c084fc 50%,
      #38bdf8 58%,
      transparent 66% 100%
    ) border-box;
  border: 1px solid transparent;
  opacity: calc((var(--edge-proximity) - var(--color-sensitivity)) / (100 - var(--color-sensitivity)));
  mask-image:
    linear-gradient(#000 0 0),
    linear-gradient(#000 0 0);
  mask-clip: padding-box, border-box;
  mask-composite: exclude;
  -webkit-mask-image:
    linear-gradient(#000 0 0),
    linear-gradient(#000 0 0);
  -webkit-mask-clip: padding-box, border-box;
  -webkit-mask-composite: xor;
  transition: opacity 180ms ease;
}

.preview-item::after {
  /* Glow is masked to the cursor-facing edge so the original card body stays unchanged. */
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background: transparent;
  box-shadow:
    inset 0 0 0 1px hsl(176deg 70% 48% / 100%),
    inset 0 0 3px 0 hsl(176deg 70% 48% / 54%),
    inset 0 0 8px 0 hsl(176deg 70% 48% / 38%),
    inset 0 0 18px 0 hsl(176deg 70% 48% / 26%),
    0 0 3px 0 hsl(176deg 70% 48% / 54%),
    0 0 8px 0 hsl(176deg 70% 48% / 38%),
    0 0 18px 0 hsl(176deg 70% 48% / 28%),
    0 0 38px 4px hsl(176deg 70% 48% / 16%);
  opacity: calc((var(--edge-proximity) - var(--edge-sensitivity)) / (100 - var(--edge-sensitivity)));
  mask-image:
    conic-gradient(
      from var(--cursor-angle) at center,
      black 2.5%,
      transparent 10%,
      transparent 90%,
      black 97.5%
    );
  mix-blend-mode: plus-lighter;
  transition: opacity 180ms ease;
}

.preview-item > * {
  position: relative;
  z-index: 1;
}

.preview-item h2 {
  margin: 0;
  font-size: 26px;
}

.preview-item p:last-child {
  margin: 14px 0 0;
  color: var(--color-muted);
}

@media (max-width: 820px) {
  .home-hero {
    min-height: auto;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
