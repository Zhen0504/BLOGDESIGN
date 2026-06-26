<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import ParticleBackground from './ParticleBackground.vue'

const isFinePointer = ref(false)
const orbEnabled = ref(true)
const pointer = reactive({
  x: 0,
  y: 0,
  localX: 0,
  localY: 0,
  titleX: 0,
  titleY: 0,
  active: false,
})

const heroRef = ref(null)
const titleRef = ref(null)

const titleTransform = computed(() => {
  if (!isFinePointer.value || !pointer.active) {
    return 'perspective(900px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)'
  }

  const rotateX = pointer.y * -10
  const rotateY = pointer.x * 13
  const translateX = pointer.x * 14
  const translateY = pointer.y * 11

  return `perspective(820px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${translateX}px, ${translateY}px, 24px)`
})

const maskPosition = computed(() => {
  if (!pointer.active) {
    return '50% 50%'
  }

  return `${pointer.titleX}px ${pointer.titleY}px`
})

const maskTextStyle = computed(() => {
  const isVisible = orbEnabled.value && isFinePointer.value && pointer.active

  return {
    opacity: isVisible ? 1 : 0,
    clipPath: `circle(${isVisible ? 102 : 0}px at ${maskPosition.value})`,
  }
})

const cursorOrbStyle = computed(() => {
  return {
    opacity: orbEnabled.value && isFinePointer.value && pointer.active ? 1 : 0,
    transform: `translate3d(${pointer.titleX}px, ${pointer.titleY}px, 12px) translate(-50%, -50%)`,
  }
})

function handlePointerMove(event) {
  if (!heroRef.value || !isFinePointer.value) return

  const rect = heroRef.value.getBoundingClientRect()
  const titleRect = titleRef.value?.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
  pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
  pointer.localX = event.clientX - rect.left
  pointer.localY = event.clientY - rect.top
  pointer.titleX = titleRect ? event.clientX - titleRect.left : 0
  pointer.titleY = titleRect ? event.clientY - titleRect.top : 0
  pointer.active = true
}

function handlePointerLeave() {
  pointer.x = 0
  pointer.y = 0
  pointer.localX = 0
  pointer.localY = 0
  pointer.titleX = 0
  pointer.titleY = 0
  pointer.active = false
}

function handleContextMenu() {
  if (!isFinePointer.value) return

  orbEnabled.value = !orbEnabled.value
  if (!orbEnabled.value) {
    handlePointerLeave()
  }
}

onMounted(() => {
  isFinePointer.value = window.matchMedia('(pointer: fine)').matches
})

onBeforeUnmount(() => {
  handlePointerLeave()
})
</script>

<template>
  <section
    ref="heroRef"
    class="hero-section"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
    @contextmenu.prevent="handleContextMenu"
  >
    <ParticleBackground />

    <div class="hero-content">
      <p class="hero-kicker">Leo Team Blog / Now Writing</p>

      <div ref="titleRef" class="hero-title-wrap" :style="{ transform: titleTransform }">
        <div class="cursor-orb" :style="cursorOrbStyle" aria-hidden="true"></div>
        <h1 class="hero-title hero-title-base">HELLO, WELCOME TO OUR BLOG</h1>
        <h1
          class="hero-title hero-title-mask"
          :style="maskTextStyle"
          aria-hidden="true"
        >
          欢迎来到我们的博客
        </h1>
      </div>

      <p class="hero-copy">
        记录技术学习、项目实践、团队协作与成长思考，用清晰的文章和项目复盘留下每一次进步。
      </p>

      <div class="hero-actions">
        <RouterLink class="button button-primary" to="/blog">查看文章</RouterLink>
        <RouterLink class="button button-secondary" to="/team">了解团队</RouterLink>
      </div>
    </div>

    <div class="scroll-control">
      <a class="scroll-indicator" href="#home-preview" aria-label="向下浏览">
        <span></span>
      </a>
      <p class="orb-hint">右键关闭/打开黑球</p>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 96px var(--space-page-x) 84px;
  background:
    radial-gradient(circle at 50% 42%, rgb(20 184 166 / 10%), transparent 24%),
    #ffffff;
}

.hero-content {
  position: relative;
  z-index: 3;
  width: min(100%, var(--container-width));
  margin: 0 auto;
  text-align: center;
}

.cursor-orb {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  width: 212px;
  height: 212px;
  border-radius: 50%;
  background: #111111;
  box-shadow: 0 22px 58px rgb(15 23 42 / 18%);
  pointer-events: none;
  transition: opacity 180ms ease;
  will-change: transform, opacity;
}

.hero-kicker {
  margin: 0 0 22px;
  color: var(--color-accent);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.hero-title-wrap {
  position: relative;
  z-index: 1;
  overflow: visible;
  transform-style: preserve-3d;
  transform-origin: center center;
  transition: transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
}

.hero-title {
  max-width: 1120px;
  margin: 0 auto;
  font-size: clamp(48px, 8vw, 116px);
  font-weight: 900;
  line-height: 0.94;
  letter-spacing: 0;
}

.hero-title-base {
  position: relative;
  z-index: 1;
  color: var(--color-text);
  transform: translateZ(24px);
}

.hero-title-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  color: #ffffff;
  filter: drop-shadow(0 18px 36px rgb(15 23 42 / 16%));
  pointer-events: none;
  transform: translateZ(28px);
  transition: opacity 160ms ease;
}

.hero-copy {
  position: relative;
  z-index: 4;
  max-width: 760px;
  margin: 28px auto 0;
  color: var(--color-muted);
  font-size: 17px;
  line-height: 1.85;
}

.hero-actions {
  position: relative;
  z-index: 4;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.scroll-control {
  position: absolute;
  left: 50%;
  bottom: 26px;
  z-index: 5;
  display: grid;
  justify-items: center;
  gap: 8px;
  transform: translateX(-50%);
}

.scroll-indicator {
  width: 28px;
  height: 44px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: rgb(255 255 255 / 78%);
}

.scroll-indicator span {
  position: absolute;
  left: 50%;
  top: 10px;
  width: 4px;
  height: 8px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: var(--color-text);
}

.hero-kicker,
.hero-copy,
.hero-actions,
.orb-hint {
  position: relative;
  z-index: 4;
}

.orb-hint {
  margin: 0;
  color: var(--color-subtle);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

@media (max-width: 760px), (pointer: coarse) {
  .hero-section {
    min-height: auto;
    padding-top: 82px;
  }

  .hero-content {
    text-align: left;
  }

  .hero-title {
    margin: 0;
    font-size: clamp(46px, 15vw, 76px);
    line-height: 0.98;
  }

  .hero-title-mask {
    display: none;
  }

  .cursor-orb {
    display: none;
  }

  .orb-hint {
    display: none;
  }

  .hero-actions {
    justify-content: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-title-wrap,
  .hero-title-mask,
  .cursor-orb {
    transition: none;
  }
}
</style>
