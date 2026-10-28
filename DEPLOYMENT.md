# Deployment: Cloudflare Pages (free)

The site is a static export. Hosting costs nothing: Cloudflare Pages Free, a GitHub repository and the `*.pages.dev` hostname are all $0. No server, no database, no paid API.

## What the build produces

```
npm run build
  prebuild   node scripts/fetch-github.mjs      public GitHub API -> src/data/github.snapshot.json (falls back to the committed snapshot)
  build      next build                         static HTML/JS/CSS into ./out
  postbuild  node scripts/normalize-export.mjs  Windows-only file-name fix for segment prefetch payloads
             node scripts/verify-export.mjs     fails if a route, SEO file, icon or header file is missing, or if placeholder text / secrets are present
```

`out/` is the complete site, including `_headers` (security headers), `sitemap.xml`, `robots.txt`, `og.png` and icons.

## 1. GitHub repository

```bash
git init -b main
git add -A
git commit -m "Workstation portfolio"
# the repository is named after the site it publishes
gh repo create 0x496C6B696E.pages.dev --public --source=. --push     # or create the repo on github.com and `git remote add origin ...`
```

Nothing in the repository is secret. `src/data/github.snapshot.json` is committed on purpose so builds work offline and without API quota.

## 2. Connect Cloudflare Pages

1. Cloudflare dashboard -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Pick the `0x496C6B696E.pages.dev` repository and the `main` branch.
3. Build settings:

   | Setting | Value |
   | --- | --- |
   | Project name | `0x496c6b696e` (becomes the `0x496c6b696e.pages.dev` hostname; lowercase only) |
   | Framework preset | **Next.js (Static HTML Export)** |
   | Build command | `npm run build` (this runs prebuild/postbuild; `npx next build` alone skips the GitHub snapshot refresh and the export checks) |
   | Build output directory | `out` |
   | Root directory | `/` |

4. Environment variables (Production and Preview):

   | Variable | Value | Why |
   | --- | --- | --- |
   | `NODE_VERSION` | `24` | matches the lockfile and `@types/node` |
   | `NEXT_PUBLIC_SITE_URL` | `https://<project>.pages.dev` (later your custom domain) | canonical URLs, Open Graph, sitemap, robots |
   | `GITHUB_TOKEN` | optional, a fine-grained token with no scopes | only raises the API rate limit for the build script; never shipped to the browser |
   | `BONFIREOS_SKIP_GITHUB` | optional `1` | skip the API entirely and use the committed snapshot |

5. **Save and Deploy**. The first deployment takes about two minutes; the site is served over HTTPS at `https://<project>.pages.dev`.

## 3. Deploying changes

Push to `main`. Cloudflare builds and publishes automatically. Every pull request / non-production branch gets a **preview deployment** at `https://<hash>.<project>.pages.dev`.

There is intentionally no GitHub Actions workflow. Run the same checks locally before pushing:

```bash
npm run verify        # typecheck + lint + unit tests + build + export verification + Playwright e2e
```

## 4. Rolling back

Cloudflare dashboard -> the Pages project -> **Deployments** -> pick a previous successful deployment -> **Rollback to this deployment**. Rollbacks are instant and free; the Git history is untouched.

## 5. Custom domain (optional, later)

1. Pages project -> **Custom domains** -> **Set up a custom domain** -> enter the domain.
2. If the DNS zone is on Cloudflare the CNAME is added for you; otherwise add `CNAME <host> -> <project>.pages.dev` at your registrar.
3. Set `NEXT_PUBLIC_SITE_URL` to the new origin and redeploy so canonical/OG/sitemap URLs update.

Buying a domain is optional and is the only possible cost in this setup.

## 6. Free-plan limits that matter

- 500 builds per month, 1 concurrent build (Pages Free).
- 20,000 files per deployment, 25 MiB per file. This site is well under both.
- Static requests are unmetered.

## Security notes for static hosting

- `public/_headers` sets CSP, `X-Frame-Options: DENY`, `nosniff`, referrer and permissions policies, and immutable caching for hashed assets.
- The CSP must allow `'unsafe-inline'` scripts because static export cannot issue per-request nonces for the Next.js hydration script. All scripts are still same-origin.
- There is no server-side code, no cookies, no analytics and no third-party requests at runtime. Fonts are self-hosted.
- The GitHub token, if used, lives only in the Cloudflare build environment and is read by `scripts/fetch-github.mjs` in Node.

## Running the export locally

```bash
npm run build
npm start             # serves ./out at http://localhost:4173 with Cloudflare-like clean URLs and 404.html
```
