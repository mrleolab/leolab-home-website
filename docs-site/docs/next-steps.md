---
title: 5. Update, verify, and keep learning
---

Your first launch is the beginning, not the finish line. Keep changes small enough to review.

## Your repeatable update loop

**Describe → Build → Preview → Review PR → Merge → Check deployment → Test the live site**

When Git deployment is configured, new commits on the selected production branch trigger the connected production workflow. A feature branch or an unmerged PR is not the same as a production update. Check the branch settings rather than assuming all pushes go live.

Try this prompt for future edits:

```text
Update my existing website: [describe one specific change].
Preserve unrelated files and existing behavior.
Test phone and desktop layouts, links, accessibility, and scrolling.
Explain the diff and create a PR if GitHub permission is available.
Wait for my approval before merging or changing external services.
After an approved merge, verify the deployment separately.
```

## Troubleshooting

### My GitHub repository is missing in Cloudflare

Check the signed-in GitHub account, repository owner, and integration's repository access. A private repository needs authorization too. Avoid repeatedly creating duplicate repositories or Workers.

### The build fails

Read the first meaningful error in the build log. Verify the root directory, Worker name, configuration file, and deploy command. Plain static files do not require an invented build script.

### I see a 404 or unstyled page

Check that `public/index.html` exists on the production branch and that `assets.directory` points to `./public`. Inspect image and stylesheet paths, including capitalization. A local file preview can behave differently from an HTTP deployment.

### My changes are not live

Compare the latest production deployment's commit with your merged commit. Check build status before blaming browser cache. Once deployment succeeds, reload or use a private window to compare.

### My domain does not work

Check zone activation, assigned nameservers, the exact hostname attached to the Worker, conflicting records, and certificate status. DNS and certificate changes are not always instantaneous. Do not disable security or remove unrelated records as a shortcut.

## Final launch checklist

- [ ] I own the repository and hosting account.
- [ ] The site works on desktop and mobile without sideways page overflow.
- [ ] Navigation and contact links lead somewhere real.
- [ ] No secrets or private information were committed.
- [ ] The production build succeeded for the correct commit.
- [ ] The public URL works in a private window.
- [ ] My optional domain has working HTTPS and a known renewal date.
- [ ] I know how to undo a bad change using a reviewed revert and redeployment.

## About this knowledge base

This documentation uses [Docusaurus](https://docusaurus.io/docs), Meta's open-source documentation framework. Its chapters are Markdown files; the published site is generated static output. That lets Leo Lab add more guides without replacing the homepage or running a documentation server.

Start with one useful page. Learn what the files do. Share what worked—and what you had to fix.
