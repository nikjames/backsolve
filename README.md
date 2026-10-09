# Backsolve

Question-first calculators that work backwards. 61 question pages, 8 topic hubs, About, Privacy and a 404 page, all generated from data.

## Build

Needs Node 18 or newer. No packages to install.

```
npm run build    # production site → dist/
npm run preview  # preview with relative links and visible ad placeholders → preview/
npm test         # checks every calculator, every page's copy and every link
```

GitHub Actions runs `npm test` on every push to `main` and on every pull request.

## Deploy on Cloudflare Pages

1. In Cloudflare, go to Workers & Pages, then Create, then Pages, then Connect to Git, and pick this repository.
2. Framework preset: None. Build command: `npm run build`. Build output directory: `dist`.
3. Add your domain under the project's Custom domains tab.

Every push to `main` deploys automatically; pull requests get their own preview URL.

## Where things live

| File | What it holds |
| --- | --- |
| `site.config.json` | Domain, site name, contact email, AdSense and Google Analytics IDs |
| `src/calculators.js` | The 17 calculators: fields, formulas, explanations, and the reverse solver |
| `src/questions.js` | Topics and every question page: URL slug, which calculator, what it solves for, example numbers |
| `content/<topic>.json` | Page copy: intro, tips, FAQ per question, and each hub's guide |
| `src/assets/` | Stylesheet and the browser script |
| `build.js` | Turns all of the above into HTML, plus `sitemap.xml`, `robots.txt` and `ads.txt` |

## Add a question page

1. Add a line to `src/questions.js` (pick an existing calculator, or add one to `src/calculators.js`).
2. Add its copy to `content/<topic>.json` under `pages`, keyed by the slug.
3. Run `node build.js`. The page, links, hub list and sitemap update automatically.

## Before launch

1. **Domain:** set `siteUrl` in `site.config.json` to your real domain, and `contactEmail` to an address you check.
2. **Hosting:** push this folder to GitHub and connect it to Cloudflare Pages or Netlify. Build command `node build.js`, output folder `dist`.
3. **Google Search Console:** verify the domain and submit `https://<your domain>/sitemap.xml`.
4. **Google Analytics:** create a GA4 property and put its ID (`G-…`) in `ga4Id`.
5. **AdSense:** apply with the live site. Once approved, put your publisher ID (`ca-pub-…`) in `adsenseClient` and create four ad units (after answer, mid content, right rail, mobile sticky) and paste their slot IDs into `adSlots`. Rebuild; `ads.txt` is generated for you.
6. **Consent banner:** in AdSense, turn on Privacy & messaging for visitors in Europe and the UK.

Until `adsenseClient` is set, production pages contain no ad code and no empty ad space.

## Ad rules built in

- No ad above the calculator or between the boxes and the answer.
- At most three ad spaces visible per page: after the answer, mid-article, and a right rail on desktop or a 50px closable bar on phones.
- Every ad space reserves its height so the page never jumps.
