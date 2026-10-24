---
title: 3. Publish with Cloudflare
---

First get a working public website. Buy and connect a domain only after this step succeeds.

## Create and connect your account

Create an account at [Cloudflare](https://dash.cloudflare.com/sign-up) and verify your email. You can use the same Gmail address. Follow the [account setup instructions](https://developers.cloudflare.com/fundamentals/account/create-account/) if needed.

In the dashboard, open **Workers & Pages**, choose **Create application**, and select the GitHub import option for a Worker. Authenticate with GitHub and grant the integration access to your website repository. Select the correct owner and repository; do not authorize all repositories unnecessarily.

This guide uses **Workers Static Assets and Workers Builds**, not the older Workers Sites product. See the [official Git deployment flow](https://developers.cloudflare.com/workers/ci-cd/builds/).

## Configure the first deployment

For the plain static example from the previous chapter:

| Setting | Example |
| --- | --- |
| Production branch | `main` |
| Root directory | Repository root |
| Build command | Leave empty for plain HTML/CSS/JS |
| Deploy command | `npx wrangler deploy` |
| Worker name | Match `name` in `wrangler.jsonc` |
| Static asset directory | `./public`, set in `wrangler.jsonc` |

Do not add `npm run build` unless your project actually defines a build script. Framework projects such as Docusaurus have a separate build step and generated output directory; these example settings are for the simple website only. Reference: [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

Choose **Save and Deploy** (or its current equivalent). Wait for the build and deployment to finish successfully, then open the production `workers.dev` URL shown in the dashboard. Its exact hostname depends on your Worker and account settings.

## Check the real public site

- Open the production URL in a private browser window.
- Check it on your phone, including menus and scrolling.
- Confirm HTTPS works and images, styles, and links load.
- Confirm it contains your latest text, not just an old cached page.

:::warning Merge is not deployment
A merged PR proves that the code reached GitHub. It does not prove Cloudflare built or published it. Check the deployment result and production URL separately.
:::

:::success Checkpoint
Your website is reachable on `workers.dev`. The Worker shows a successful production deployment for the intended commit. You can stop here if you do not need a custom domain yet.
:::
