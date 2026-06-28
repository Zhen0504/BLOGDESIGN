import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()

// Keep this list focused on files that define the public app structure.
const files = [
  'package.json',
  'vite.config.js',
  'index.html',
  'src/main.js',
  'src/App.vue',
  'src/router/index.js',
  'src/styles/reset.css',
  'src/styles/variables.css',
  'src/styles/global.css',
  'src/components/layout/SiteHeader.vue',
  'src/components/layout/SiteFooter.vue',
  'src/components/home/HeroSection.vue',
  'src/components/home/ParticleBackground.vue',
  'src/views/HomeView.vue',
  'src/views/BlogListView.vue',
  'src/views/ProjectsView.vue',
  'src/views/TeamView.vue',
  'src/views/AboutView.vue',
]

for (const file of files) {
  assert.equal(existsSync(resolve(root, file)), true, `${file} should exist`)
}

// Package assertions catch accidental removal of required scripts/dependencies.
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
assert.equal(packageJson.scripts.dev, 'vite')
assert.equal(packageJson.scripts.build, 'vite build')
assert.equal(packageJson.dependencies.ogl, '^1.0.11')

const viteConfig = readFileSync(resolve(root, 'vite.config.js'), 'utf8')
assert.match(viteConfig, /@vitejs\/plugin-vue/)
assert.match(viteConfig, /vue\(\)/)

const app = readFileSync(resolve(root, 'src/App.vue'), 'utf8')
// Shell assertions protect the persistent header/footer layout.
assert.match(app, /<SiteHeader @open-contact="openGlobalContact" \/>/)
assert.match(app, /<RouterView v-slot/)
assert.match(app, /<Transition name="page-transition" mode="out-in" appear>/)
assert.match(app, /<SiteFooter \/>/)
assert.match(app, /isGlobalContactOpen/)
assert.match(app, /class="global-contact-dialog"/)
assert.match(app, /暂未开放 \/ Coming soon/)

const siteHeader = readFileSync(resolve(root, 'src/components/layout/SiteHeader.vue'), 'utf8')
// Header contact is an app-level action so it works from every route.
assert.match(siteHeader, /defineEmits\(\['open-contact'\]\)/)
assert.match(siteHeader, /<button class="contact-link" type="button" @click="emit\('open-contact'\)">联系我们<\/button>/)
assert.doesNotMatch(siteHeader, /<RouterLink class="contact-link" to="\/about">联系我们<\/RouterLink>/)

const router = readFileSync(resolve(root, 'src/router/index.js'), 'utf8')
assert.match(router, /createRouter/)
assert.match(router, /HomeView/)
assert.match(router, /BlogListView/)
assert.match(router, /scrollBehavior/)
assert.match(router, /behavior:\s*'smooth'/)
assert.match(router, /return \{ top: 0 \}/)

const homeView = readFileSync(resolve(root, 'src/views/HomeView.vue'), 'utf8')
assert.match(homeView, /<HeroSection \/>/)
assert.match(homeView, /class="home-page"/)

const aboutView = readFileSync(resolve(root, 'src/views/AboutView.vue'), 'utf8')
// About assertions protect the richer page structure and the 3D identity card.
assert.match(aboutView, /关于 Leo Team Blog/)
assert.match(aboutView, /一个记录技术学习、课程实践与项目复盘的博客空间/)
assert.match(aboutView, /class="page-section about-hero"/)
assert.match(aboutView, /class="about-button about-button-primary" to="\/blog"/)
assert.match(aboutView, /class="about-button about-button-secondary" to="\/projects"/)
assert.match(aboutView, /class="identity-card-parent"/)
assert.match(aboutView, /class="identity-card-background"/)
assert.match(aboutView, /<strong>Blog<\/strong>/)
assert.match(aboutView, /class="identity-box identity-box-1" to="\/blog"/)
assert.match(aboutView, /class="identity-box identity-box-2" to="\/projects"/)
assert.match(aboutView, /class="identity-box identity-box-3"/)
assert.match(aboutView, /\.identity-card-parent:hover \.identity-box/)
assert.doesNotMatch(aboutView, /identity-icon-hitbox/)
assert.match(aboutView, /Build \/ Learn \/ Review/)
assert.doesNotMatch(aboutView, /identity-card-glass/)
assert.match(aboutView, /我们记录什么/)
assert.match(aboutView, /class="topic-strip"/)
assert.match(aboutView, /class="topic-card-inner"/)
assert.match(aboutView, /class="topic-face topic-face-front"/)
assert.match(aboutView, /class="topic-face topic-face-back"/)
assert.match(aboutView, /@keyframes topicCardShine/)
assert.match(aboutView, /技术笔记/)
assert.match(aboutView, /项目复盘/)
assert.match(aboutView, /团队协作/)
assert.match(aboutView, /成长记录/)
assert.match(aboutView, /学习过程如何沉淀/)
assert.match(aboutView, /class="process-river"/)
assert.match(aboutView, /class="process-river-line"/)
assert.match(aboutView, /@keyframes processLineFlow/)
assert.doesNotMatch(aboutView, /processRiverGradient/)
assert.doesNotMatch(aboutView, /marker-end="url\(#processArrow\)"/)
assert.match(aboutView, /发现问题/)
assert.match(aboutView, /动手实践/)
assert.match(aboutView, /记录过程/)
assert.match(aboutView, /总结复盘/)
assert.match(aboutView, /形成文章/)
assert.match(aboutView, /后续计划/)
assert.match(aboutView, /class="page-container roadmap-layout"/)
assert.match(aboutView, /class="roadmap-list"/)
assert.match(aboutView, /Building/)
assert.match(aboutView, /Planned/)
assert.match(aboutView, /完善文章分类/)
assert.match(aboutView, /补充项目展示/)
assert.match(aboutView, /优化团队介绍/)
assert.match(aboutView, /建立学习路线/)
assert.match(aboutView, /openContactDialog/)
assert.match(aboutView, /contact-dialog/)
assert.match(aboutView, /暂未开放 \/ Coming soon/)
assert.match(aboutView, /建设中/)
assert.match(aboutView, /交流方式/)
assert.match(aboutView, /后续开放/)
assert.match(aboutView, /recordTopics/)
assert.match(aboutView, /processSteps/)
assert.match(aboutView, /futurePlans/)
assert.match(aboutView, /contactItems/)
assert.match(aboutView, /@media \(max-width: 780px\)/)
assert.match(aboutView, /\.process-river/)
assert.doesNotMatch(aboutView, /svg-qq/)

const heroSection = readFileSync(resolve(root, 'src/components/home/HeroSection.vue'), 'utf8')
// Hero assertions guard the custom interactive title/orb behavior.
assert.match(heroSection, /HELLO, WELCOME TO OUR BLOG/)
assert.match(heroSection, /欢迎来到我们的博客/)
assert.match(heroSection, /ParticleBackground/)
assert.match(heroSection, /isFinePointer/)
assert.match(heroSection, /maskPosition/)
assert.match(heroSection, /cursorOrbStyle/)
assert.match(heroSection, /maskTextStyle/)
assert.match(heroSection, /titleRef/)
assert.match(heroSection, /cursor-orb/)
assert.match(heroSection, /titleTransform/)
assert.match(heroSection, /perspective/)
assert.match(heroSection, /rotateX/)
assert.match(heroSection, /rotateY/)
assert.match(heroSection, /orbEnabled/)
assert.match(heroSection, /handleContextMenu/)
assert.match(heroSection, /handleScrollIndicatorClick/)
assert.match(heroSection, /@contextmenu\.prevent/)
assert.match(heroSection, /scrollIntoView/)
assert.match(heroSection, /右键关闭\/打开光球/)

assert.match(heroSection, /<div ref="titleRef"[\s\S]*<div class="cursor-orb"/)
assert.match(heroSection, /overflow: visible/)
assert.match(heroSection, /transition:\s*opacity 160ms ease/)
assert.match(heroSection, /transition:\s*opacity 180ms ease/)
assert.match(heroSection, /\.hero-kicker,[\s\S]*\.hero-copy,[\s\S]*\.hero-actions,[\s\S]*\.orb-hint/)
assert.match(heroSection, /z-index: 4/)
assert.match(heroSection, /z-index: 5/)

const particleBackground = readFileSync(
  resolve(root, 'src/components/home/ParticleBackground.vue'),
  'utf8',
)
// Particle assertions guard the OGL background and hover/parallax wiring.
assert.match(particleBackground, /requestAnimationFrame/)
assert.match(particleBackground, /prefers-reduced-motion/)
assert.match(particleBackground, /matchMedia/)
assert.match(particleBackground, /from 'ogl'/)
assert.match(particleBackground, /particleColors/)
assert.match(particleBackground, /#20d6c7/)
assert.match(particleBackground, /pointer-events: none/)
assert.match(particleBackground, /targetParallaxX/)
assert.match(particleBackground, /translate3d\(\$\{parallaxX\}px, \$\{parallaxY\}px, 0\)/)

const variables = readFileSync(resolve(root, 'src/styles/variables.css'), 'utf8')
// Theme assertions keep the dark blog palette stable across future edits.
assert.match(variables, /--color-page:\s*#0f0d14/)
assert.match(variables, /--color-text:\s*#f7f7fb/)
assert.match(variables, /--color-accent:\s*#20d6c7/)

const globalStyles = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8')
assert.match(globalStyles, /\.info-layout/)
assert.match(globalStyles, /\.info-columns/)
assert.doesNotMatch(globalStyles, /\.placeholder-card/)
