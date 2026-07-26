# Orbit Archive

Orbit Archive 是一个基于 Vue 3、Vite、Vue Router 和 OGL 的个人作品集网站。当前分支正在把原有团队博客重构为“固定 WebGL 3D 场景 + Vue DOM 内容层”的五状态单页体验。

## 当前阶段

第一阶段只建立单页运行骨架：

- 使用 `createWebHashHistory`，静态托管地址为 `/#/about`、`/#/development`、`/#/research` 和 `/#/contact`。
- 00–04 共用一个 `PortfolioView`，路由变化不会创建五套无关页面。
- 个人资料、项目和联系方式集中维护在 `src/data/portfolio.js`。
- 项目必须包含 ISO `date` 字段，并通过排序函数计算最新两个。
- 未提供的个人内容保持为空；项目无链接时呈现为不可点击状态。
- GitHub 固定为 <https://github.com/Zhen0504>，邮箱为空时隐藏。

OGL 晶体、银河粒子、景深、滚轮状态机、鼠标视差和完整性能降级将在后续经批准的阶段实现。

## 开发

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

结构测试：

```bash
npm run test:structure
```

## 内容配置

内容入口位于 `src/data/portfolio.js`：

- `profile`：个人简介和最多三个关键词。
- `developmentProjects`：开发项目。
- `researchProjects`：科研项目。
- `contact`：GitHub 和可选邮箱。

每个项目应包含 `id`、`title`、`label`、`date`、`href` 和 `external`。`date` 使用 `YYYY-MM-DD`；页面会按日期降序选取最新两个，而不是依赖数组顺序。

## 设计约束

详细设计规范位于：

`docs/superpowers/specs/2026-07-26-personal-portfolio-orbit-design.md`

参考图只用于视觉验收，不可作为整页背景。所有实际文字和链接必须保留在 DOM 中，Canvas 只负责装饰性视觉。
