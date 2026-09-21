import { createRouter, createWebHashHistory } from 'vue-router'

import { getSectionBySlug } from '../data/portfolio'
import { getArticle, getCategoryLabel } from '../data/articles'
import PortfolioView from '../views/PortfolioView.vue'

const routes = [
  {
    path: '/about/profile',
    name: 'about-profile',
    component: () => import('../views/AboutProfileView.vue'),
  },
  {
    path: '/__crystal-lab',
    name: 'crystal-lab',
    component: () => import('../experiments/crystal-lab/CrystalLabView.vue'),
  },
  {
    path: '/:category(development|research)/articles',
    name: 'article-archive',
    component: () => import('../views/ArticleArchiveView.vue'),
    props: true,
  },
  {
    path: '/:category(development|research)/articles/:slug',
    name: 'article-detail',
    component: () => import('../views/ArticleDetailView.vue'),
    props: true,
  },
  {
    path: '/:section(about|development|research|contact)?',
    name: 'portfolio',
    component: PortfolioView,
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  if (to.name === 'about-profile') {
    document.title = 'ABOUT ME — ZHEN'
    return
  }

  if (to.name === 'crystal-lab') {
    document.title = 'Crystal Lab — Orbit Archive'
    return
  }

  if (to.name === 'article-archive') {
    document.title = `${getCategoryLabel(to.params.category)} WRITINGS — ZHEN`
    return
  }

  if (to.name === 'article-detail') {
    const article = getArticle(to.params.category, to.params.slug)
    document.title = article
      ? `${article.title} — ZHEN`
      : 'ARTICLE NOT FOUND — ZHEN'
    return
  }

  const section = getSectionBySlug(to.params.section)
  document.title = section.id === '00'
    ? 'Orbit Archive — ZHEN'
    : `${section.navLabel} — Orbit Archive`
})

export default router
