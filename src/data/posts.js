// Local post data keeps the first blog-list version static and easy to expand.
export const blogPosts = [
  {
    category: '技术栈',
    title: 'Vue 3 + Vite 项目框架介绍',
    summary:
      '本项目采用 Vue 3 作为前端框架，结合 Vite 完成快速开发与构建。页面通过组件化方式拆分为公共布局、首页首屏、博客列表、项目展示和团队介绍等模块。',
    meta: '2026-06-10',
    tags: ['Vue3', 'Vite', '前端框架', '组件化'],
  },
  {
    category: '技术栈',
    title: '路由与页面结构设计',
    summary:
      '网站使用 Vue Router 管理首页、博客、项目、团队和关于页面。页面视图集中放在 views 目录中，导航数据统一维护，方便后续扩展。',
    meta: '2026-06-10',
    tags: ['VueRouter', '页面结构', '导航设计'],
  },
  {
    category: '项目复盘',
    title: '首页首屏交互设计记录',
    summary:
      '首页通过大标题、粒子背景和鼠标跟随效果建立第一视觉印象。设计重点是控制动效强度，让页面有技术感，同时保持阅读清晰。',
    meta: '2026-06-11',
    tags: ['首页设计', '粒子背景', '交互效果'],
    image: {
      src: '/blog/home-hero-preview.png',
      alt: 'Leo Team Blog 首页首屏截图',
      position: 'center 42%',
    },
  },
  {
    category: '精选预告',
    title: '博客文章模块开发计划',
    summary:
      '后续将继续完善文章详情页、分类筛选、文章数据结构和内容展示方式。第一阶段先使用本地数据完成静态博客列表。',
    meta: '计划整理',
    tags: ['博客模块', '文章列表', '本地数据'],
    featured: true,
    image: {
      src: '/blog/blog-module-preview.png',
      alt: '博客模块结构示意图',
      position: 'center center',
    },
  },
  {
    category: '精选预告',
    title: '团队协作与项目分工总结',
    summary:
      '这篇文章将整理 Leo Team Blog 的团队分工、开发流程、页面推进顺序和遇到的问题，作为课程项目开发过程的阶段性记录。',
    meta: '计划整理',
    tags: ['团队协作', '项目分工', '开发记录'],
    featured: true,
  },
  {
    category: '等待更新',
    title: '更多内容正在整理',
    summary:
      '后续会继续补充组件封装、样式规范、响应式适配、构建部署等开发记录，让博客内容随着项目推进逐步完善。',
    meta: '持续更新',
    tags: ['待补充', '技术笔记', '项目复盘'],
    muted: true,
  },
]
