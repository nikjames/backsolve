#!/usr/bin/env node
/* Builds the Backsolve site.
   node build.js            → dist/     production: clean URLs, real ad code when configured
   node build.js --preview  → preview/  relative links and visible ad placeholders, for previewing anywhere */
const fs = require('fs');
const path = require('path');
const B = require('./src/calculators.js');
const { TOPICS, QUESTIONS } = require('./src/questions.js');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'site.config.json'), 'utf8'));

const PREVIEW = process.argv.includes('--preview');
const OUT = path.join(__dirname, PREVIEW ? 'preview' : 'dist');
const esc = B.esc;
const SITE = cfg.siteUrl.replace(/\/$/, '');
const ADS_ON = PREVIEW || !!cfg.adsenseClient;

const content = {};
for (const t of TOPICS) content[t.id] = JSON.parse(fs.readFileSync(path.join(__dirname, 'content', t.id + '.json'), 'utf8'));

const POPULAR = ['how-much-car-can-i-afford', 'how-much-house-can-i-afford', 'what-do-i-need-on-my-final', 'how-much-to-save-each-month', 'how-long-to-pay-off-credit-card', 'freelance-hourly-rate', 'how-much-rent-can-i-afford', 'what-will-my-gpa-be', 'when-can-i-retire', 'what-percent-off'];

/* ---------- paths ---------- */
const qPath = (q) => `${q.topic}/${q.slug}/`;
const tPath = (t) => `${t.id}/`;
function href(target, from) {
  if (!PREVIEW) return '/' + target;
  const depth = from ? from.split('/').filter(Boolean).length : 0;
  return '../'.repeat(depth) + target + 'index.html';
}
const asset = (name, from) => (PREVIEW ? '../'.repeat(from ? from.split('/').filter(Boolean).length : 0) : '/') + 'assets/' + name;

/* ---------- pieces ---------- */
function adSlot(name, kind, from) {
  if (!ADS_ON) return '';
  const slotId = cfg.adSlots[name] || '';
  const inner = PREVIEW || !slotId
    ? 'Ad space'
    : `<ins class="adsbygoogle" style="display:block;width:100%" data-ad-client="${esc(cfg.adsenseClient)}" data-ad-slot="${esc(slotId)}" data-ad-format="${kind === 'sticky' ? 'horizontal' : 'auto'}" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>`;
  const cls = kind === 'wide' ? 'ad-box wide' : 'ad-box';
  return `<div class="ad" data-ad="${name}"><span class="ad-label">Advertisement</span><div class="${cls}">${inner}</div></div>`;
}
const stickyAd = () => (ADS_ON ? `<div class="sticky-ad" data-ad="sticky"><div class="ad-box">${PREVIEW || !cfg.adSlots.sticky ? 'Ad space' : `<ins class="adsbygoogle" style="display:inline-block;width:320px;height:50px" data-ad-client="${esc(cfg.adsenseClient)}" data-ad-slot="${esc(cfg.adSlots.sticky)}"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>`}</div><button type="button" aria-label="Close ad">×</button></div>` : '');
const rail = (from) => (ADS_ON ? `<aside class="rail">${adSlot('rail', 'rail', from)}</aside>` : '');

function guideHtml(text) {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) => (p.startsWith('### ') ? `<h3>${esc(p.slice(4))}</h3>` : `<p>${esc(p)}</p>`)).join('');
}

function shell({ from, title, description, canonical, body, jsonld, hasCalc, bare, activeTopic }) {
  const nav = TOPICS.map((t) => `<a href="${href(tPath(t), from)}"${t.id === activeTopic ? ' aria-current="page"' : ''}>${esc(t.short)}</a>`).join('');
  const headExtra = [
    `<meta name="description" content="${esc(description)}">`,
    canonical ? `<link rel="canonical" href="${SITE}/${canonical}">` : '',
    `<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website">${canonical !== null ? `<meta property="og:url" content="${SITE}/${canonical || ''}">` : ''}`,
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100,500;112,800;125,800;125,900&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">',
    `<link rel="stylesheet" href="${asset('style.css', from)}">`,
    !PREVIEW && cfg.adsenseClient ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(cfg.adsenseClient)}" crossorigin="anonymous"></script>` : '',
    !PREVIEW && cfg.ga4Id ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(cfg.ga4Id)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(cfg.ga4Id)}');</script>` : '',
    jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n');
  const page = `<header class="site-head"><div class="in"><a class="brand" href="${href('', from)}"><i aria-hidden="true">←</i>${esc(cfg.siteName)}</a><nav class="topnav" aria-label="Topics">${nav}</nav></div></header>
${body}
<footer class="site-foot"><div class="in"><nav aria-label="Site"><a href="${href('', from)}">All questions</a><a href="${href('about/', from)}">About</a><a href="${href('privacy/', from)}">Privacy</a></nav><p class="disclaimer">Backsolve gives estimates for planning. It is not financial, tax or legal advice; check important numbers with your lender, school or a professional.</p><p class="disclaimer">© ${new Date().getFullYear()} ${esc(cfg.siteName)}</p></div></footer>
${stickyAd()}
${hasCalc ? `<script src="${asset('calculators.js', from)}"></script>` : ''}<script src="${asset('app.js', from)}"></script>`;
  const bodyClass = ADS_ON ? ' class="has-sticky"' : '';
  if (bare) return `<title>${esc(title)}</title>\n${headExtra}\n${page}${ADS_ON ? '<script>document.body.classList.add("has-sticky")</script>' : ''}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
${headExtra}
</head>
<body${bodyClass}>
${page}
</body>
</html>
`;
}

function write(rel, html) {
  const file = path.join(OUT, rel, rel.endsWith('.html') || rel.includes('.') ? '' : 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

/* ---------- question pages ---------- */
const defaultsFor = (c, q) => Object.assign(Object.fromEntries(c.fields.map((f) => [f.id, f.v])), q.vals);

function questionPage(q) {
  const t = TOPICS.find((x) => x.id === q.topic);
  const c = B.CALCS[q.calc];
  const text = content[q.topic].pages[q.slug];
  if (!text) throw new Error('Missing content for ' + q.slug);
  const from = qPath(q);
  const vals = defaultsFor(c, q);
  const ans = B.renderAnswer(c, q.solve, q.say, vals);
  const field = c.fields.find((f) => f.id === q.solve);

  // other questions this calculator answers, as in-page switches
  const alts = [q, ...QUESTIONS.filter((o) => o.calc === q.calc && o.solve !== q.solve)]
    .filter((o, i, arr) => arr.findIndex((p) => p.solve === o.solve) === i);
  const altsHtml = alts.length > 1 ? `<div class="alts"><span>Ask it another way:</span>${alts.map((o) => `<button class="alt" type="button" data-solve="${o.solve}" data-say="${esc(o.say)}" aria-pressed="${o === q}">${esc(o.title)}</button>`).join('')}</div>` : '';

  const exampleRows = c.fields.filter((f) => f.id !== q.solve).map((f) => `<dt>${esc(f.label)}</dt><dd>${esc(B.fmt(vals[f.id], f))}</dd>`).join('');
  const exampleSay = ans.html.match(/<p class="say">([\s\S]*?)<\/p>/);
  const related = QUESTIONS.filter((o) => o.topic === q.topic && o.slug !== q.slug).slice(0, 5);
  const desc = `${q.promise} Free, no sign-up, and it works backwards from the answer you want.`;

  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: cfg.siteName, item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: t.name, item: `${SITE}/${tPath(t)}` },
      { '@type': 'ListItem', position: 3, name: q.title, item: `${SITE}/${from}` } ] },
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: q.title, url: `${SITE}/${from}`, applicationCategory: 'FinanceApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: q.promise },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: text.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];

  const body = `<div class="layout${ADS_ON ? ' has-rail' : ''}"><main>
<nav class="crumbs" aria-label="Breadcrumb"><a href="${href('', from)}">Home</a><span aria-hidden="true">›</span><a href="${href(tPath(t), from)}">${esc(t.name)}</a></nav>
<div class="head-block"><h1>${esc(q.title)}</h1><p class="lede">${esc(q.promise)}</p></div>
<section class="calc" aria-label="Calculator">
  <p class="step-label"><b>1</b>Fill in what you know</p>
  <div class="fields" id="fields">${B.renderFields(c, q.solve, vals)}</div>
  <p class="step-label"><b>2</b>Your answer</p>
  <div class="answer${ans.ok ? '' : ' bad'}" id="answer" aria-live="polite">${ans.html}</div>
  ${altsHtml}
</section>
${adSlot('afterAnswer', 'wide', from)}
<section class="block prose"><p>${esc(text.intro)}</p></section>
<section class="block prose"><h2>How it's calculated</h2><p>${esc(c.explain)}</p></section>
${adSlot('midContent', 'box', from)}
<section class="block"><h2>Example</h2><div class="example"><dl>${exampleRows}</dl><p>${exampleSay ? exampleSay[1] : ''}</p></div></section>
<section class="block prose"><h2>Tips</h2><ul>${text.tips.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>
<section class="block"><h2>Common questions</h2><div class="faq">${text.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div></section>
<section class="block"><h2>More about ${esc(t.name.toLowerCase())}</h2><ul class="qlist">${related.map((o) => `<li><a href="${href(qPath(o), from)}">${esc(o.title)}</a></li>`).join('')}</ul></section>
<script type="application/json" id="calc-config">${JSON.stringify({ calc: q.calc, solve: q.solve, say: q.say, vals }).replace(/</g, '\\u003c')}</script>
</main>${rail(from)}</div>`;

  write(from, shell({ from, title: `${q.title} | ${cfg.siteName}`, description: desc, canonical: from, body, jsonld, hasCalc: true, activeTopic: t.id }));
}

/* ---------- hubs ---------- */
function hubPage(t) {
  const from = tPath(t);
  const qs = QUESTIONS.filter((q) => q.topic === t.id);
  const others = TOPICS.filter((o) => o.id !== t.id);
  const body = `<div class="layout${ADS_ON ? ' has-rail' : ''}"><main>
<nav class="crumbs" aria-label="Breadcrumb"><a href="${href('', from)}">Home</a></nav>
<div class="head-block"><h1>${esc(t.name)}</h1><p class="lede">${esc(t.blurb)} Pick your question.</p></div>
<section class="block"><ul class="qlist two">${qs.map((q) => `<li><a href="${href(qPath(q), from)}">${esc(q.title)}</a></li>`).join('')}</ul></section>
${adSlot('afterAnswer', 'wide', from)}
<section class="block prose">${guideHtml(content[t.id].hub.guide)}</section>
<section class="block"><h2>Other topics</h2><div class="topics">${others.map((o) => `<a class="topic-card" href="${href(tPath(o), from)}"><b>${esc(o.name)}</b><span>${esc(o.blurb)}</span></a>`).join('')}</div></section>
</main>${rail(from)}</div>`;
  const jsonld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: cfg.siteName, item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: t.name, item: `${SITE}/${from}` }] };
  write(from, shell({ from, title: `${t.name} calculators | ${cfg.siteName}`, description: `${t.blurb} Free calculators that answer the question you actually have.`, canonical: from, body, jsonld, activeTopic: t.id }));
}

/* ---------- home ---------- */
function homePage() {
  const from = '';
  const pop = POPULAR.map((s) => QUESTIONS.find((q) => q.slug === s));
  const body = `<div class="layout"><main>
<div class="head-block"><h1>Most calculators answer one question. <em>This one answers yours.</em></h1>
<p class="lede">A loan calculator tells you the payment. But sometimes you know the payment you can afford and need the price. Backsolve works from whichever number you have to the one you need.</p></div>
<section class="block"><h2>Popular questions</h2><ul class="qlist two">${pop.map((q) => `<li><a href="${href(qPath(q), from)}">${esc(q.title)}</a></li>`).join('')}</ul></section>
<section class="block"><h2>Browse by topic</h2><div class="topics">${TOPICS.map((t) => `<a class="topic-card" href="${href(tPath(t), from)}"><b>${esc(t.name)}</b><span>${esc(t.blurb)}</span><small>${QUESTIONS.filter((q) => q.topic === t.id).length} questions</small></a>`).join('')}</div></section>
${adSlot('afterAnswer', 'wide', from)}
${TOPICS.map((t) => `<section class="block"><h2>${esc(t.name)}</h2><ul class="qlist two">${QUESTIONS.filter((q) => q.topic === t.id).map((q) => `<li><a href="${href(qPath(q), from)}">${esc(q.title)}</a></li>`).join('')}</ul></section>`).join('\n')}
</main></div>`;
  const jsonld = { '@context': 'https://schema.org', '@type': 'WebSite', name: cfg.siteName, url: SITE + '/' };
  write('', shell({ from, title: `${cfg.siteName}: calculators that work backwards`, description: 'Free calculators for loans, homes, grades, savings and more. Pick the question you have and Backsolve finds the number you need.', canonical: '', body, jsonld, bare: PREVIEW }));
}

/* ---------- static pages ---------- */
function simplePage(slug, title, desc, inner) {
  const from = slug + '/';
  const body = `<div class="layout"><main><div class="head-block"><h1>${esc(title)}</h1></div><section class="block prose">${inner}</section></main></div>`;
  write(from, shell({ from, title: `${title} | ${cfg.siteName}`, description: desc, canonical: from, body }));
}

function staticPages() {
  simplePage('about', 'About Backsolve', 'Why Backsolve exists and how it works.', `
<p>Most online calculators only run in one direction. A loan calculator takes a price and gives you a payment. But many real questions start from the other end: you know the payment you can afford and want the price, or you know the grade you want and need the score.</p>
<p>Backsolve answers the question you actually have. Each page starts from a question, fills in realistic example numbers, and works out the missing one. Change any box and the answer updates. Switch the question and the same calculator solves for a different number.</p>
<h2>How the math works</h2>
<p>Every calculator uses a standard formula, explained on its page. When you ask for something the formula does not give directly, Backsolve tries values for that box until the result matches the number you entered, the same way a spreadsheet's Goal Seek does.</p>
<h2>Ads</h2>
<p>Backsolve is free and paid for by a small number of ads. We keep them out of the way: no ads above the calculator, no pop-ups, nothing that blocks the page, and never more than three ad spaces on a page.</p>
<h2>Contact</h2>
<p>Found a mistake or want a new question answered? Email <strong>${esc(cfg.contactEmail)}</strong>.</p>`);

  simplePage('privacy', 'Privacy policy', 'How Backsolve handles data, cookies and ads.', `
<p>Last updated: ${new Date().toISOString().slice(0, 10)}</p>
<h2>What you type</h2>
<p>The numbers you enter in a calculator stay in your browser. They are not sent to us or stored on our servers.</p>
<h2>Analytics</h2>
<p>We use Google Analytics to count visits and see which pages are useful. It collects information such as pages viewed, approximate location, device and browser. You can opt out with Google's browser add-on at tools.google.com/dlpage/gaoptout.</p>
<h2>Advertising</h2>
<p>We show ads through Google AdSense. Google and its partners use cookies to serve ads based on your visits to this and other websites. You can turn off personalized ads in Google's Ad Settings at adssettings.google.com, and learn more at policies.google.com/technologies/ads. Visitors in the European Economic Area, the UK and Switzerland are asked for consent before personalized ads or non-essential cookies are used.</p>
<h2>Children</h2>
<p>Backsolve is not directed at children under 13, and we do not knowingly collect information from them.</p>
<h2>Contact</h2>
<p>Questions about this policy: <strong>${esc(cfg.contactEmail)}</strong>.</p>`);

  const from404 = '';
  write('404.html', shell({ from: from404, title: `Page not found | ${cfg.siteName}`, description: 'This page does not exist.', canonical: null, body: `<div class="layout"><main><div class="head-block"><h1>That page doesn't exist.</h1><p class="lede">Try one of the popular questions instead.</p></div><ul class="qlist two">${POPULAR.slice(0, 6).map((s) => QUESTIONS.find((q) => q.slug === s)).map((q) => `<li><a href="${href(qPath(q), from404)}">${esc(q.title)}</a></li>`).join('')}</ul></main></div>` }));
}

/* ---------- SEO files ---------- */
function seoFiles() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ['', 'about/', 'privacy/', ...TOPICS.map(tPath), ...QUESTIONS.map(qPath)];
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}/${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  if (cfg.adsenseClient) fs.writeFileSync(path.join(OUT, 'ads.txt'), `google.com, ${cfg.adsenseClient.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`);
}

/* ---------- run ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
for (const f of ['style.css', 'app.js']) fs.copyFileSync(path.join(__dirname, 'src/assets', f), path.join(OUT, 'assets', f));
fs.copyFileSync(path.join(__dirname, 'src/calculators.js'), path.join(OUT, 'assets', 'calculators.js'));
homePage();
TOPICS.forEach(hubPage);
QUESTIONS.forEach(questionPage);
staticPages();
if (!PREVIEW) seoFiles();
console.log(`Built ${QUESTIONS.length} question pages, ${TOPICS.length} topic hubs and 4 other pages into ${path.relative(__dirname, OUT)}/`);
