import { createRouter, createWebHashHistory } from 'vue-router'

import { getSectionBySlug } from '../data/portfolio'
import PortfolioView from '../views/PortfolioView.vue'

const routes = [
  {
    path: '/__crystal-lab',
    name: 'crystal-lab',
    component: () => import('../experiments/crystal-lab/CrystalLabView.vue'),
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
  if (to.name === 'crystal-lab') {
    document.title = 'Crystal Lab — Orbit Archive'
    return
  }

  const section = getSectionBySlug(to.params.section)
  document.title = section.id === '00'
    ? 'Orbit Archive — ZHEN'
    : `${section.navLabel} — Orbit Archive`
})

export default router
