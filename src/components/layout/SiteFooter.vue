<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <p class="footer-brand">Leo Team Blog</p>
      <p class="footer-copy">记录技术学习、项目实践、团队协作与成长思考。</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

.footer-inner {
  width: min(100%, var(--container-width));
  margin: 0 auto;
  padding: 28px var(--space-page-x);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.footer-brand,
.footer-copy {
  margin: 0;
}

.footer-brand {
  font-weight: 900;
}

.footer-copy {
  color: var(--color-subtle);
  font-size: 14px;
}

@media (max-width: 680px) {
  .footer-inner {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
