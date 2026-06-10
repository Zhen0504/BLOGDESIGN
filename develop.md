# Leo Team Blog 开发进度

## 当前状态

项目阶段：基础框架搭建阶段。

当前仓库已经包含初始设计文档、Vue 3 + Vite 目录结构、基础应用入口、路由配置、全局样式、公共布局组件、页面占位视图和首页首屏第一版。项目依赖已安装，开发服务器可以启动，生产构建已验证通过。

## 已完成

- 创建初始设计参考文档：`设计.md`。
- 确认前端技术方向：Vue 3 + Vite。
- 创建项目基础目录：
  - `public/`
  - `src/assets/`
  - `src/components/`
  - `src/composables/`
  - `src/content/`
  - `src/data/`
  - `src/router/`
  - `src/services/`
  - `src/stores/`
  - `src/styles/`
  - `src/types/`
  - `src/utils/`
  - `src/views/`
  - `tests/`
  - `docs/`
- 添加 `.gitkeep` 文件，用于保留空目录。
- 添加 `plan.md`，用于说明项目长期开发方向。
- 添加 `develop.md`，用于记录项目开发进度。
- 创建 Vue 3 + Vite 基础文件：
  - `package.json`
  - `vite.config.js`
  - `index.html`
  - `src/main.js`
  - `src/App.vue`
  - `src/router/index.js`
- 创建基础样式文件：
  - `src/styles/reset.css`
  - `src/styles/variables.css`
  - `src/styles/global.css`
- 创建公共布局组件：
  - `src/components/layout/SiteHeader.vue`
  - `src/components/layout/SiteFooter.vue`
- 创建基础页面视图：
  - `src/views/HomeView.vue`
  - `src/views/BlogListView.vue`
  - `src/views/ProjectsView.vue`
  - `src/views/TeamView.vue`
  - `src/views/AboutView.vue`
- 创建导航数据文件：`src/data/navigation.js`。
- 创建结构测试：`tests/unit/project-structure.test.mjs`。
- 安装项目依赖并生成 `package-lock.json`。
- 添加 `.gitignore`，忽略 `node_modules/`、`dist/` 等生成目录。
- 验证结构测试通过。
- 验证生产构建通过。
- 验证本地开发服务器响应正常。
- 实现首页首屏第一版：
  - `src/components/home/HeroSection.vue`
  - `src/components/home/ParticleBackground.vue`
- 首页已接入独立首屏组件。
- 桌面端已实现点阵背景、标题轻微跟随和圆形遮罩文字切换。
- 移动端已关闭圆形遮罩动效，保留可读布局。

## 进行中

当前没有正在进行的编码任务。

## 下一步任务

### 1. 继续打磨首页首屏

优化首页首屏体验：

- 根据实际观感调整标题字号、圆形遮罩大小和粒子密度。
- 增加更细致的鼠标跟随缓动。
- 检查不同屏幕尺寸下的标题换行和按钮位置。
- 为首屏下方预览区增加更完整的内容。

预期结果：

- 首页首屏接近最终视觉稿。
- 桌面端交互自然，不影响阅读。
- 移动端布局稳定。

### 2. 添加博客数据骨架

创建本地博客数据：

- `src/data/posts.js`
- `src/components/blog/ArticleCard.vue`
- `src/views/BlogListView.vue`

预期结果：

- 博客列表页可以显示示例文章卡片。
- 数据与 UI 组件分离。

### 3. 添加项目页和团队页

完善项目和团队页面：

- `src/data/projects.js`
- `src/data/team.js`
- `src/components/projects/ProjectCard.vue`
- `src/components/team/TeamMemberCard.vue`

预期结果：

- 项目页可以从结构化数据渲染项目卡片。
- 团队页可以从结构化数据渲染成员卡片。

## 进度日志

### 2026-06-10

- 确认使用 Vue 3 + Vite 作为项目方向。
- 建立适合团队博客扩展的文件夹架构。
- 创建 `plan.md` 作为项目方向文档。
- 创建 `develop.md` 作为开发进度文档。
- 将 `plan.md` 和 `develop.md` 改为中文版本。
- 创建 Vue 3 + Vite 基础框架。
- 创建公共头部、公共页脚和基础页面布局。
- 添加结构测试并验证通过。
- 安装依赖并验证开发服务器可以访问。
- 执行生产构建并验证通过。
- 实现首页首屏第一版，并完成桌面端和移动端基础检查。

## 里程碑清单

- [x] 完成架构目录创建
- [x] 完成项目方向文档
- [x] 完成开发进度文档
- [x] 创建 Vue 项目基础文件
- [x] 安装项目依赖
- [x] 开发服务器可以启动
- [x] 实现基础布局
- [x] 实现首页首屏第一版
- [ ] 实现博客列表
- [ ] 实现文章详情
- [ ] 实现项目页面
- [ ] 实现团队页面
- [ ] 验证生产构建

## 后续开发备注

- 第一版保持小而完整。
- 先完成静态页面，再添加复杂交互。
- 视觉实现参考 `设计.md`，但不要让动效喧宾夺主。
- 每完成一个有意义的开发步骤，都应更新本文件。
