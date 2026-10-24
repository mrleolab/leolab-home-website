# Leo Lab Knowledge Base

Real Docusaurus 3 documentation, mounted at `/knowledge-base/`. The homepage remains a separate static page and does not load Docusaurus JavaScript.

## Update or add a guide

1. Edit Markdown in `docs/`. Add a guide's document IDs to `sidebars.js` (or add another category for a new knowledge base).
2. Run `npm ci` and `npm run build` in this directory.
3. Publish the generated `build/` files to the repository's `knowledge-base/` directory. Review the generated diff, commit sources and output together, then open a PR.
4. Verify the main-branch Cloudflare build and public route after merging.

Do not upload `node_modules`, `.docusaurus`, or source configuration as website assets; root `.assetsignore` excludes this directory. The checked-in generated output means the existing Cloudflare deployment needs no new build command. Regenerate the output whenever documentation changes. Dependencies are locked by `package-lock.json`.

Local preview: `npm start`. The tutorial describes a *new example website*, not changes to this production site's deployment settings.

## Languages

English is the default. Simplified Chinese chapters live under `i18n/zh-CN/docusaurus-plugin-content-docs/current/`; navbar/sidebar labels use the adjacent JSON files. Build both locales with `npm run build`, then publish the entire output (including `zh-CN/`). The native locale menu keeps the current chapter; `src/locale-memory.js` shares the preference with the main site's `leo-lab-language` localStorage key. No translation API or paid service is used.

The main site, About/K12 pages, and game interfaces use the shared human-authored pairs in root `site-language-strings.js`. Add both language versions when changing site copy. External websites/forms and conventional Chinese chess-piece characters are not translated. Do not add whole-page mutation observers to the animated homepage; only game interfaces observe dynamic UI updates. The Next-based chess page waits for board mount before translating to avoid hydration errors.

## Dependency review (2026-10-24)

The build is verified with patched `tinypool` and `serialize-javascript` overrides. `npm audit` reports 0 high / 0 critical and 31 moderate findings (including transitive dependents), remaining in the build/development toolchain. Do not expose the development server publicly or build untrusted content. Production serves static generated files, not these Node dependencies. Recheck upstream releases and audit results when updating dependencies; do not use an unreviewed `npm audit fix --force` downgrade.
