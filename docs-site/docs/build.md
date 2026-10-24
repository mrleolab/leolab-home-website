---
title: 2. Build with Codex
---

Make the first version easy to understand and easy to deploy: plain HTML, CSS, and JavaScript, with no server or database.

## Describe the result you want

Paste this into Codex after opening your repository folder. Replace the personal details with your own.

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

## Understand the files

The example project should look like this:

```text
my-first-website/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── wrangler.jsonc
└── README.md
```

Only `public/` should contain files intended for visitors. Keep credentials, private documents, and development files outside it.

Here is a minimal `wrangler.jsonc` for this **new example project**, not a configuration to paste over an existing production site's settings:

```json
{
  "name": "my-first-website",
  "compatibility_date": "2026-10-24",
  "assets": {
    "directory": "./public"
  }
}
```

Choose a valid Worker name for your account and keep the dashboard name consistent with the configuration. Use the current date when creating a new configuration. Static-only Workers do not need a `main` script. See [Cloudflare static assets](https://developers.cloudflare.com/workers/static-assets/).

## Preview before publishing

Ask Codex to open a local preview and check the actual page. Try a narrow phone-sized viewport as well as a desktop window. Click every link, open the menu, and scroll from the center of the page—not just the edges.

```text
Review this website before release. Check phone and desktop layouts,
keyboard use, broken links, console errors, image sizes, and touch scrolling.
Confirm only public/ will be deployed and no secrets are present.
Show the findings and fix issues within the existing scope.
```

## Save the website to GitHub

Review the diff, then ask Codex to create a branch, commit the intended files, push, and open a PR **if it has permission**. Otherwise use GitHub Desktop to commit and push. Review the PR and merge it into your chosen production branch, usually `main`.

:::success Checkpoint
GitHub's `main` branch contains the expected `public/index.html` and `wrangler.jsonc`. Local preview works. No tokens, passwords, or unrelated files are in the commit.
:::
