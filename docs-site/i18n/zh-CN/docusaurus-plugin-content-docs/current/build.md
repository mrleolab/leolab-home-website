---
title: 2. 用 Codex 搭建网站
---

第一版使用 HTML、CSS 与 JavaScript，暂不需要后端或数据库。

## 描述想实现的效果

打开仓库后，可复制以下提示词并填入自己的内容。代码与提示词保留英文，方便直接使用。

```text
Build my first personal website in this repository.
Use plain HTML, CSS, and JavaScript. Put public website files in public/.
Include an introduction, projects, learning resources, and a contact link.
Use a clean, readable design that works on phones and computers.
Use accessible headings, keyboard navigation, and good color contrast.
Do not add accounts, a database, analytics, paid services, or an AI API.
Do not make a contact form look functional unless it really sends messages.
Create a static-assets-only Cloudflare Workers configuration.
Preview the result and test links, mobile layout, and scrolling.
Do not publish or purchase anything yet. Explain the changed files.
```

要求创建适配手机的静态网站，不引入付费服务、登录或数据库，不伪装可用表单，也不直接发布与购买。

## 理解文件结构

```text
my-first-website/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── wrangler.jsonc
└── README.md
```

只把打算公开的文件放在 `public/`。凭据、私密文档和开发文件留在目录之外。

以下配置适用于**新示例项目**，不要直接覆盖已有生产站点：

```json
{
  "name": "my-first-website",
  "compatibility_date": "2026-10-24",
  "assets": { "directory": "./public" }
}
```

Worker 名称须在账号内可用，并与控制台设置一致。新建时填写当时日期。纯静态 Worker 无需 `main`，参见 [静态资源文档](https://developers.cloudflare.com/workers/static-assets/)。

## 发布前预览

请 Codex 打开本地预览。分别检查桌面与手机宽度，点击所有链接、展开菜单，并从页面中间测试滚动。

```text
Review this website before release. Check phone and desktop layouts,
keyboard use, broken links, console errors, image sizes, and touch scrolling.
Confirm only public/ will be deployed and no secrets are present.
Show the findings and fix issues within the existing scope.
```

## 保存到 GitHub

检查代码差异，再请 Codex 在**已有权限时**创建分支、提交、推送并打开 PR；否则用 GitHub Desktop 操作。检查 PR 后合并到选定生产分支，通常为 `main`。

:::success 完成检查
`main` 中有预期的 `public/index.html` 与 `wrangler.jsonc`，本地预览正常，提交中没有密码、令牌与无关文件。
:::
