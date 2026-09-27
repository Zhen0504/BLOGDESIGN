<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import ParticleSmile from './ParticleSmile.vue'

const message = ref('')
const focused = ref(false)
const inboxOpen = ref(false)
const inboxButton = ref(null)
const inboxPanel = ref(null)
const remaining = computed(() => 1000 - message.value.length)

function toggleInbox() {
  inboxOpen.value = !inboxOpen.value
  if (inboxOpen.value) nextTick(() => inboxPanel.value?.focus())
  else nextTick(() => inboxButton.value?.focus())
}
function closeOnEscape(event) {
  if (event.key === 'Escape' && inboxOpen.value) toggleInbox()
}
document.addEventListener('keydown', closeOnEscape)
onBeforeUnmount(() => document.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <section class="suggestion" aria-labelledby="suggestion-title">
    <div class="suggestion__header">
      <div>
        <p class="suggestion__eyebrow">OPEN CHANNEL / 02</p>
        <h2 id="suggestion-title">有什么想法，想告诉我？</h2>
        <p class="suggestion__intro">可以先把想法留在这里。建议功能开放后，我会把它们认真读完。</p>
      </div>
      <div class="suggestion__inbox-wrap">
        <button ref="inboxButton" type="button" class="suggestion__inbox-button" :aria-expanded="inboxOpen" aria-controls="public-inbox" @click="toggleInbox">
          <span class="suggestion__envelope" aria-hidden="true">✉</span>
          <span>公开建议</span>
        </button>
        <div v-if="inboxOpen" id="public-inbox" ref="inboxPanel" class="suggestion__inbox-panel" tabindex="-1">
          <p class="suggestion__panel-label">PUBLIC INBOX</p>
          <strong>暂无公开建议</strong>
          <p>审核公开功能尚未开放，之后这里只会显示已审核的建议、日期和管理员回复。</p>
          <button type="button" class="suggestion__close" @click="toggleInbox">关闭</button>
        </div>
      </div>
    </div>
    <div class="suggestion__body">
      <form class="suggestion__form" @submit.prevent>
        <label for="suggestion-message">你的建议</label>
        <textarea id="suggestion-message" v-model="message" maxlength="1000" placeholder="写下一个想法、问题，或对这个小站的观察……" @focus="focused = true" @blur="focused = false"></textarea>
        <div class="suggestion__meta"><span>请不要提交手机号、邮箱或其他敏感个人资料。</span><span>{{ remaining }} / 1000</span></div>
        <button type="submit" disabled>建议功能即将开放</button>
      </form>
      <div class="suggestion__smile-wrap"><ParticleSmile :focused="focused" :typing="message.length > 0" /></div>
    </div>
  </section>
</template>

<style scoped>
.suggestion { margin-top: 26px; padding: 25px; border: 1px solid rgba(190, 179, 242, 0.18); background: rgba(8, 10, 29, 0.78); }
.suggestion__header { display: flex; justify-content: space-between; gap: 25px; }
.suggestion__eyebrow, .suggestion__panel-label { margin: 0; color: var(--color-gold); font: 9px var(--font-ui); letter-spacing: 0.18em; }
.suggestion h2 { margin: 15px 0 9px; color: var(--color-text); font: 400 24px/1.35 var(--font-serif-cn); }
.suggestion__intro { max-width: 400px; margin: 0; color: var(--color-muted); font: 14px/1.8 var(--font-serif-cn); }
.suggestion__inbox-wrap { position: relative; flex: 0 0 auto; }
.suggestion__inbox-button, .suggestion__close { border: 1px solid rgba(207, 195, 247, 0.32); background: transparent; color: rgba(235, 230, 250, 0.86); cursor: pointer; font: 10px var(--font-ui); letter-spacing: 0.08em; }
.suggestion__inbox-button { display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; }
.suggestion__inbox-button:hover, .suggestion__inbox-button:focus-visible { border-color: var(--color-gold); color: var(--color-gold); }
.suggestion__envelope { font-size: 15px; line-height: 1; }
.suggestion__inbox-panel { position: absolute; top: 47px; right: 0; z-index: 3; width: min(270px, calc(100vw - 80px)); padding: 16px; border: 1px solid rgba(190, 179, 242, 0.27); background: #080a1d; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28); }
.suggestion__inbox-panel strong { display: block; margin: 14px 0 7px; color: var(--color-text); font: 400 16px var(--font-serif-cn); }
.suggestion__inbox-panel p:not(.suggestion__panel-label) { margin: 0 0 13px; color: var(--color-muted); font: 12px/1.75 var(--font-serif-cn); }
.suggestion__close { padding: 7px 10px; }
.suggestion__body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(190px, 0.65fr); gap: 20px; margin-top: 30px; }
.suggestion__form { min-width: 0; }
.suggestion__form label { display: block; margin-bottom: 10px; color: rgba(232, 227, 249, 0.8); font: 11px var(--font-ui); letter-spacing: 0.1em; }
.suggestion textarea { display: block; width: 100%; min-height: 158px; resize: vertical; box-sizing: border-box; border: 1px solid rgba(190, 179, 242, 0.18); outline: none; padding: 13px; background: rgba(3, 5, 18, 0.62); color: var(--color-text); font: 14px/1.8 var(--font-serif-cn); }
.suggestion textarea:focus { border-color: rgba(169, 148, 255, 0.75); box-shadow: 0 0 0 3px rgba(169, 148, 255, 0.08); }
.suggestion textarea::placeholder { color: var(--color-subtle); }
.suggestion__meta { display: flex; justify-content: space-between; gap: 12px; margin: 9px 0 15px; color: var(--color-subtle); font: 10px/1.6 var(--font-ui); }
.suggestion__meta span:last-child { flex: 0 0 auto; color: rgba(200, 189, 242, 0.68); }
.suggestion form button[type='submit'] { width: 100%; padding: 11px; border: 1px solid rgba(190, 179, 242, 0.12); background: rgba(160, 147, 219, 0.1); color: var(--color-subtle); font: 10px var(--font-ui); letter-spacing: 0.12em; cursor: not-allowed; }
.suggestion__smile-wrap { min-width: 0; min-height: 210px; border-left: 1px solid rgba(190, 179, 242, 0.12); }
@media (max-width: 650px) {
  .suggestion { padding: 19px; }
  .suggestion__header { display: block; }
  .suggestion__inbox-wrap { margin-top: 19px; }
  .suggestion__inbox-panel { left: 0; right: auto; }
  .suggestion__body { grid-template-columns: 1fr; }
  .suggestion__smile-wrap { border-top: 1px solid rgba(190, 179, 242, 0.12); border-left: 0; }
  .suggestion__meta { align-items: flex-start; flex-direction: column; }
}
@media (prefers-reduced-motion: reduce) { .suggestion textarea { transition: none; } }
</style>
