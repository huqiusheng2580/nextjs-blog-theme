[Netlify Next.js 博客模板（设计者：Bejamas）](https://user-images.githubusercontent.com/43764894/223762618-62742b4e-9424-44a7-8e85-9f7e4e19db54.png)

[![部署到 Netlify 按钮](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/netlify-templates/nextjs-blog-theme)

可自定义的博客入门模板，使用了以下技术：

- [Next.js](https://github.com/vercel/next.js) v15（Pages Router）
- [Tailwind](https://tailwindcss.com/) v4.x
- [Netlify 可视化编辑器（Netlify Visual Editor）](https://docs.netlify.com/visual-editor/overview/)
- 内置 [MDX](https://mdxjs.com/) 支持
- 含现代化设计，支持深色与浅色主题

![博客主题预览：作者 Jay Doe，博客名称为 “Next.js Blog Theme”，带一篇博文](nextjs-blog-theme-preview.png)

[在线演示](https://bejamas-nextjs-blog.netlify.app)

[点击观看模板演示视频](https://www.youtube.com/watch?v=63QZHs259dY)

## 目录

- [目录](#目录)
- [快速开始](#快速开始)
  - [本地搭建](#本地搭建)
  - [使用设置向导](#使用设置向导)
- [配置博客](#配置博客)
- [添加新文章](#添加新文章)
- [Netlify 可视化编辑器](#netlify-可视化编辑器)
  - [在本地开发并使用 Netlify 可视化编辑器](#在本地开发并使用-netlify-可视化编辑器)
  - [后续建议](#后续建议)
- [测试](#测试)
  - [内置的默认测试工具](#内置的默认测试工具)
  - [移除 Renovate](#移除-renovate)
- [支持](#支持)

## 快速开始

你可以通过两种方式开始使用本项目：在本地运行，或使用 [设置向导](https://nextjs-wizard.netlify.app/)。

### 本地搭建

如果在本地操作，先在 GitHub 上点击本模板的 [Use this template](https://github.com/netlify-templates/nextjs-blog-theme/generate) 按钮。这会在你的 GitHub 账号下生成一个包含本模板文件的新仓库。完成后，克隆该仓库并在终端进入项目目录。

在项目目录中安装依赖：

```shell
yarn install
```

然后在本地运行项目：

```shell
yarn run dev
```

在浏览器中打开 <http://localhost:3000>，你应该能看到运行中的项目。

### 使用设置向导

![Setup Wizard 界面预览](nextjs-setup-wizard.png)

通过 [设置向导](https://nextjs-wizard.netlify.app/)，你可以几步完成博客创建并部署到 Netlify。

## 配置博客

模板使用环境变量进行配置，这样方便与像 Netlify 这样的 Jamstack 平台集成。

下面是可以修改的环境变量：

| 变量 | 说明 | 可选项 |
| --- | --- | --- |
| `BLOG_NAME` | 博客名称，显示在头像下方 | |
| `BLOG_TITLE` | 主页上的主标题（`h1`） | |
| `BLOG_FOOTER_TEXT` | 页脚显示的文本 | |
| `BLOG_THEME` | 传给 Tailwind 的主题 | 默认 |
| `BLOG_FONT_HEADINGS` | 所有标题（`h1` 到 `h6`）的字体族 | sans-serif（默认）、serif、monospace |
| `BLOG_FONT_PARAGRAPHS` | 其他段落与元素的字体族 | sans-serif（默认）、serif、monospace |

所有这些环境变量可以通过 [向导](https://nextjs-wizard.netlify.app/) 配置，或在你部署平台（例如 Netlify）的站点设置中配置（Site settings → Build & deploy → Environment variables）。

https://user-images.githubusercontent.com/3611928/153997545-6dcdeef0-e570-49e7-93d6-ce0d393d16c9.mp4

[说明：演示如何编辑环境变量的视频]

如果不想使用环境变量，也可以在 `utils/global-data.js` 中修改默认值，或者直接在代码中硬编码博客信息（不推荐，但可行）。

- `BLOG_THEME`, `BLOG_FONT_HEADINGS`, 和 `BLOG_FONT_PARAGRAPHS` 在 [`tailwind-preset.js`](tailwind-preset.js) 中使用
- `BLOG_NAME`, `BLOG_TITLE`, `BLOG_FOOTER_TEXT` 在 [`pages/index.js`](pages/index.js) 与 [`pages/posts/[slug].js`](pages/posts/[slug].js) 中通过 `globalData` 对象使用

## 添加新文章

所有文章都存放在项目的 `/posts` 目录下。要新增一篇文章，新建一个以 `.mdx` 为扩展名的文件即可。

由于文章使用 `MDX` 格式，你可以传入 props 和组件，也就是说可以在文章中使用 [React 组件](https://reactjs.org/docs/components-and-props.html) 来增强交互性。更多用法请参阅 [MDX 内容文档](https://mdxjs.com/docs/using-mdx/#components)。

https://user-images.githubusercontent.com/3611928/152727802-102ec296-41c8-446d-93ed-922d11187073.mp4

[说明：展示如何添加新博文的视频]

## Netlify 可视化编辑器

本模板已配置以支持 [可视化编辑](https://docs.netlify.com/visual-editor/overview/) 与 [Git 内容源](https://docs.netlify.com/create/content-sources/git/)。

### 在本地开发并使用 Netlify 可视化编辑器

通常的开发流程是先在本地工作：克隆仓库，然后在项目根目录运行 `npm install`。

启动 Next.js 开发服务器：

```txt
cd nextjs-blog-theme
npm run dev
```

安装 Netlify 可视化编辑器的 CLI（Netlify Visual Editor CLI）：

```txt
npm install -g @stackbit/cli
stackbit dev
```

运行后会输出你本地的可视化编辑器 URL，打开它并登录，就能在 Netlify 的可视化编辑器中查看并编辑你的项目。

![Next.js 开发 + Visual Editor 本地运行](https://assets.stackbit.com/docs/next-dev-stackbit-dev.png)

### 后续建议

如果你刚接触 Netlify 可视化编辑器，可以参考：

- 学习 [Netlify 可视化编辑器概览](https://docs.netlify.com/visual-editor/visual-editing/)
- 查阅 [Netlify 可视化编辑器参考文档](https://visual-editor-reference.netlify.com/)

## 测试

### 内置的默认测试工具

我们在模板中包含了一些工具以便维护：

- [Renovate](https://www.mend.io/free-developer-tools/renovate/) — 用于定期更新依赖

如果你的团队不需要这些工具，可以很容易地将它们移除。

### 移除 Renovate

为了保持依赖最新，模板使用了 [Renovate](https://github.com/marketplace/renovate)。如果你不需要这个工具，只需删除根目录下的 `renovate.json` 文件并提交到主分支。

## 支持

如果在使用过程中遇到问题，可以到 [support 论坛](https://answers.netlify.com/) 获取帮助。
