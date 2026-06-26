import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()

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

const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
assert.equal(packageJson.scripts.dev, 'vite')
assert.equal(packageJson.scripts.build, 'vite build')

const viteConfig = readFileSync(resolve(root, 'vite.config.js'), 'utf8')
assert.match(viteConfig, /@vitejs\/plugin-vue/)
assert.match(viteConfig, /vue\(\)/)

const app = readFileSync(resolve(root, 'src/App.vue'), 'utf8')
assert.match(app, /<SiteHeader \/>/)
assert.match(app, /<RouterView \/>/)
assert.match(app, /<SiteFooter \/>/)

const router = readFileSync(resolve(root, 'src/router/index.js'), 'utf8')
assert.match(router, /createRouter/)
assert.match(router, /HomeView/)
assert.match(router, /BlogListView/)

const homeView = readFileSync(resolve(root, 'src/views/HomeView.vue'), 'utf8')
assert.match(homeView, /<HeroSection \/>/)

const heroSection = readFileSync(resolve(root, 'src/components/home/HeroSection.vue'), 'utf8')
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
assert.match(heroSection, /@contextmenu\.prevent/)
assert.match(heroSection, /右键关闭\/打开黑球/)

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
assert.match(particleBackground, /requestAnimationFrame/)
assert.match(particleBackground, /prefers-reduced-motion/)
assert.match(particleBackground, /matchMedia/)
