<script setup>
import { computed } from 'vue'

const props = defineProps({
  word: {
    type: String,
    required: true,
    validator: (value) => value === 'ZHEN' || value === 'LOADING',
  },
  animation: {
    type: String,
    default: 'once',
    validator: (value) => ['once', 'loop', 'static'].includes(value),
  },
})

const glyphPaths = {
  Z: 'M 10 11 H 54 L 10 53 H 54',
  H: 'M 10 8 V 56 M 54 8 V 56 M 10 32 H 54',
  E: 'M 54 10 H 10 V 54 H 54 M 10 32 H 47',
  N: 'M 10 56 V 8 L 54 56 V 8',
  L: 'M 10 8 V 54 H 54',
  O: 'M 32 8 C 18 8 10 18 10 32 C 10 46 18 56 32 56 C 46 56 54 46 54 32 C 54 18 46 8 32 8 Z',
  A: 'M 8 56 L 32 8 L 56 56 M 16 40 H 48',
  D: 'M 10 8 V 56 H 29 C 46 56 54 47 54 32 C 54 17 46 8 29 8 H 10',
  I: 'M 16 8 H 48 M 32 8 V 56 M 16 56 H 48',
  G: 'M 54 20 C 49 12 42 8 32 8 C 18 8 10 18 10 32 C 10 46 18 56 32 56 C 43 56 50 51 54 43 V 34 H 34',
}

const palettes = [
  ['#9a70ff', '#4d77ff'],
  ['#d8d1ff', '#7959ff'],
  ['#72d8ff', '#6b55ff'],
  ['#efbd67', '#8d64ff'],
  ['#7d6cff', '#79c7ff'],
  ['#d4ccff', '#7560ff'],
  ['#d6a45c', '#856aff'],
]

let instanceSequence = 0
const gradientPrefix = `line-wordmark-${++instanceSequence}`
const glyphs = computed(() => [...props.word].map((letter, index) => ({
  letter,
  path: glyphPaths[letter],
  colors: palettes[index % palettes.length],
  gradientId: `${gradientPrefix}-${index}`,
  delay: `${index * (props.animation === 'loop' ? 68 : 90)}ms`,
})))
</script>

<template>
  <span class="line-wordmark" :data-animation="animation" :data-word="word" aria-hidden="true">
    <svg
      v-for="glyph in glyphs"
      :key="`${glyph.letter}-${glyph.gradientId}`"
      class="line-wordmark__glyph"
      viewBox="0 0 64 64"
    >
      <defs>
        <linearGradient
          :id="glyph.gradientId"
          x1="8"
          y1="8"
          x2="56"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop :stop-color="glyph.colors[0]" />
          <stop offset="1" :stop-color="glyph.colors[1]" />
        </linearGradient>
      </defs>
      <path
        class="line-wordmark__dash"
        :style="{ '--line-delay': glyph.delay }"
        :d="glyph.path"
        pathLength="360"
        :stroke="`url(#${glyph.gradientId})`"
      />
    </svg>
  </span>
</template>

<style scoped>
.line-wordmark {
  display: flex;
  gap: clamp(5px, 0.7vw, 11px);
  align-items: center;
  justify-content: center;
}

.line-wordmark__glyph {
  display: block;
  flex: 1 1 0;
  min-width: 0;
  overflow: visible;
}

.line-wordmark__dash {
  fill: none;
  stroke-width: 5.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 0 1 359 0;
  stroke-dashoffset: 365;
}

.line-wordmark[data-animation='once'] .line-wordmark__dash {
  animation:
    line-wordmark-dash-array 2.5s ease-in-out var(--line-delay) both,
    line-wordmark-dash-offset 2.5s linear var(--line-delay) both;
}

.line-wordmark[data-animation='loop'] .line-wordmark__dash {
  stroke-dasharray: 0 360;
  stroke-dashoffset: 0;
  opacity: 0;
  animation: line-wordmark-loading-draw 1.85s ease-in-out var(--line-delay) infinite both;
}

@keyframes line-wordmark-loading-draw {
  0%, 10% { stroke-dasharray: 0 360; opacity: 0; }
  18% { opacity: 1; }
  70%, 82% { stroke-dasharray: 360 0; opacity: 1; }
  100% { stroke-dasharray: 0 360; opacity: 0; }
}

.line-wordmark[data-animation='static'] .line-wordmark__dash {
  stroke-dasharray: 359 1 0 0;
  stroke-dashoffset: 5;
}

@keyframes line-wordmark-dash-array {
  0% { stroke-dasharray: 0 1 359 0; }
  50% { stroke-dasharray: 0 359 1 0; }
  100% { stroke-dasharray: 359 1 0 0; }
}

@keyframes line-wordmark-dash-offset {
  from { stroke-dashoffset: 365; }
  to { stroke-dashoffset: 5; }
}

@media (prefers-reduced-motion: reduce) {
  .line-wordmark__dash {
    animation: none !important;
    opacity: 1 !important;
    stroke-dasharray: 359 1 0 0 !important;
    stroke-dashoffset: 5 !important;
  }
}
</style>
