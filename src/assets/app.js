/* Page behaviour: makes the pre-rendered calculator live, switches questions, closes the sticky ad. */
(function () {
  var B = window.Backsolve;
  var cfgEl = document.getElementById('calc-config');
  if (B && cfgEl) {
    var cfg = JSON.parse(cfgEl.textContent);
    var c = B.CALCS[cfg.calc];
    var vals = cfg.vals, solve = cfg.solve, say = cfg.say, last = null;
    var fieldsEl = document.getElementById('fields'), answerEl = document.getElementById('answer');

    var update = function () {
      var r = B.renderAnswer(c, solve, say, vals);
      answerEl.className = 'answer' + (r.ok ? '' : ' bad');
      answerEl.innerHTML = r.html;
      last = r.ok ? r.value : null;
    };
    fieldsEl.addEventListener('input', function (e) {
      var i = e.target.closest('input'); if (!i) return;
      vals[i.dataset.f] = B.num(i.value); update();
    });
    document.querySelectorAll('.alt').forEach(function (b) {
      b.addEventListener('click', function () {
        if (last !== null) vals[solve] = +last.toFixed(2);
        solve = b.dataset.solve; say = b.dataset.say;
        document.querySelectorAll('.alt').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        fieldsEl.innerHTML = B.renderFields(c, solve, vals);
        update();
      });
    });
    update();
  }
  var sticky = document.querySelector('.sticky-ad');
  if (sticky) sticky.querySelector('button').addEventListener('click', function () { sticky.remove(); document.body.classList.remove('has-sticky'); });
})();
