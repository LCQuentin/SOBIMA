/* ============================================================
   SOBIMA v3 — Simulateur de surface
   RATIOS PROVISOIRES — À VALIDER PAR REDOINE.
   m² de surface utile par poste, espaces communs compris.
   C'est le seul bloc à modifier pour changer les hypothèses.
   ============================================================ */
(function () {
  var TYPES = [
    { id: 'ferme', name: 'Bureaux fermés', min: 15, max: 20, who: 'Cabinets, directions, métiers confidentiels' },
    { id: 'open', name: 'Open space', min: 10, max: 12, who: 'PME, équipes projet, startups' },
    { id: 'dense', name: 'Dense, type centre d’appels', min: 7, max: 9, who: 'Plateaux de relation client, production' }
  ];
  var C = '#C49E5F', L = '#8A6E52';
  function desk(x, y, w, h) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="1" fill="' + C + '"/>'; }
  function frame(inner) { return '<svg viewBox="0 0 90 48" aria-hidden="true"><rect x="1" y="1" width="88" height="46" rx="4" fill="none" stroke="' + L + '" stroke-width="1.5"/>' + inner + '</svg>'; }
  var PICS = {
    ferme: frame('<path d="M30 1v46M60 1v46M1 24h88" fill="none" stroke="' + L + '" stroke-width="1.5"/>' + [11, 41, 71].map(function (x) { return desk(x, 9, 10, 6) + desk(x, 32, 10, 6); }).join('')),
    open: frame('<path d="M62 1v20h27" fill="none" stroke="' + L + '" stroke-width="1.5"/>' + [10, 24, 38].map(function (x) { return desk(x, 10, 10, 7) + desk(x, 30, 10, 7); }).join('') + '<rect x="68" y="30" width="14" height="10" rx="5" fill="none" stroke="' + C + '" stroke-width="1.5"/>'),
    dense: frame([8, 20, 32, 44, 56, 68].map(function (x) { return desk(x, 8, 9, 6) + desk(x, 20, 9, 6) + desk(x, 32, 9, 6); }).join(''))
  };
  var LIMITS = { surface: { min: 20, max: 5000, rmin: 50, rmax: 3000, step: 10 }, team: { min: 1, max: 500, rmin: 1, rmax: 300, step: 1 } };

  var root = document.querySelector('[data-sim]');
  if (!root) return;
  function $(id) { return document.getElementById(id); }
  function fmt(n) { return n.toLocaleString('fr-FR'); }
  function ceil5(x) { return Math.ceil(x / 5) * 5; }
  var state = { mode: 'surface', surface: 400, team: 40, type: 'open', presence: 100 };

  $('sim-types').innerHTML = TYPES.map(function (t) {
    return '<label class="v3-sim__type">' + PICS[t.id] + '<input type="radio" name="sim-type" id="sim-type-' + t.id + '" value="' + t.id + '"' + (t.id === state.type ? ' checked' : '') + '><b>' + t.name + '</b><small>' + t.min + ' à ' + t.max + ' m² / poste</small></label>';
  }).join('');
  var hyp = $('sim-hyp');
  if (hyp) hyp.innerHTML = TYPES.map(function (t) { return '<tr><td>' + t.name + '</td><td>' + t.min + ' à ' + t.max + ' m²</td><td>' + t.who + '</td></tr>'; }).join('');

  function syncInputs() {
    var l = LIMITS[state.mode], v = state[state.mode], s = state.mode === 'surface';
    var q = $('sim-qty'), r = $('sim-range');
    q.min = l.min; q.max = l.max; q.step = l.step; q.value = v;
    r.min = l.rmin; r.max = l.rmax; r.step = l.step; r.value = Math.min(Math.max(v, l.rmin), l.rmax);
    $('sim-qty-label').textContent = s ? 'Surface des bureaux' : 'Nombre de personnes à loger';
    $('sim-unit').textContent = s ? 'm²' : 'personnes';
    $('sim-qty-hint').textContent = s ? 'Surface utile du plateau, espaces communs compris.' : 'Effectif total, présents ou non.';
  }

  function compute() {
    var t = TYPES.filter(function (x) { return x.id === state.type; })[0], p = state.presence / 100, flex = p < 1;
    var suffix = flex ? ' · présence ' + state.presence + ' %' : '';
    if (state.mode === 'surface') {
      var lo = Math.floor(state.surface / t.max), hi = Math.floor(state.surface / t.min);
      return { t: t, lo: lo, hi: hi, unit: hi > 1 ? 'postes de travail' : 'poste de travail', label: 'Pour ' + fmt(state.surface) + ' m²',
        extra: flex ? 'En flex office à ' + state.presence + ' %, de quoi accueillir <strong>' + fmt(Math.floor(lo / p)) + ' à ' + fmt(Math.floor(hi / p)) + ' personnes</strong>.' : 'Un poste attitré par personne.',
        desks: [lo, hi], surface: fmt(state.surface) + ' m²',
        recap: fmt(state.surface) + ' m² · ' + t.name.toLowerCase() + ' · ' + fmt(lo) + ' à ' + fmt(hi) + ' postes' + suffix };
    }
    var posts = Math.max(1, Math.ceil(state.team * p)), a = ceil5(posts * t.min), b = ceil5(posts * t.max);
    return { t: t, lo: a, hi: b, unit: 'm² de surface utile', label: 'Pour ' + fmt(state.team) + ' personne' + (state.team > 1 ? 's' : ''),
      extra: flex ? 'En flex office à ' + state.presence + ' %, <strong>' + fmt(posts) + ' postes</strong> suffisent pour ' + fmt(state.team) + ' personnes.' : '<strong>' + fmt(posts) + ' postes</strong>, un par personne.',
      desks: [posts, posts], surface: fmt(a) + ' à ' + fmt(b) + ' m²',
      recap: fmt(state.team) + ' personnes · ' + t.name.toLowerCase() + ' · ' + fmt(a) + ' à ' + fmt(b) + ' m²' + suffix };
  }

  function render() {
    var r = compute(), CAP = 96, full = Math.min(r.desks[0], CAP), more = Math.min(r.desks[1], CAP) - full;
    $('sim-res-label').textContent = r.label;
    $('sim-big').innerHTML = r.lo === r.hi ? fmt(r.lo) : fmt(r.lo) + '<span>–</span>' + fmt(r.hi);
    $('sim-bigunit').textContent = r.unit;
    $('sim-extra').innerHTML = r.extra;
    $('sim-desks').innerHTML = new Array(full + 1).join('<i></i>') + new Array(Math.max(0, more) + 1).join('<i class="r"></i>') + (r.desks[1] > CAP ? '<span>+ ' + fmt(r.desks[1] - CAP) + ' postes</span>' : '');
    $('sim-assume').textContent = 'Hypothèse : ' + r.t.min + ' à ' + r.t.max + ' m² par poste en ' + r.t.name.toLowerCase() + ', espaces communs compris. Estimation indicative, à confirmer sur plan.';
    $('sim-presence-out').textContent = state.presence + ' %';
    $('sim-presence-hint').textContent = state.presence === 100 ? '100 % : un poste attitré par personne.' : state.presence + ' % : en moyenne, ' + state.presence + ' personnes sur 100 sont au bureau.';
    $('sim-cta').href = 'devis-contact.html?objet=test-fit&surface=' + encodeURIComponent(r.surface) + '&simulation=' + encodeURIComponent(r.recap) + '#nom';
  }

  function setQty(v) { var l = LIMITS[state.mode]; if (isFinite(v)) state[state.mode] = Math.min(Math.max(Math.round(v), l.min), l.max); }

  root.addEventListener('change', function (e) {
    if (e.target.name === 'sim-mode') { state.mode = e.target.value; syncInputs(); render(); }
    if (e.target.name === 'sim-type') { state.type = e.target.value; render(); }
  });
  $('sim-qty').addEventListener('input', function (e) { setQty(parseFloat(e.target.value)); $('sim-range').value = state[state.mode]; render(); });
  $('sim-qty').addEventListener('blur', function () { $('sim-qty').value = state[state.mode]; });
  $('sim-range').addEventListener('input', function (e) { setQty(parseFloat(e.target.value)); $('sim-qty').value = state[state.mode]; render(); });
  $('sim-presence').addEventListener('input', function (e) { state.presence = parseInt(e.target.value, 10); render(); });

  syncInputs(); render();
})();
