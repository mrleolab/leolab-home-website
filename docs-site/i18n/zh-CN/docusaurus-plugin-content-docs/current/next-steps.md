---
title: 5. 更新、检查与持续学习
---

首次上线只是开始，每次修改保持足够小，便于验证。

## 更新流程

**描述 → 构建 → 预览 → 检查 PR → 合并 → 检查部署 → 测试线上网站**

配置 Git 部署后，选定生产分支的新提交触发对应流程。功能分支或未合并 PR 不等于生产更新，先核对分支设置。

```text
Update my existing website: [describe one specific change].
Preserve unrelated files and existing behavior.
Test phone and desktop layouts, links, accessibility, and scrolling.
Explain the diff and create a PR if GitHub permission is available.
Wait for my approval before merging or changing external services.
After an approved merge, verify the deployment separately.
```

## 常见问题

### 看不到 GitHub 仓库

检查 GitHub 账号、所有者与集成访问权限，私有仓库也需要授权。不要反复创建重复仓库或 Worker。

### 构建失败

阅读第一条有效错误，核对根目录、Worker 名称、配置文件与命令。纯静态文件不需要虚构构建脚本。

### 404 或没有样式

确认生产分支有 `public/index.html`，`assets.directory` 指向 `./public`。检查路径和大小写。本地文件预览与 HTTP 部署可能不同。

### 修改未上线

比较生产部署提交与合并提交。先看构建状态，成功后再刷新或用无痕窗口检查，不要一开始就归咎于缓存。

### 域名不能访问

检查区域激活、nameservers、绑定主机名、记录冲突与证书状态。生效不一定即时，不要随意关闭安全功能或删除无关记录。

## 最后检查

- [ ] 自己掌控仓库与托管账号。
- [ ] 电脑手机都可用，没有整页横向溢出。
- [ ] 导航与联系链接有效。
- [ ] 未提交密钥或私密信息。
- [ ] 正确提交的生产构建成功。
- [ ] 无痕窗口可访问。
- [ ] 域名 HTTPS 正常，续费日期明确。
- [ ] 知道如何检查并撤销错误提交、重新部署。

## 关于知识库

这里采用 Meta 的开源框架 [Docusaurus](https://docusaurus.io/docs)。Markdown 章节生成静态网页，可持续增加教程，无需替换主页或长期运行文档服务器。

从有用的一页开始，理解文件的作用，再分享成功与修正的经验。
