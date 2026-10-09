/* Checks every question solves, every page has copy, and every internal link points to a real file. */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const B = require(path.join(root, 'src/calculators.js'));
const { TOPICS, QUESTIONS } = require(path.join(root, 'src/questions.js'));
let failures = 0;
const fail = (msg) => { failures++; console.error('FAIL', msg); };

const slugs = new Set();
for (const q of QUESTIONS) {
  if (slugs.has(q.slug)) fail(`duplicate slug ${q.slug}`); slugs.add(q.slug);
  const c = B.CALCS[q.calc];
  if (!c) { fail(`${q.slug}: unknown calculator ${q.calc}`); continue; }
  for (const k of Object.keys(q.vals)) if (!c.fields.some((f) => f.id === k)) fail(`${q.slug}: unknown field ${k}`);
  const vals = Object.assign(Object.fromEntries(c.fields.map((f) => [f.id, f.v])), q.vals);
  if (!B.renderAnswer(c, q.solve, q.say, vals).ok) fail(`${q.slug}: example has no answer`);
  const text = JSON.parse(fs.readFileSync(path.join(root, 'content', q.topic + '.json'), 'utf8')).pages[q.slug];
  if (!text || text.tips.length !== 3 || text.faq.length !== 3) fail(`${q.slug}: missing or incomplete copy`);
}

for (const mode of [[], ['--preview']]) execFileSync('node', [path.join(root, 'build.js'), ...mode], { stdio: 'ignore' });
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
for (const out of ['dist', 'preview']) {
  const dir = path.join(root, out);
  for (const f of walk(dir).filter((f) => f.endsWith('.html'))) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/(?:href|src)="([^"]+)"/g)) {
      const u = m[1]; if (/^(https?:|#|mailto:)/.test(u)) continue;
      let t = out === 'dist' ? path.join(dir, u) : path.join(path.dirname(f), u);
      if (out === 'dist' && u.endsWith('/')) t = path.join(t, 'index.html');
      if (!fs.existsSync(t)) fail(`${path.relative(root, f)} links to missing ${u}`);
    }
  }
}
console.log(`${QUESTIONS.length} questions, ${TOPICS.length} topics checked. ${failures ? failures + ' problems' : 'All good.'}`);
process.exit(failures ? 1 : 0);
