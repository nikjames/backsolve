/* Backsolve calculator engine. Runs in the browser (window.Backsolve) and in Node (module.exports) so pages are pre-rendered with the same code. */
(function (root) {
  const pmt = (r, n, pv) => (r === 0 ? pv / n : (pv * r) / (1 - Math.pow(1 + r, -n)));
  const pvOf = (r, n, p) => (r === 0 ? p * n : (p * (1 - Math.pow(1 + r, -n))) / r);
  const fv = (r, n, p) => (r === 0 ? p * n : (p * (Math.pow(1 + r, n) - 1)) / r);

  const CALCS = {
    car: {
      name: 'Car loan', out: 'payment',
      fields: [
        { id: 'price', label: 'Car price', kind: 'money', v: 32000 },
        { id: 'down', label: 'Down payment', kind: 'money', v: 4000, note: 'Cash plus any trade-in value' },
        { id: 'rate', label: 'Interest rate', kind: 'pct', v: 6.9, note: 'Yearly rate (APR) from your lender' },
        { id: 'months', label: 'Loan length', kind: 'num', unit: 'months', v: 60 },
        { id: 'payment', label: 'Monthly payment', kind: 'money', v: 450 },
      ],
      calc: (v) => pmt(v.rate / 1200, v.months, v.price - v.down),
      extras: (v) => ({ interest: { label: 'Total interest', kind: 'money', value: v.payment * v.months - (v.price - v.down) } }),
      explain: 'Backsolve uses the standard amortized loan formula that lenders use. The amount you borrow is the car price minus your down payment. Each month the lender charges interest on what you still owe (your yearly rate divided by 12), and the rest of your payment pays down the balance. When you ask for something other than the payment, Backsolve tries values for that box until the payment comes out to the number you entered. Taxes, title and dealer fees are not included, so add them to the price if you are financing them.',
    },
    loan: {
      name: 'Personal loan', out: 'payment',
      fields: [
        { id: 'amount', label: 'Loan amount', kind: 'money', v: 10000 },
        { id: 'rate', label: 'Interest rate', kind: 'pct', v: 12, note: 'Yearly rate (APR) from your lender' },
        { id: 'months', label: 'Loan length', kind: 'num', unit: 'months', v: 36 },
        { id: 'payment', label: 'Monthly payment', kind: 'money', v: 300 },
      ],
      calc: (v) => pmt(v.rate / 1200, v.months, v.amount),
      extras: (v) => ({ interest: { label: 'Total interest', kind: 'money', value: v.payment * v.months - v.amount } }),
      explain: 'Personal loans use the same amortized formula as car loans and mortgages. Your monthly payment covers that month\'s interest (the yearly rate divided by 12, charged on the remaining balance) plus a slice of the balance, so the loan reaches zero on the last payment. Solving backwards, Backsolve tries loan amounts, rates or lengths until the payment matches yours. Origination fees are not included; if the lender deducts one, you receive less than the loan amount.',
    },
    mortgage: {
      name: 'Mortgage', out: 'payment',
      fields: [
        { id: 'price', label: 'Home price', kind: 'money', v: 350000 },
        { id: 'down', label: 'Down payment', kind: 'pct', v: 10, note: 'Percent of the home price' },
        { id: 'rate', label: 'Interest rate', kind: 'pct', v: 6.5 },
        { id: 'years', label: 'Loan length', kind: 'num', unit: 'years', v: 30 },
        { id: 'payment', label: 'Monthly payment', kind: 'money', v: 2200, note: 'Principal and interest only, not taxes or insurance' },
      ],
      calc: (v) => pmt(v.rate / 1200, v.years * 12, v.price * (1 - v.down / 100)),
      extras: (v) => ({ loan: { label: 'Loan amount', kind: 'money', value: v.price * (1 - v.down / 100) } }),
      explain: 'The payment here is principal and interest on a fixed-rate mortgage. The loan is the home price minus your down payment, repaid in equal monthly payments over the loan length, with interest charged at the yearly rate divided by 12. Property taxes, homeowners insurance, HOA dues and mortgage insurance (usually required under 20% down) come on top, so leave room for them in your budget.',
    },
    homeIncome: {
      name: 'House on your salary', out: 'price',
      fields: [
        { id: 'income', label: 'Household income per year', kind: 'money', v: 90000, note: 'Before taxes' },
        { id: 'debts', label: 'Other monthly debt payments', kind: 'money', v: 400, note: 'Car, student loans, credit card minimums' },
        { id: 'down', label: 'Down payment', kind: 'pct', v: 10 },
        { id: 'rate', label: 'Interest rate', kind: 'pct', v: 6.5 },
        { id: 'years', label: 'Loan length', kind: 'num', unit: 'years', v: 30 },
        { id: 'price', label: 'Home price', kind: 'money', v: 300000 },
      ],
      calc: (v) => {
        const budget = Math.min(0.28 * v.income / 12, 0.36 * v.income / 12 - v.debts);
        if (budget <= 0) return 0;
        return pvOf(v.rate / 1200, v.years * 12, budget) / (1 - v.down / 100);
      },
      extras: (v) => ({ budget: { label: 'Monthly housing budget', kind: 'money', value: Math.max(0, Math.min(0.28 * v.income / 12, 0.36 * v.income / 12 - v.debts)) } }),
      explain: 'This follows the 28/36 guideline many lenders start from: housing should cost no more than 28% of your gross monthly income, and all debt payments together no more than 36%. Backsolve takes the lower of the two limits as your monthly budget, works out the largest loan that budget can repay at your rate and loan length, then adds your down payment to get a home price. The budget covers principal and interest only, so a home with high taxes or HOA dues will need a lower price.',
    },
    rent: {
      name: 'Rent budget', out: 'rent',
      fields: [
        { id: 'income', label: 'Income per year', kind: 'money', v: 60000, note: 'Before taxes' },
        { id: 'share', label: 'Share of income for rent', kind: 'pct', v: 30, note: '30% is the common rule of thumb' },
        { id: 'rent', label: 'Monthly rent', kind: 'money', v: 1500 },
      ],
      calc: (v) => (v.income / 12) * (v.share / 100),
      explain: 'The calculation is simple: your yearly income divided by 12, times the share you are willing to spend on rent. The 30% rule is a long-standing guideline, and many landlords use a related test, asking that your income be about 40 times the monthly rent (which works out to 30%). If you have large debt payments or live in an expensive city, a lower or higher share may fit better.',
    },
    grade: {
      name: 'Final exam', out: 'course',
      fields: [
        { id: 'current', label: 'My grade right now', kind: 'pct', v: 86 },
        { id: 'weight', label: 'The final is worth', kind: 'pct', v: 25, note: 'Check your syllabus' },
        { id: 'exam', label: 'Score on the final', kind: 'pct', v: 80 },
        { id: 'course', label: 'Grade for the class', kind: 'pct', v: 88 },
      ],
      calc: (v) => v.current * (1 - v.weight / 100) + (v.exam * v.weight) / 100,
      explain: 'Your class grade is a weighted average. If the final is worth 25%, your current grade counts for the other 75%. So class grade = current grade × (1 − final weight) + final score × final weight. Backsolve rearranges that to find whichever number you are missing. It assumes your current grade already reflects everything except the final; if more assignments are still due, the answer is an estimate.',
    },
    gpa: {
      name: 'GPA', out: 'newGpa',
      fields: [
        { id: 'gpa', label: 'Current GPA', kind: 'gpa', v: 3.2 },
        { id: 'credits', label: 'Credits completed', kind: 'num', unit: 'credits', v: 60 },
        { id: 'semGpa', label: 'GPA this semester', kind: 'gpa', v: 3.5 },
        { id: 'semCredits', label: 'Credits this semester', kind: 'num', unit: 'credits', v: 15 },
        { id: 'newGpa', label: 'New overall GPA', kind: 'gpa', v: 3.3 },
      ],
      calc: (v) => (v.gpa * v.credits + v.semGpa * v.semCredits) / (v.credits + v.semCredits),
      explain: 'Overall GPA is a credit-weighted average: each grade counts in proportion to its credit hours. Backsolve multiplies your current GPA by your completed credits to get your grade points so far, adds this semester\'s GPA times its credits, and divides by your total credits. It assumes a 4.0 scale and that no classes are being retaken; schools that replace retaken grades will give a slightly different result.',
    },
    savings: {
      name: 'Savings goal', out: 'balance',
      fields: [
        { id: 'start', label: 'Saved so far', kind: 'money', v: 2000 },
        { id: 'monthly', label: 'Added each month', kind: 'money', v: 500 },
        { id: 'apy', label: 'Interest rate (APY)', kind: 'pct', v: 4 },
        { id: 'years', label: 'Time', kind: 'num', unit: 'years', v: 5 },
        { id: 'balance', label: 'Goal amount', kind: 'money', v: 40000 },
      ],
      calc: (v) => v.start * Math.pow(1 + v.apy / 1200, v.years * 12) + fv(v.apy / 1200, v.years * 12, v.monthly),
      extras: (v) => ({ interest: { label: 'Interest earned', kind: 'money', value: v.balance - v.start - v.monthly * v.years * 12 } }),
      explain: 'Backsolve grows your current savings with interest compounded monthly, then adds each monthly deposit and the interest it earns until the end date. This is the future value formula used by banks and savings calculators. Real accounts change rates over time and investments go up and down, so treat the result as a planning estimate, not a promise.',
    },
    retire: {
      name: 'Retirement number', out: 'nest',
      fields: [
        { id: 'spending', label: 'Yearly spending in retirement', kind: 'money', v: 60000, note: 'After Social Security or pensions' },
        { id: 'rate', label: 'Safe withdrawal rate', kind: 'pct', v: 4 },
        { id: 'nest', label: 'Savings needed', kind: 'money', v: 1500000 },
      ],
      calc: (v) => v.spending / (v.rate / 100),
      explain: 'This uses the withdrawal-rate rule of thumb, often called the 4% rule: if you take out about 4% of your savings in the first year of retirement and adjust for inflation after that, historical research suggests the money tends to last about 30 years. So the savings you need is your yearly spending divided by the withdrawal rate. A lower rate is more cautious; early retirees often plan around 3% to 3.5%.',
    },
    freelance: {
      name: 'Hourly rate', out: 'rate',
      fields: [
        { id: 'income', label: 'Take-home pay I want per year', kind: 'money', v: 80000 },
        { id: 'expenses', label: 'Business costs per year', kind: 'money', v: 12000, note: 'Software, equipment, insurance' },
        { id: 'tax', label: 'Tax rate', kind: 'pct', v: 25 },
        { id: 'weeks', label: 'Weeks I work per year', kind: 'num', unit: 'weeks', v: 46 },
        { id: 'hours', label: 'Billable hours per week', kind: 'num', unit: 'hours', v: 30 },
        { id: 'rate', label: 'Hourly rate', kind: 'money', v: 90 },
      ],
      calc: (v) => (v.income + v.expenses) / (1 - v.tax / 100) / (v.weeks * v.hours),
      extras: (v) => ({ weeksOff: { label: 'Weeks off', kind: 'num', unit: 'weeks', value: 52 - v.weeks } }),
      explain: 'Start with what you want to take home, add your yearly business costs, then gross that up for taxes (divide by 1 minus your tax rate). That is what you need to bill in a year. Divide it by the hours you can actually bill, which is your working weeks times billable hours per week. Billable hours are usually well below hours worked, because admin, sales and unpaid revisions take time too.',
    },
    pay: {
      name: 'Hourly and salary', out: 'salary',
      fields: [
        { id: 'hourly', label: 'Hourly wage', kind: 'money', v: 25 },
        { id: 'hours', label: 'Hours per week', kind: 'num', unit: 'hours', v: 40 },
        { id: 'weeks', label: 'Paid weeks per year', kind: 'num', unit: 'weeks', v: 52, note: 'Use 52 if you get paid time off' },
        { id: 'salary', label: 'Yearly salary', kind: 'money', v: 52000 },
      ],
      calc: (v) => v.hourly * v.hours * v.weeks,
      explain: 'Yearly pay is your hourly wage times hours per week times paid weeks per year. A full-time job with paid time off is 40 hours for 52 weeks, or 2,080 hours, which is why a quick rule is to double the hourly wage and add three zeros ($25 an hour is about $50,000). Overtime, bonuses and unpaid weeks change the result, so adjust the boxes to match your job.',
    },
    paycheck: {
      name: 'Take-home pay', out: 'takehome',
      fields: [
        { id: 'gross', label: 'Salary per year', kind: 'money', v: 70000, note: 'Before taxes' },
        { id: 'tax', label: 'Total tax rate', kind: 'pct', v: 22, note: 'Federal, state and payroll taxes together' },
        { id: 'takehome', label: 'Take-home pay per month', kind: 'money', v: 4500 },
      ],
      calc: (v) => (v.gross * (1 - v.tax / 100)) / 12,
      explain: 'Take-home pay is your salary minus taxes, divided into 12 months. Backsolve uses one combined tax rate to keep things simple; a typical range for federal, state and payroll taxes together is 18% to 30% depending on your income and state. Retirement contributions and health insurance taken from your paycheck lower take-home pay further, so add them to the tax rate if you want a closer estimate.',
    },
    debt: {
      name: 'Debt payoff', out: 'months',
      fields: [
        { id: 'balance', label: 'Balance owed', kind: 'money', v: 6000 },
        { id: 'apr', label: 'Interest rate (APR)', kind: 'pct', v: 22 },
        { id: 'payment', label: 'Monthly payment', kind: 'money', v: 250 },
        { id: 'months', label: 'Time to pay off', kind: 'num', unit: 'months', v: 30 },
      ],
      calc: (v) => {
        const r = v.apr / 1200;
        if (r === 0) return v.balance / v.payment;
        if (v.payment <= v.balance * r) return NaN;
        return -Math.log(1 - (r * v.balance) / v.payment) / Math.log(1 + r);
      },
      extras: (v) => ({ interest: { label: 'Total interest', kind: 'money', value: v.payment * v.months - v.balance } }),
      explain: 'Each month interest is added at your APR divided by 12, and your payment comes off the balance. If your payment is smaller than the monthly interest, the debt never shrinks, and Backsolve tells you so. The answer assumes a fixed payment and no new charges; adding new purchases to a card pushes the payoff date back.',
    },
    tip: {
      name: 'Tip and split', out: 'perPerson',
      fields: [
        { id: 'bill', label: 'Bill before tip', kind: 'money', v: 80 },
        { id: 'tip', label: 'Tip', kind: 'pct', v: 20 },
        { id: 'people', label: 'People splitting', kind: 'num', unit: 'people', v: 2 },
        { id: 'perPerson', label: 'Each person pays', kind: 'money', v: 48 },
      ],
      calc: (v) => (v.bill * (1 + v.tip / 100)) / v.people,
      extras: (v) => ({ tip: { label: 'Tip amount', kind: 'money', value: (v.bill * v.tip) / 100 } }),
      explain: 'The tip is the bill times the tip percentage, and each person pays the bill plus tip divided by the number of people. Many people tip on the pre-tax amount, so enter the bill before tax if that is your habit. In the US, 15% to 20% is typical for table service, and 20% or more for great service.',
    },
    fuel: {
      name: 'Road trip gas', out: 'cost',
      fields: [
        { id: 'miles', label: 'Trip distance', kind: 'num', unit: 'miles', v: 600 },
        { id: 'mpg', label: 'Fuel economy', kind: 'num', unit: 'mpg', v: 28 },
        { id: 'price', label: 'Gas price per gallon', kind: 'money', v: 3.1 },
        { id: 'cost', label: 'Gas cost', kind: 'money', v: 70 },
      ],
      calc: (v) => (v.miles / v.mpg) * v.price,
      explain: 'Gas cost is the distance divided by your car\'s miles per gallon, which gives gallons used, times the price per gallon. Highway driving usually beats the combined mpg on the window sticker, while heavy loads, roof boxes and high speeds lower it. For a round trip, enter the total distance both ways.',
    },
    sale: {
      name: 'Sale price', out: 'final',
      fields: [
        { id: 'original', label: 'Original price', kind: 'money', v: 80 },
        { id: 'discount', label: 'Discount', kind: 'pct', v: 25 },
        { id: 'tax', label: 'Sales tax', kind: 'pct', v: 8.25 },
        { id: 'final', label: 'Price I pay', kind: 'money', v: 60 },
      ],
      calc: (v) => v.original * (1 - v.discount / 100) * (1 + v.tax / 100),
      extras: (v) => ({ saved: { label: 'You save', kind: 'money', value: (v.original * v.discount) / 100 } }),
      explain: 'The sale price is the original price minus the discount, and sales tax is added on the discounted price, which is how most US stores ring it up. Two discounts in a row (say 20% off, then another 10%) multiply rather than add, so they make 28% off, not 30%. Enter 0 for tax if the price already includes it.',
    },
    emergency: {
      name: 'Emergency fund', out: 'fund',
      fields: [
        { id: 'expenses', label: 'Essential expenses per month', kind: 'money', v: 3500, note: 'Rent, food, bills, insurance, minimum payments' },
        { id: 'months', label: 'Months to cover', kind: 'num', unit: 'months', v: 6 },
        { id: 'fund', label: 'Emergency fund', kind: 'money', v: 21000 },
      ],
      calc: (v) => v.expenses * v.months,
      explain: 'An emergency fund is your essential monthly expenses times the number of months you want covered. The usual guidance is three to six months; people with variable income, one earner in the household or a job that takes a while to replace often aim for more. Count only what you would still have to pay if your income stopped.',
    },
  };

  const num = (s) => { const n = parseFloat(String(s).replace(/[$,%\s]/g, '')); return Number.isFinite(n) ? n : NaN; };
  function fmt(v, f) {
    if (!Number.isFinite(v)) return '—';
    if (f.kind === 'money') { const d = Math.abs(v) < 1000 ? 2 : 0; return (v < 0 ? '−$' : '$') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
    if (f.kind === 'pct') return v.toLocaleString('en-US', { maximumFractionDigits: 1 }) + '%';
    if (f.kind === 'gpa') return v.toFixed(2);
    if (f.unit === 'years' && v < 2) { const m = v * 12; return (Math.round(m * 10) / 10).toLocaleString('en-US') + (Math.round(m * 10) / 10 === 1 ? ' month' : ' months'); }
    if (f.unit === 'months') { const m = v < 10 ? Math.round(v * 10) / 10 : Math.round(v); return m.toLocaleString('en-US') + (m === 1 ? ' month' : ' months') + (m >= 24 ? ` (about ${(Math.round(m / 1.2) / 10).toLocaleString('en-US')} years)` : ''); }
    if (f.unit === 'people' || f.unit === 'credits') { const r = Math.round(v * 10) / 10; return r.toLocaleString('en-US') + ' ' + f.unit; }
    return v.toLocaleString('en-US', { maximumFractionDigits: 1 }) + ' ' + f.unit;
  }
  const plain = (v, f) => (!Number.isFinite(v) ? '' : f.kind === 'money' ? v.toLocaleString('en-US', { maximumFractionDigits: Math.abs(v) < 1000 ? 2 : 0 }) : String(+v.toFixed(2)));

  function solve(c, vals, u) {
    if (u === c.out) { const r = c.calc(vals); return Number.isFinite(r) ? r : NaN; }
    const target = vals[c.out];
    const g = (x) => { const r = c.calc(Object.assign({}, vals, { [u]: x })) - target; return Number.isFinite(r) ? r : NaN; };
    const field = c.fields.find((f) => f.id === u);
    const x0 = Number.isFinite(vals[u]) && vals[u] > 0 ? vals[u] : field.v || 1;
    const g0 = g(x0);
    if (Number.isFinite(g0) && Math.abs(g0) < 1e-9 * Math.max(1, Math.abs(target))) return x0;
    const base = Math.max(Math.abs(x0), 1) * 0.01;
    const prev = { up: [x0, g0], dn: [x0, g0] };
    let lo = null, hi = null;
    for (let k = 0; k < 90 && lo === null; k++) {
      const step = base * Math.pow(1.5, k);
      for (const d of ['up', 'dn']) {
        let x = d === 'up' ? x0 + step : x0 - step;
        if (x < 0) { if (prev[d][0] === 0) continue; x = 0; }
        const fx = g(x), pf = prev[d][1], px = prev[d][0];
        if (!Number.isFinite(fx)) { continue; }
        if (fx === 0) { lo = hi = x; break; }
        if (Number.isFinite(pf) && Math.sign(fx) !== Math.sign(pf)) { lo = Math.min(px, x); hi = Math.max(px, x); break; }
        prev[d] = [x, fx];
      }
    }
    if (lo === null) return NaN;
    let flo = g(lo);
    for (let i = 0; i < 200 && hi - lo > 1e-10 * Math.max(1, hi); i++) {
      const m = (lo + hi) / 2, fm = g(m);
      if (!Number.isFinite(fm)) break;
      if (Math.sign(fm) === Math.sign(flo)) { lo = m; flo = fm; } else hi = m;
    }
    return (lo + hi) / 2;
  }

  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  function renderFields(c, solveId, vals) {
    return c.fields.filter((f) => f.id !== solveId).map((f) => {
      const pre = f.kind === 'money' ? '<span class="affix">$</span>' : '';
      const post = f.kind === 'pct' ? '<span class="affix">%</span>' : f.unit ? `<span class="affix">${f.unit}</span>` : '';
      return `<div class="field"><label for="f-${f.id}">${esc(f.label)}</label><div class="box">${pre}<input id="f-${f.id}" data-f="${f.id}" inputmode="decimal" autocomplete="off" value="${plain(vals[f.id], f)}">${post}</div>${f.note ? `<span class="note">${esc(f.note)}</span>` : ''}</div>`;
    }).join('');
  }

  function fillSay(tpl, answer, extras) {
    return tpl.replace(/\{answer\}/g, `<strong>${esc(answer)}</strong>`).replace(/\{x:(\w+)\}/g, (_, k) => (extras && extras[k] ? `<strong>${esc(fmt(extras[k].value, extras[k]))}</strong>` : ''));
  }

  function renderAnswer(c, solveId, say, vals) {
    const field = c.fields.find((f) => f.id === solveId);
    const missing = c.fields.filter((f) => f.id !== solveId && !Number.isFinite(vals[f.id]));
    if (missing.length) return { ok: false, html: `<p class="tag">${esc(field.label)}</p><p class="big">Waiting for numbers</p><p class="why">Fill in ${esc(missing.map((f) => f.label.toLowerCase()).join(' and '))}.</p>` };
    const a = solve(c, vals, solveId);
    if (!Number.isFinite(a) || a < 0) return { ok: false, html: `<p class="tag">${esc(field.label)}</p><p class="big">Not possible with these numbers</p><p class="why">Try changing one of the boxes above, for example a smaller goal, more time or a bigger payment.</p>` };
    const full = Object.assign({}, vals, { [solveId]: a });
    const extras = c.extras ? c.extras(full) : null;
    const shown = fmt(a, field);
    let warn = '';
    if (field.kind === 'pct' && solveId === 'exam' && a > 100) warn = ' That is over 100%, so this goal may be out of reach.';
    if (field.kind === 'gpa' && a > 4) warn = ' That is above 4.0, so this target is out of reach this semester.';
    return { ok: true, value: a, html: `<p class="tag">${esc(field.label)}</p><p class="big">${esc(shown)}</p><p class="say">${fillSay(say, shown, extras)}${warn}</p>` };
  }

  const api = { CALCS, solve, fmt, plain, num, renderFields, renderAnswer, esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Backsolve = api;
})(typeof window !== 'undefined' ? window : this);
