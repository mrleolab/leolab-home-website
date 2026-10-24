---
title: 1. 准备账号
---

使用自己掌控的账号，验证邮箱，并弄清每个项目由哪个账号持有。

## Gmail 与 Codex

1. 没有 Gmail 时，通过 [Google 账号页面](https://accounts.google.com/signup) 注册，设置恢复方式与两步验证。
2. 在 [ChatGPT](https://chatgpt.com/) 注册或登录，使用 Gmail 地址，或在页面提供时选择 Google 登录。
3. 按照 [Codex 官方入门指南](https://learn.chatgpt.com/docs/quickstart) 安装支持的桌面应用，或选择其他受支持客户端。
4. 使用 ChatGPT 账号登录，确认工作区正确并拥有 Codex 权限。

无需另外注册一个“Codex 邮箱账号”。Gmail 是邮箱身份，Codex 使用 ChatGPT 登录。API 密钥是部分客户端的另一种认证方式，本教程不需要。参见 [官方认证说明](https://learn.chatgpt.com/docs/auth)。

:::success 完成检查
你能打开 Codex，选择项目目录并发送任务，也知道当前账号与工作区。
:::

## 创建 GitHub 账号与仓库

1. 打开 [GitHub 注册页面](https://github.com/signup)，选择账号名称并验证邮箱。开启双重认证，安全保存恢复码。参见 [账号指南](https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github)。
2. 选择 **New repository**，确认 **Owner** 是你，命名为 `my-first-website`。
3. 想公开代码时选 **Public**，否则选 **Private**。私有仓库也能发布公开网站。
4. 初始化 README。不了解许可证时，不要随意选择。
5. 创建仓库并复制网址。参见 [仓库指南](https://docs.github.com/en/get-started/start-your-journey/creating-a-repository-for-your-project-on-github)。

用 [GitHub Desktop](https://desktop.github.com/) 克隆到电脑，再在 Codex 打开这个文件夹。如果已有认证的 Git 权限，也可请 Codex 按准确网址克隆。

:::warning 浏览器登录不等于写入权限
Chrome 登录 GitHub 不会自动允许编程工具推送代码。授权正确的 GitHub 连接或 Git 客户端，仅开放目标仓库，并在写入前确认所有者。
:::

:::success 完成检查
仓库属于你，Codex 打开的目录是该仓库的克隆，不是碰巧同名的文件夹。
:::
