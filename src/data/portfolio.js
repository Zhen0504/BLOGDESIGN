export const sectionDefinitions = Object.freeze([
  {
    id: '00',
    slug: '',
    navLabel: 'OVERVIEW',
    chapterLabel: 'ORBIT ARCHIVE',
    focusCrystal: null,
    contentSide: 'left',
  },
  {
    id: '01',
    slug: 'about',
    navLabel: 'ABOUT',
    chapterLabel: 'ABOUT',
    focusCrystal: 'about',
    contentSide: 'left',
  },
  {
    id: '02',
    slug: 'development',
    navLabel: 'DEVELOPMENT',
    chapterLabel: 'DEVELOPMENT',
    focusCrystal: 'development',
    contentSide: 'right',
  },
  {
    id: '03',
    slug: 'research',
    navLabel: 'RESEARCH',
    chapterLabel: 'RESEARCH',
    focusCrystal: 'research',
    contentSide: 'left',
  },
  {
    id: '04',
    slug: 'contact',
    navLabel: 'CONTACT',
    chapterLabel: 'CONTACT',
    focusCrystal: 'contact',
    contentSide: 'right',
  },
])

export const portfolio = Object.freeze({
  brand: {
    name: 'ZHEN',
    title: 'Orbit Archive.',
    subtitle: 'ABOUT · DEVELOPMENT · RESEARCH · CONTACT',
  },
  profile: {
    summary: '',
    keywords: [],
  },
  developmentProjects: [],
  researchProjects: [],
  contact: {
    github: {
      label: 'github.com/Zhen0504',
      href: 'https://github.com/Zhen0504',
    },
    email: null,
  },
})

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

export function isIsoDate(value) {
  if (!isoDatePattern.test(value ?? '')) return false

  const parsed = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value
}

export function sortProjectsByDate(projects) {
  return [...projects].sort((left, right) => {
    const rightTime = isIsoDate(right.date) ? Date.parse(`${right.date}T00:00:00Z`) : -Infinity
    const leftTime = isIsoDate(left.date) ? Date.parse(`${left.date}T00:00:00Z`) : -Infinity
    return rightTime - leftTime
  })
}

export function getLatestProjects(projects, limit = 2) {
  return sortProjectsByDate(projects).slice(0, limit)
}

export function getSectionBySlug(slug = '') {
  return sectionDefinitions.find((section) => section.slug === (slug ?? ''))
    ?? sectionDefinitions[0]
}

export function getSectionPath(section) {
  return section.slug ? `/${section.slug}` : '/'
}
