# Orbit Archive

基于 Vue 3、Vite、Vue Router 和 Three.js 的个人博客。00–04 共用晶体场景；02 DEVELOPMENT、03 RESEARCH 提供最新文章入口，阅读页使用独立滚动容器，不运行完整 3D 场景。

## 运行与检查

```bash
npm install
npm run dev
npm run test:articles
npm run test:structure
npm run test:crystal
npm run build
npm run preview -- --host 127.0.0.1
```

使用 hash 路由，静态托管时可直接刷新：

- `/#/development`、`/#/research`：对应晶体与最新两篇文章。
- `/#/development/articles`、`/#/research/articles`：分类列表。
- `/#/development/articles/my-first-note`：文章详情，slug 为 Markdown 文件名去掉 `.md`。

## 新增文章

在 `content/development/` 或 `content/research/` 新建 UTF-8 Markdown 文件，例如 `my-first-note.md`。建议文件名使用小写英文、数字和连字符。无需修改路由或手工登记文章。

```markdown
---
title: 晶体场景开发笔记
date: 2026-09-21
summary: 记录一次场景运镜与阅读体验的实现。
tags: [Three.js, Vue, 开发笔记]
cover: /images/articles/my-first-note/cover.jpg
---

## 正文

支持中文段落、标题、列表、代码块、表格、引用和图片。

![效果图](/images/articles/my-first-note/result.png)
```

- `title`、`summary` 必须为非空字符串。
- `date` 必须是合法的 `YYYY-MM-DD` 日期，拒绝不存在的日期。
- `tags` 必须是字符串数组；允许 `[]`，数组内不允许空白、数字或对象。重复标签自动去重，标签在预览、列表和详情中可见。
- `cover` 可省略。提供时必须是非空的站内绝对路径（单个 `/` 开头）或 HTTP(S) 图片地址，详情页会显示封面。
- YAML 元数据错误的文章会被忽略，直链显示 `ARTICLE NOT FOUND`。可用 `npm run test:articles` 检查解析器规则；添加文章后也请在预览中确认其出现。
- 分类按日期降序排列，晶体页只显示最新两篇。无文章时隐藏卡片，保留 `VIEW ALL`，分类列表显示 `NO ARTICLES YET`。

将图片放入 `public/images/articles/<slug>/`，引用时不写 `public`。例如磁盘文件 `public/images/articles/my-first-note/cover.jpg` 对应 `/images/articles/my-first-note/cover.jpg`。发布到子目录时需要将图片 URL 配置为实际部署前缀。不要引用本机磁盘路径。图片说明使用 Markdown 的 alt 文本。

当前两个内容目录仅保留 `.gitkeep`，没有正式文章或演示文章。正文 HTML 经过 DOMPurify 清理。

## 交互与维护

最新文章和 `VIEW ALL` 使用同一晶体进入动画。正常桌面约 1.7 秒后切换路由；遮罩由动画实际进度触发。移动端、减少动画、低帧率和 WebGL 不可用时使用简化紫色遮罩。返回按钮与返回对应分类的浏览器历史导航触发反向转场。

个人资料、项目和联系方式仍在 `src/data/portfolio.js`。00、01、04 的内容及 ZHEN 会话开场沿用现有实现。

设计记录：`docs/superpowers/specs/2026-08-28-crystal-article-experience-design.md`。
本轮验收及未覆盖项：`docs/qa/2026-09-21-crystal-articles.md`。
