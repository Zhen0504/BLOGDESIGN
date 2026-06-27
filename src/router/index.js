import { createRouter, createWebHistory } from 'vue-router'

import AboutView from '../views/AboutView.vue'
import BlogListView from '../views/BlogListView.vue'
import HomeView from '../views/HomeView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import TeamView from '../views/TeamView.vue'

// Route meta titles are used below to keep browser tabs readable.
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: '首页' },
  },
  {
    path: '/blog',
    name: 'blog',
    component: BlogListView,
    meta: { title: '博客' },
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsView,
    meta: { title: '项目' },
  },
  {
    path: '/team',
    name: 'team',
    component: TeamView,
    meta: { title: '团队' },
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: { title: '关于' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  // Centralized title handling avoids each page component touching document state.
  document.title = to.meta?.title
    ? `${to.meta.title} - Leo Team Blog`
    : 'Leo Team Blog'
})

export default router
