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
assert.match(sectionContent, /<span>Orbit<\/span>[\s\S]*<span>Archive\.<\/span>/)
assert.match(sectionContent, /个人简介/)
assert.match(sectionContent, /开发项目/)
assert.match(sectionContent, /科研项目/)
assert.match(sectionContent, /联系方式/)

const overviewTemplate = sectionContent.match(
  /<template v-if="section\.id === '00'">([\s\S]*?)<\/template>/,
)?.[1] ?? ''
assert.doesNotMatch(overviewTemplate, /[\u3400-\u9fff]/)

const compactProjectLink = readFileSync(
  resolve(root, 'src/components/projects/CompactProjectLink.vue'),
  'utf8',
)
assert.match(compactProjectLink, /v-if="project\.href"/)
assert.match(compactProjectLink, /aria-disabled="true"/)
assert.doesNotMatch(compactProjectLink, /href="#"/)

console.log('Portfolio structure checks passed.')
