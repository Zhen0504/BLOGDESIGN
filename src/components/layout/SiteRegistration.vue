<template>
  <footer class="site-registration">
    <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">湘ICP备2026045349号-1</a>
  </footer>
</template>

<style scoped>
.site-registration {
  position: fixed;
  inset: auto 0 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  padding: 6px 12px calc(6px + env(safe-area-inset-bottom));
  pointer-events: none;
}
.site-registration a {
  pointer-events: auto;
  padding: 2px 10px;
  border-radius: 4px;
  color: #b8b2cd;
  background: rgba(3, 5, 18, .86);
  font: 12px/1.6 var(--font-ui);
  text-decoration: none;
}
.site-registration a:hover { color: #eee7ff; text-decoration: underline; }
</style>
