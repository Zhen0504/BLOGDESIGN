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
    document.title = '关于我 · 圳的星河手记'
    return
  }

  if (to.name === 'crystal-lab') {
    document.title = 'Crystal Lab · 圳的星河手记'
    return
  }

  if (to.name === 'article-archive') {
    document.title = `${getCategoryLabel(to.params.category)} · 圳的星河手记`
    return
  }

  if (to.name === 'article-detail') {
    const article = getArticle(to.params.category, to.params.slug)
    document.title = article
      ? `${article.title} · 圳的星河手记`
      : '文章未找到 · 圳的星河手记'
    return
  }

  const section = getSectionBySlug(to.params.section)
  document.title = section.id === '00'
    ? '圳的星河手记'
    : `${section.navLabel} · 圳的星河手记`
})

export default router
