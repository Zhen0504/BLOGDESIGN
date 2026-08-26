import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const root = process.cwd()

const requiredFiles = [
  'package.json',
  'vite.config.js',
  'index.html',
  'src/main.js',
  'src/App.vue',
  'src/router/index.js',
  'src/data/portfolio.js',
  'src/views/PortfolioView.vue',
  'src/components/layout/PortfolioHeader.vue',
  'src/components/layout/SectionIndicator.vue',
  'src/components/sections/SectionContent.vue',
  'src/components/projects/CompactProjectLink.vue',
  'src/components/effects/ParticleText.vue',
  'src/components/intro/LineWordmark.vue',
  'src/components/intro/LoadingOverlay.vue',
  'src/components/intro/ZhenIntro.vue',
  'src/components/intro/sessionIntro.js',
  'src/components/crystal-scene/CrystalScene.vue',
  'src/components/crystal-scene/createWelcomeCrystalScene.js',
  'src/components/crystal-scene/createCrystalMotionController.js',
  'src/components/crystal-scene/createSectionTransitionController.js',
  'src/components/crystal-scene/createParticleGalaxy.js',
  'src/components/crystal-scene/loadCrystalSystem.js',
  'public/models/crystals/about.glb',
  'public/models/crystals/development.glb',
  'public/models/crystals/research.glb',
  'public/models/crystals/contact.glb',
  'public/models/crystals/center.glb',
  'src/styles/reset.css',
  'src/styles/variables.css',
  'src/styles/global.css',
]

for (const file of requiredFiles) {
  assert.equal(existsSync(resolve(root, file)), true, `${file} should exist`)
}

// First-stage cleanup is intentionally deferred until the new runtime is verified.
for (const preservedFile of [
  'plan.md',
  'develop.md',
  '设计.md',
  'public/blog/home-hero-preview.png',
  'public/images/projects/home-page.png',
]) {
  assert.equal(existsSync(resolve(root, preservedFile)), true, `${preservedFile} should be preserved`)
}

const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
assert.equal(packageJson.scripts.dev, 'vite')
assert.equal(packageJson.scripts.build, 'vite build')
assert.equal(packageJson.dependencies.vue, '^3.5.0')
assert.equal(packageJson.dependencies['vue-router'], '^4.5.0')
assert.equal(packageJson.dependencies.ogl, '^1.0.11')
assert.equal(packageJson.dependencies.three, '0.185.1')
assert.equal(packageJson.dependencies.postprocessing, '6.39.4')
assert.equal(packageJson.dependencies.react, undefined)

const app = readFileSync(resolve(root, 'src/App.vue'), 'utf8')
assert.match(app, /<RouterView \/>/)
assert.doesNotMatch(app, /:key="route\.path"/)

const router = readFileSync(resolve(root, 'src/router/index.js'), 'utf8')
assert.match(router, /createWebHashHistory/)
assert.doesNotMatch(router, /createWebHistory/)
assert.match(router, /PortfolioView/)
assert.match(router, /about\|development\|research\|contact/)

const indexHtml = readFileSync(resolve(root, 'index.html'), 'utf8')
assert.match(indexHtml, /Orbit Archive/)
assert.match(indexHtml, /theme-color/)
assert.doesNotMatch(indexHtml, /Leo Team Blog/)

const variables = readFileSync(resolve(root, 'src/styles/variables.css'), 'utf8')
assert.match(variables, /--color-page:\s*#030512/)
assert.match(variables, /Noto Serif SC/)
assert.match(variables, /Source Han Serif SC/)
assert.match(variables, /Songti SC/)
assert.match(variables, /SimSun/)

const portfolioModuleUrl = pathToFileURL(resolve(root, 'src/data/portfolio.js')).href
const {
  getLatestProjects,
  getSectionBySlug,
  isIsoDate,
  portfolio,
  sectionDefinitions,
} = await import(portfolioModuleUrl)

assert.equal(sectionDefinitions.length, 5)
assert.deepEqual(sectionDefinitions.map((section) => section.id), ['00', '01', '02', '03', '04'])
assert.deepEqual(sectionDefinitions.map((section) => section.slug), [
  '',
  'about',
  'development',
  'research',
  'contact',
])
assert.equal(sectionDefinitions.filter((section) => section.navLabel === 'RESEARCH').length, 1)
assert.equal(getSectionBySlug('about').contentSide, 'left')
assert.equal(getSectionBySlug('development').contentSide, 'right')
assert.equal(getSectionBySlug('research').contentSide, 'left')
assert.equal(getSectionBySlug('contact').contentSide, 'right')
assert.equal(portfolio.contact.github.href, 'https://github.com/Zhen0504')
assert.equal(portfolio.contact.email, null)
assert.equal(isIsoDate('2026-07-26'), true)
assert.equal(isIsoDate('2026-7-26'), false)
assert.equal(isIsoDate('2026-02-30'), false)

const sortedFixtures = getLatestProjects([
  { id: 'middle', date: '2026-05-04' },
  { id: 'oldest', date: '2025-12-01' },
  { id: 'newest', date: '2026-07-26' },
])
assert.deepEqual(sortedFixtures.map((project) => project.id), ['newest', 'middle'])

for (const project of [
  ...portfolio.developmentProjects,
  ...portfolio.researchProjects,
]) {
  assert.equal(isIsoDate(project.date), true, `${project.id} should use an ISO date`)
  assert.equal(typeof project.title, 'string')
  assert.equal(typeof project.label, 'string')
  assert.notEqual(project.href, '#')
}

const sectionContent = readFileSync(
  resolve(root, 'src/components/sections/SectionContent.vue'),
  'utf8',
)
assert.match(sectionContent, /getLatestProjects\(portfolio\.developmentProjects\)/)
assert.match(sectionContent, /getLatestProjects\(portfolio\.researchProjects\)/)
assert.match(sectionContent, /v-if="portfolio\.contact\.email"/)
assert.match(sectionContent, /rel="noopener noreferrer"/)
assert.match(sectionContent, /<ParticleText[\s\S]*text="WELCOME"/)
assert.match(sectionContent, /text="to"/)
assert.match(sectionContent, /text="MY BLOG"/)
assert.match(sectionContent, /aria-label="WELCOME to MY BLOG"/)
assert.match(sectionContent, /text="ABOUT ME"/)
assert.match(sectionContent, /text="DEVELOPMENT"/)
assert.match(sectionContent, /text="RESEARCH"/)
assert.match(sectionContent, /text="CONTACT"/)
assert.match(sectionContent, /A personal space for development, research, and ideas\./)
assert.match(sectionContent, /SCROLL TO EXPLORE/)
assert.match(sectionContent, /aria-label="ABOUT ME"/)
assert.match(sectionContent, /aria-label="DEVELOPMENT"/)
assert.match(sectionContent, /aria-label="RESEARCH"/)
assert.match(sectionContent, /aria-label="CONTACT"/)

const overviewTemplate = sectionContent.match(
  /<template v-if="section\.id === '00'">([\s\S]*?)<\/template>/,
)?.[1] ?? ''
assert.doesNotMatch(overviewTemplate, /[\u3400-\u9fff]/)

const particleText = readFileSync(
  resolve(root, 'src/components/effects/ParticleText.vue'),
  'utf8',
)
assert.match(particleText, /getContext\('2d'/)
assert.match(particleText, /startGather/)
assert.match(particleText, /pointerRepel/)
assert.doesNotMatch(particleText, /from ['"]react['"]/)

const portfolioView = readFileSync(resolve(root, 'src/views/PortfolioView.vue'), 'utf8')
assert.doesNotMatch(portfolioView, /linear-gradient\((?:90|270)deg/)
assert.doesNotMatch(portfolioView, /data-section=['"]02['"]\]\s+\.ambient-background/)
assert.match(portfolioView, /<CrystalScene/)
assert.match(portfolioView, /<ZhenIntro/)
assert.match(portfolioView, /<LoadingOverlay/)
assert.match(portfolioView, /@scene-ready="onSceneReady"/)
assert.match(portfolioView, /@scene-fallback="onSceneFallback"/)
assert.match(portfolioView, /returningSession && !sceneSettled\.value/)
assert.match(portfolioView, /showSessionIntro && !introComplete/)
assert.match(portfolioView, /markSessionIntroSeen\(\)/)
assert.match(portfolioView, /addEventListener\('wheel'/)
assert.match(portfolioView, /transitionLocked/)

const welcomeScene = readFileSync(
  resolve(root, 'src/components/crystal-scene/createWelcomeCrystalScene.js'),
  'utf8',
)
assert.match(welcomeScene, /__WELCOME_CRYSTAL_SCENE__/)
assert.match(welcomeScene, /visibilitychange/)
assert.match(welcomeScene, /forceContextLoss/)

const zhenIntro = readFileSync(
  resolve(root, 'src/components/intro/ZhenIntro.vue'),
  'utf8',
)
assert.match(zhenIntro, /aria-label="ZHEN — loading portfolio"/)
assert.match(zhenIntro, /<LineWordmark/)
assert.match(zhenIntro, /word="ZHEN"/)
assert.match(zhenIntro, /sceneReady/)
assert.doesNotMatch(zhenIntro, /feGaussianBlur/)
assert.doesNotMatch(zhenIntro, /drop-shadow/)
assert.doesNotMatch(zhenIntro, /from ['"]react['"]/)

const lineWordmark = readFileSync(
  resolve(root, 'src/components/intro/LineWordmark.vue'),
  'utf8',
)
assert.match(lineWordmark, /value === 'ZHEN' \|\| value === 'LOADING'/)
assert.match(lineWordmark, /pathLength="360"/)
assert.match(lineWordmark, /line-wordmark-dash-array/)
assert.match(lineWordmark, /line-wordmark-dash-offset/)
assert.match(lineWordmark, /prefers-reduced-motion/)
assert.doesNotMatch(lineWordmark, /from ['"]react['"]/)

const loadingOverlay = readFileSync(
  resolve(root, 'src/components/intro/LoadingOverlay.vue'),
  'utf8',
)
assert.match(loadingOverlay, /word="LOADING"/)
assert.match(loadingOverlay, /NETWORK CONDITIONS MAY DELAY THE EXPERIENCE\./)
assert.match(loadingOverlay, /const SHOW_DELAY = 300/)
assert.match(loadingOverlay, /const MIN_VISIBLE = 500/)
assert.match(loadingOverlay, /const EXIT_CAP = 700/)
assert.match(loadingOverlay, /const FADE_DURATION = 400/)
assert.match(loadingOverlay, /const HARD_TIMEOUT = 10000/)
assert.match(loadingOverlay, /backdrop-filter/)
assert.doesNotMatch(loadingOverlay, /from ['"]react['"]/)

const sessionIntroModuleUrl = pathToFileURL(resolve(
  root,
  'src/components/intro/sessionIntro.js',
)).href
const {
  INTRO_SESSION_KEY,
  hasSeenSessionIntro,
  markSessionIntroSeen,
} = await import(sessionIntroModuleUrl)
const sessionEntries = new Map()
const fakeSessionStorage = {
  getItem: (key) => sessionEntries.get(key) ?? null,
  setItem: (key, value) => sessionEntries.set(key, value),
}
assert.equal(hasSeenSessionIntro(fakeSessionStorage), false)
assert.equal(markSessionIntroSeen(fakeSessionStorage), true)
assert.equal(sessionEntries.get(INTRO_SESSION_KEY), '1')
assert.equal(hasSeenSessionIntro(fakeSessionStorage), true)
assert.equal(hasSeenSessionIntro({ getItem: () => { throw new Error('blocked') } }), false)
assert.equal(markSessionIntroSeen({ setItem: () => { throw new Error('blocked') } }), false)

const particleGalaxy = readFileSync(
  resolve(root, 'src/components/crystal-scene/createParticleGalaxy.js'),
  'utf8',
)
assert.doesNotMatch(particleGalaxy, /LineBasicMaterial/)
assert.doesNotMatch(particleGalaxy, /createFilament/)
assert.match(particleGalaxy, /createOverviewSparkles/)
assert.match(particleGalaxy, /setSection\(sectionId/)

const crystalManifest = readFileSync(
  resolve(root, 'src/components/crystal-scene/crystalManifest.js'),
  'utf8',
)
assert.doesNotMatch(crystalManifest, /https?:\/\//)

const compactProjectLink = readFileSync(
  resolve(root, 'src/components/projects/CompactProjectLink.vue'),
  'utf8',
)
assert.match(compactProjectLink, /v-if="project\.href"/)
assert.match(compactProjectLink, /aria-disabled="true"/)
assert.doesNotMatch(compactProjectLink, /href="#"/)

console.log('Portfolio structure checks passed.')
