---
title: 4. 绑定自己的域名
---

域名是易于记忆的网址，与网站文件和托管服务不同。

## 注册或使用已有域名

在 Cloudflare Registrar 选择 **Register domains**，搜索名称。购买前核对首年及续费价格、年限、联系人与自动续费设置。由本人完成购买，并处理注册联系人验证邮件。

静态网站不代表域名免费。阅读 [注册说明](https://developers.cloudflare.com/registrar/get-started/register-domain/)。

已有其他注册商的域名时，无需再买或转移所有权。把域名区域添加到 Cloudflare，按指引在注册商修改 nameservers，保留原 DNS 记录（尤其邮箱记录），等待激活。参见 [完整 DNS 设置](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)。

:::warning 保护已有服务
修改 nameservers 或删除记录可能中断网站与邮箱。先检查现状，不要为消除报错直接删除冲突记录。
:::

## 连接到 Worker

1. 在 **Workers & Pages** 打开已部署的 Worker。
2. 找到 **Settings → Domains & Routes** 或当前域名区域。
3. 选择 **Add → Custom Domain**。
4. 输入自己持有的主机名，检查后确认。
5. 等待 DNS 与 HTTPS 证书激活，再访问测试。

`example.com` 是保留的示例域名，不可认领。对符合条件的已激活区域，Cloudflare 会管理所需 DNS 与证书；已有 CNAME 冲突需要检查。参见 [自定义域名文档](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)。

根域名和 `www` 不同。需要两者时分别配置，选定主网址，必要时另设重定向。添加一个不代表另一个自动可用。

:::success 完成检查
电脑和手机能用域名通过 HTTPS 打开正确网站，原有邮箱可用，续费日期明确。
:::
