---
title: 3. 通过 Cloudflare 发布
---

先获得正常的公开网站，再考虑域名。

## 注册并连接账号

在 [Cloudflare](https://dash.cloudflare.com/sign-up) 注册并验证邮箱，可以使用同一 Gmail。参考 [账号指南](https://developers.cloudflare.com/fundamentals/account/create-account/)。

打开 **Workers & Pages → Create application**，选择从 GitHub 导入 Worker。登录 GitHub 并授权目标仓库，确认所有者与名称，不必开放全部仓库。

本教程采用 **Workers Static Assets 与 Workers Builds**，不是旧 Workers Sites 产品。参见 [官方 Git 部署流程](https://developers.cloudflare.com/workers/ci-cd/builds/)。

## 配置第一次部署

| 设置 | 示例 |
| --- | --- |
| 生产分支 | `main` |
| 根目录 | 仓库根目录 |
| 构建命令 | 纯 HTML/CSS/JS 留空 |
| 部署命令 | `npx wrangler deploy` |
| Worker 名称 | 与配置的 `name` 一致 |
| 静态资源目录 | 配置为 `./public` |

没有脚本时不要凭空填写 `npm run build`。Docusaurus 等框架另有构建步骤和输出目录，此处仅针对简单静态网站。参见 [构建配置](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)。

选择 **Save and Deploy** 或对应按钮。等待成功，再打开控制台显示的生产 `workers.dev` 地址；准确主机名取决于 Worker 与账号设置。

## 检查线上网站

- 用无痕窗口打开生产地址。
- 手机上检查菜单与滚动。
- 确认 HTTPS、图片、样式和链接正常。
- 核对最新文案，而不只是旧页面。

:::warning 合并不等于部署
合并 PR 只能证明代码进入 GitHub，不能证明 Cloudflare 已上线。分别检查部署结果与生产网址。
:::

:::success 完成检查
`workers.dev` 可以访问，目标提交对应的生产部署成功。不需要域名时，可以先到此结束。
:::
