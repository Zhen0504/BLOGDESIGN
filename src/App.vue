<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import SiteFooter from './components/layout/SiteFooter.vue'
import SiteHeader from './components/layout/SiteHeader.vue'

// Global contact modal is triggered by the fixed header, so it must live above routed pages.
const isGlobalContactOpen = ref(false)

const contactItems = [
  {
    label: '邮箱',
    value: '暂未开放 / Coming soon',
    text: '课程合作、文章投稿和项目交流入口后续补充。',
  },
  {
    label: 'GitHub',
    value: '建设中',
    text: '项目仓库整理完成后会在这里放出统一入口。',
  },
  {
    label: '交流方式',
    value: '后续开放',
    text: '团队协作方式和公开交流渠道会随页面继续完善。',
  },
]

const openGlobalContact = () => {
  isGlobalContactOpen.value = true
}

const closeGlobalContact = () => {
  isGlobalContactOpen.value = false
}
</script>

<template>
  <!-- Shared shell keeps header/footer stable while RouterView swaps page content. -->
  <div class="app-shell">
    <SiteHeader @open-contact="openGlobalContact" />
    <main class="app-main">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page-transition" mode="out-in" appear>
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>
    <SiteFooter />

    <!-- Header contact button uses this global dialog, so it works from every route. -->
    <Teleport to="body">
      <div v-if="isGlobalContactOpen" class="global-contact-backdrop" @click.self="closeGlobalContact">
        <section class="global-contact-dialog" role="dialog" aria-modal="true" aria-labelledby="global-contact-title">
          <button class="global-contact-close" type="button" aria-label="关闭联系方式弹窗" @click="closeGlobalContact">
            ×
          </button>
          <p class="global-contact-eyebrow">Contact</p>
          <h2 id="global-contact-title">联系方式</h2>
          <div class="global-contact-list">
            <article v-for="item in contactItems" :key="item.label" class="global-contact-item">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <p>{{ item.text }}</p>
            </article>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<style>
.page-transition-enter-active,
.page-transition-leave-active {
  transition:
    opacity 340ms ease,
    transform 340ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: opacity, transform;
}

.page-transition-enter-from {
  opacity: 0;
  transform: translate3d(0, 24px, 0) scale(0.985);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translate3d(0, -14px, 0) scale(0.995);
}

@media (prefers-reduced-motion: reduce) {
  .page-transition-enter-active,
  .page-transition-leave-active {
    transition: none;
  }
}

.global-contact-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 13, 20, 0.58);
  backdrop-filter: blur(9px);
}

.global-contact-dialog {
  position: relative;
  width: min(540px, 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 32px;
  background:
    radial-gradient(circle at 18% 0%, rgba(32, 214, 199, 0.1), transparent 34%),
    rgba(23, 20, 31, 0.96);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.34);
}

.global-contact-close {
  position: absolute;
  top: 16px;
  right: 16px;
  display: grid;
  width: 36px;
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.055);
  color: #f7f7fb;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.global-contact-close:hover {
  background: rgba(255, 255, 255, 0.16);
  color: var(--color-accent);
  transform: scale(1.06);
}

.global-contact-eyebrow {
  margin: 0 0 10px;
  color: var(--color-accent);
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
}

.global-contact-dialog h2 {
  margin: 0 0 24px;
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.1;
}

.global-contact-list {
  display: grid;
  gap: 16px;
}

.global-contact-item {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-sm);
  padding: 18px;
  background: rgba(255, 255, 255, 0.04);
}

.global-contact-item span {
  display: block;
  color: var(--color-accent);
  font-size: 13px;
  font-weight: 800;
}

.global-contact-item strong {
  display: block;
  margin-top: 6px;
  color: #f7f7fb;
  font-size: 17px;
}

.global-contact-item p {
  margin: 10px 0 0;
  color: var(--color-muted);
  font-size: 14px;
}
</style>
