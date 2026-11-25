// Shell aplikasi: laman utama, sesi permainan, keputusan, tarik nafas, misi, parental gate, zon ibu bapa.
// Setiap game ialah modul dalam games/<id>/index.js yang hanya mengandungi mekaniknya (lihat games/README.md).
import { ART_DEFS, BALLOON_SVG, HAND_SVG } from './kit/art.js';
import { createVoice, SHARED_LINES } from './kit/voice.js';
import { CANCEL, sleep, anim, todayStr, toPct, shuffle, fmtDate, meter } from './kit/util.js';
import { GAMES, SKILLS } from './games/registry.js';

const $ = (s) => document.querySelector(s);
const STORE_KEY = 'rangsang-minda.v1';
const MAX_ROUNDS_PER_SESSION = 3;
const ROUNDS_KEPT = 200;

/* ================= STORAGE ================= */
// Satu stor untuk semua game: tetapan, masa hari ini (dikongsi), dan keadaan setiap game di bawah games[id].
const defaultData = () => ({ settings: { age: 4, dailyMin: 10, voice: true, name: '' }, today: { date: todayStr(), ms: 0, extraMin: 0 }, days: {}, games: {} });
// Bersihkan data (dari storan atau fail sandaran): hanya bentuk yang dijangka diterima.
const SAFE_KEY = /^[A-Za-z0-9_-]{1,40}$/;
const SAFE_STR = /^[\p{L}\p{N} _.,:'()/+-]{0,60}$/u; // tiada < > & " supaya tiada HTML boleh menyusup ke jadual ibu bapa
function clean(v, depth = 0) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  if (typeof v === 'boolean' || v === null) return v;
  if (typeof v === 'string') return SAFE_STR.test(v) ? v : undefined;
  if (depth >= 4) return undefined;
  if (Array.isArray(v)) return v.slice(0, 300).map((x) => clean(x, depth + 1)).filter((x) => x !== undefined);
  if (typeof v === 'object') {
    const o = {};
    for (const [k, x] of Object.entries(v).slice(0, 80)) { if (SAFE_KEY.test(k)) { const c = clean(x, depth + 1); if (c !== undefined) o[k] = c; } }
    return o;
  }
  return undefined;
}
function normalizeData(d, { strict = false } = {}) {
  const base = defaultData();
  if (!d || typeof d !== 'object') return base;
  const out = { ...base, ...d, settings: { ...base.settings, ...(d.settings || {}) }, today: { ...base.today, ...(d.today || {}) } };
  if (![3, 4, 5, 6].includes(out.settings.age)) out.settings.age = 4;
  if (![5, 10, 15, 20].includes(out.settings.dailyMin)) out.settings.dailyMin = 10;
  out.settings.voice = out.settings.voice !== false;
  if (typeof out.settings.name !== 'string') out.settings.name = '';
  out.settings.name = out.settings.name.slice(0, 20);
  if (!out.games || typeof out.games !== 'object' || Array.isArray(out.games)) out.games = {};
  if (!out.days || typeof out.days !== 'object' || Array.isArray(out.days)) out.days = {};
  if (strict) {
    // Fail luar: simpan hanya game yang wujud, nilai primitif selamat, dan hari bertarikh sah.
    const games = {};
    for (const g of GAMES) if (out.games[g.id] && typeof out.games[g.id] === 'object') games[g.id] = clean(out.games[g.id]);
    out.games = games;
    out.days = Object.fromEntries(Object.entries(out.days).filter(([k, v]) => /^\d{4}-\d{2}-\d{2}$/.test(k) && Number.isFinite(v) && v >= 0));
    const st = out.settings;
    // Hanya kunci yang dikenali; had masa hari ini kekal milik peranti ini.
    return {
      settings: { age: st.age, dailyMin: st.dailyMin, voice: st.voice, name: SAFE_STR.test(st.name) ? st.name : '' },
      today: { date: todayStr(), ms: 0, extraMin: 0 }, days: out.days, games: out.games,
    };
  }
  return out;
}
function load() {
  try { const raw = localStorage.getItem(STORE_KEY); return raw ? normalizeData(JSON.parse(raw)) : defaultData(); }
  catch (e) { return defaultData(); }
}
let data = load();
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) { /* storan tiada: main tetap berjalan */ } }
function rollDay() { if (data.today.date !== todayStr()) { data.today = { date: todayStr(), ms: 0, extraMin: 0 }; save(); } }
const limitMs = () => (data.settings.dailyMin + data.today.extraMin) * 60000;
const timeLeft = () => { rollDay(); return limitMs() - data.today.ms; };

/* ================= GAMES ================= */
const modules = new Map();
const metaOf = (id) => GAMES.find((g) => g.id === id);
async function loadGame(id) {
  if (!modules.has(id)) modules.set(id, (await metaOf(id).load()).default);
  return modules.get(id);
}
// Keadaan game: dicipta/dibetulkan oleh modul itu sendiri (normalize menyemak data lama atau rosak dan perubahan umur).
function stateOf(game) {
  const age = data.settings.age;
  let s = data.games[game.id];
  if (!s || typeof s !== 'object' || Array.isArray(s)) s = game.initState(age);
  s = game.normalize(s, age);
  if (!Array.isArray(s.rounds)) s.rounds = [];
  data.games[game.id] = s;
  return s;
}

/* ================= AUDIO + VOICE ================= */
const voice = createVoice({ captionEl: () => $('#stage .caption'), voiceEnabled: () => !!data.settings.voice });
document.body.insertAdjacentHTML('afterbegin', ART_DEFS);
$('#balloon').innerHTML = BALLOON_SVG;

/* ================= SCREENS ================= */
const SCREENS = ['home', 'game', 'result', 'breathe', 'mission'];
function show(name) {
  SCREENS.forEach((s) => { $('#scr-' + s).hidden = s !== name; });
  if (name === 'game') fitStage();
}
function fitStage() {
  const r = $('#stage-wrap').getBoundingClientRect();
  if (!r.width || !r.height) return;
  const stage = $('#stage');
  const w = Math.floor(Math.min(r.width, r.height * 2 / 3));
  stage.style.width = w + 'px'; stage.style.height = Math.floor(w * 1.5) + 'px';
  stage.style.setProperty('--u', (w / 100) + 'px');
}
window.addEventListener('resize', fitStage);

/* ================= SESSION ================= */
let active = null;       // { game, abort } pusingan / rehat yang sedang berjalan
let lastGame = null;     // game terakhir dimain: untuk "Main lagi", "Rehat" dan misi
let sessionRounds = 0;   // pusingan dalam sesi game semasa (had MAX_ROUNDS_PER_SESSION)
let roundStart = 0;
let resultToken = null;

function cancelActive() { if (active) { active.abort.abort(); active = null; } }
function addPlayTime() {
  if (!roundStart) return;
  rollDay();
  const ms = Math.max(0, performance.now() - roundStart);
  data.today.ms += ms;
  // Sejarah minit harian untuk laporan mingguan (simpan 60 hari).
  const d = todayStr();
  data.days[d] = (data.days[d] || 0) + ms;
  Object.keys(data.days).sort().slice(0, -60).forEach((k) => delete data.days[k]);
  roundStart = 0; save();
}

// Tunggu tekanan dalam pentas. Selesai dengan { el, t } atau null (tamat masa / dibatalkan).
function waitTap(signal, { root, selector = null, ms = 0, event = 'click', keys = [] }) {
  return new Promise((resolve) => {
    let done = false, timer = null;
    const finish = (v) => {
      if (done) return; done = true; clearTimeout(timer);
      root.removeEventListener(event, onEv); document.removeEventListener('keydown', onKey); signal.removeEventListener('abort', onAbort);
      resolve(v);
    };
    const onEv = (e) => {
      const el = selector ? e.target.closest(selector) : root;
      if (!el || !root.contains(el) || el.disabled) return;
      if (event === 'pointerdown') e.preventDefault();
      finish({ el, t: performance.now() });
    };
    const onKey = (e) => { if (keys.includes(e.code)) { e.preventDefault(); finish({ el: root, t: performance.now() }); } };
    const onAbort = () => finish(null);
    if (ms) timer = setTimeout(() => finish(null), ms);
    root.addEventListener(event, onEv);
    if (keys.length) document.addEventListener('keydown', onKey);
    signal.addEventListener('abort', onAbort);
  });
}

// Konteks yang diberi kepada game.round(): semua yang game perlukan, tiada akses terus ke shell.
function makeCtx(game, state, signal, loading) {
  const stage = $('#stage');
  const alive = () => { if (signal.aborted) throw CANCEL; };
  const handEl = () => stage.querySelector('.hand');
  return {
    stage, state, signal, alive,
    age: data.settings.age,
    first: sessionRounds === 0,
    ready: () => Promise.race([loading, sleep(4000)]),
    say: voice.say, stopSpeech: voice.stop, sfx: voice.sfx, mixer: voice.mixer,
    wait: async (ms) => { await sleep(ms); alive(); },
    anim,
    caption(text) { const c = stage.querySelector('.caption'); if (c) c.textContent = text; },
    hand: {
      show(left, top) { Object.assign(handEl().style, { left: left + '%', top: top + '%' }); handEl().hidden = false; },
      hide() { handEl().hidden = true; },
    },
    progress(total, gaps = []) {
      $('#progress').innerHTML = Array.from({ length: total }, (_, i) => `<i${gaps.includes(i) ? ' class="gap"' : ''}></i>`).join('');
    },
    mark(i) { const el = $('#progress').children[i]; if (el) el.classList.add('done'); },
    toPct: (r) => toPct(stage, r),
    async tap(opts) { const v = await waitTap(signal, { root: stage, ...opts }); alive(); return v; },
    save,
  };
}

function mountStage(game) {
  const stage = $('#stage');
  $('#game-css').textContent = game.css || '';
  stage.setAttribute('aria-label', game.stageLabel || game.title);
  stage.innerHTML = game.stageHtml() + `<div class="hand" hidden aria-hidden="true">${HAND_SVG}</div><div class="caption" aria-live="polite"></div>`;
  $('#progress').innerHTML = '';
}

async function playRound(game) {
  voice.init();
  if (timeLeft() <= 0) { goHome(); return; }
  cancelActive();
  const abort = new AbortController();
  active = { game, abort };
  lastGame = game;
  const state = stateOf(game);
  show('game'); mountStage(game);
  const loading = voice.use(game);
  roundStart = performance.now();
  try {
    const res = await game.round(makeCtx(game, state, abort.signal, loading));
    addPlayTime();
    state.rounds.push({ t: Date.now(), ...res.record });
    if (state.rounds.length > ROUNDS_KEPT) state.rounds = state.rounds.slice(-ROUNDS_KEPT);
    save();
    sessionRounds++;
    showResult(game, res);
  } catch (e) {
    if (e !== CANCEL) throw e;
  } finally {
    addPlayTime();
    if (active && active.abort === abort) active = null;
  }
}

function showResult(game, res) {
  $('#res-extra').innerHTML = res.extraHtml || '';
  $('#found').innerHTML = res.foundHtml || '';
  $('#result-text').innerHTML = res.text || '';
  $('#btn-again').hidden = !(sessionRounds < MAX_ROUNDS_PER_SESSION && timeLeft() > 0);
  show('result');
  if (res.onShow) res.onShow($('#scr-result'));
  const ms = voice.say('end');
  const token = resultToken = {};
  // Baris susulan (contoh: "Wah, kawan baharu!") hanya jika anak masih di skrin keputusan.
  if (res.followUp) setTimeout(() => { if (resultToken === token && !$('#scr-result').hidden) voice.say(res.followUp); }, ms + 300);
}

async function breathe(game) {
  cancelActive();
  const abort = new AbortController();
  active = { game, abort };
  show('breathe');
  const b = $('#balloon'), txt = $('#breath-text');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = async (key, from, to) => {
    voice.say(key);
    txt.textContent = SHARED_LINES[key];
    if (!reduce) anim(b, [{ transform: `scale(${from})` }, { transform: `scale(${to})` }], { duration: 4000 });
    await sleep(4000);
    if (abort.signal.aborted) throw CANCEL;
  };
  try {
    for (let i = 0; i < 3; i++) { await step('breath-in', 1, 1.9); await step('breath-out', 1.9, 1); }
    txt.textContent = '';
    showMission(game);
  } catch (e) { if (e !== CANCEL) throw e; }
}

function showMission(game) {
  const m = game.mission;
  $('#mission-title').textContent = m.title;
  $('#mission-steps').innerHTML = m.steps.map((s) => `<li>${s}</li>`).join('');
  $('#mission-why').textContent = m.why;
  show('mission');
}

function goHome() {
  cancelActive();
  voice.stop();
  resultToken = null;
  sessionRounds = 0;
  renderHome(); show('home');
}

/* ================= HOME ================= */
const DAY = 86400000;
let skillFilter = 'semua'; // penapis bidang (sesi semasa sahaja)
const roundsOf = (id) => (Array.isArray(data.games[id]?.rounds) ? data.games[id].rounds : []);
const playedToday = (id) => roundsOf(id).some((r) => todayStr(new Date(r.t)) === todayStr());
// Rawak berbiji: pilihan hari ini kekal sama sepanjang hari (dan bertukar esok).
function seeded(seed) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}
// Cabaran hari ini: 3 game dari 3 bidang berbeza.
// 1) bidang yang paling kurang dilatih minggu ini · 2) game baharu (belum pernah dimain) atau lama tak dimain · 3) kegemaran (paling kerap 14 hari).
function pickToday(games) {
  const now = Date.now(), rnd = seeded(`${todayStr()}:${data.settings.age}`);
  const info = games.map((g) => { const r = roundsOf(g.id); return { g, n: r.length, last: r.length ? r[r.length - 1].t : 0, wk: r.filter((x) => now - x.t < 7 * DAY).length, fort: r.filter((x) => now - x.t < 14 * DAY).length, jitter: rnd() }; });
  const picks = [], used = new Set();
  const take = (cands, why) => { const c = cands.find((x) => !used.has(x.g.skill) && !picks.some((p) => p.id === x.g.id)); if (c) { picks.push({ id: c.g.id, why }); used.add(c.g.skill); } return !!c; };
  // 1) bidang paling kurang dilatih
  const bySkill = {};
  info.forEach((x) => { (bySkill[x.g.skill] ||= { wk: 0, jitter: rnd() }).wk += x.wk; });
  const weakSkill = Object.entries(bySkill).sort((a, b) => a[1].wk - b[1].wk || a[1].jitter - b[1].jitter)[0][0];
  take(info.filter((x) => x.g.skill === weakSkill).sort((a, b) => a.last - b.last || a.jitter - b.jitter), 'latih');
  // 2) baharu, atau paling lama tak dimain
  const fresh = info.filter((x) => x.n === 0).sort((a, b) => a.jitter - b.jitter);
  if (!take(fresh, 'baharu')) take([...info].sort((a, b) => a.last - b.last || a.jitter - b.jitter), 'lama');
  // 3) kegemaran (≥ 2 pusingan dalam 14 hari), jika tiada: pilihan rawak
  if (!take(info.filter((x) => x.fort >= 2).sort((a, b) => b.fort - a.fort || a.jitter - b.jitter), 'suka')) take([...info].sort((a, b) => a.jitter - b.jitter), 'cuba');
  return picks;
}
const WHY = { latih: (g) => `Latih ${SKILLS[g.skill].name.toLowerCase()}`, baharu: () => 'Baharu!', lama: () => 'Lama tak main', suka: () => 'Kegemaran', cuba: () => 'Cuba ini' };
function gameCard(g, over, extra = '') {
  const sk = SKILLS[g.skill], done = playedToday(g.id);
  return `<button class="gcard${done ? ' played' : ''}" type="button" role="listitem" data-id="${g.id}" style="--c:${sk.color}"${over ? ' disabled' : ''} aria-label="${g.title}${done ? ', dah dimain hari ini' : ''}">
      ${extra}<span class="gthumb">${g.thumb()}</span><span class="gname">${g.title}</span><span class="gskill">${sk.name}</span></button>`;
}
function renderHome() {
  rollDay();
  const age = data.settings.age;
  const over = timeLeft() <= 0;
  const games = GAMES.filter((g) => age >= g.ages[0] && age <= g.ages[1]);
  // Cabaran hari ini: disimpan untuk hari dan umur ini supaya tidak bertukar selepas anak bermain.
  if (!Array.isArray(data.today.picks) || data.today.picksAge !== age || data.today.picks.some((p) => !p || !WHY[p.why] || !games.some((g) => g.id === p.id))) {
    data.today.picks = pickToday(games); data.today.picksAge = age; save();
  }
  const picks = data.today.picks.map((p) => ({ ...p, g: metaOf(p.id) }));
  const doneN = picks.filter((p) => playedToday(p.id)).length;
  $('#today-cards').innerHTML = picks.map((p) => gameCard(p.g, over, `${playedToday(p.id) ? '<span class="tick" aria-hidden="true">✓</span>' : ''}`).replace('<span class="gskill">', `<span class="why">${WHY[p.why](p.g)}</span><span class="gskill" hidden>`)).join('');
  const prog = $('#today-progress');
  prog.textContent = doneN === picks.length ? 'Semua selesai! Hebat!' : `${doneN}/${picks.length} selesai`;
  prog.classList.toggle('done', doneN === picks.length);
  // Semua permainan, ikut penapis bidang.
  const skills = Object.keys(SKILLS).filter((k) => games.some((g) => g.skill === k));
  if (skillFilter !== 'semua' && !skills.includes(skillFilter)) skillFilter = 'semua';
  const chipRow = $('#skill-chips'), keepX = chipRow.scrollLeft;
  chipRow.innerHTML = [`<button class="schip" type="button" data-skill="semua" aria-pressed="${skillFilter === 'semua'}">Semua</button>`,
    ...skills.map((k) => `<button class="schip" type="button" data-skill="${k}" style="--c:${SKILLS[k].color}" aria-pressed="${skillFilter === k}"><i aria-hidden="true"></i>${SKILLS[k].name}</button>`)].join('');
  chipRow.scrollLeft = keepX;
  const shown = games.filter((g) => skillFilter === 'semua' || g.skill === skillFilter);
  $('#games').innerHTML = shown.map((g) => gameCard(g, over)).join('');
  $('#all-count').textContent = `${shown.length} permainan`;
  $('#limit-msg').hidden = !over;
  $('#age-chips').innerHTML = [3, 4, 5, 6].map((n) => `<button class="chip" type="button" data-age="${n}" aria-pressed="${age === n}" aria-label="Umur ${n} tahun">${n}</button>`).join('');
  $('#home-note').textContent = `Prototaip v0.6 · ${GAMES.length} permainan · Tiada iklan · Data disimpan dalam peranti ini sahaja`;
}
function setAge(n) {
  if (data.settings.age === n) return;
  data.settings.age = n; save(); renderHome(); // setiap game menyesuaikan tahap sendiri melalui normalize()
}

/* ================= PARENTAL GATE ================= */
let gateAnswer = 0;
function newGateQ() {
  const a = 6 + Math.floor(Math.random() * 4), b = 3 + Math.floor(Math.random() * 7);
  gateAnswer = a * b;
  $('#gate-q').textContent = `${a} × ${b} = ?`;
  $('#gate-answers').innerHTML = shuffle([gateAnswer, gateAnswer + a, gateAnswer - b]).map((o) => `<button type="button" data-v="${o}">${o}</button>`).join('');
}
function openGate() { $('#gate-msg').textContent = ''; newGateQ(); $('#gate').hidden = false; $('#gate-answers button')?.focus(); }
$('#gate-answers').addEventListener('click', (e) => {
  const btn = e.target.closest('button'); if (!btn) return;
  if (Number(btn.dataset.v) === gateAnswer) { $('#gate').hidden = true; openParent(); }
  else { $('#gate-msg').textContent = 'Belum betul. Cuba soalan lain.'; newGateQ(); }
});
$('#gate-close').addEventListener('click', () => { $('#gate').hidden = true; });


/* ================= LAPORAN MINGGUAN ================= */
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lvOf = (meta) => meta.lv || ['level', 1, 4];
// Penguasaan game: kedudukan tahap semasa dalam julat game itu (0–1). null jika belum dimain.
function mastery(meta) {
  const s = data.games[meta.id];
  if (!s || !Array.isArray(s.rounds) || !s.rounds.length) return null;
  const [key, lo, hi] = lvOf(meta), v = Number(s[key]);
  if (!Number.isFinite(v) || hi <= lo) return null;
  return Math.min(1, Math.max(0, (v - lo + 1) / (hi - lo + 1)));
}
function weekReport(mods) {
  const DAYMS = 86400000, now = Date.now();
  const week = Array.from({ length: 7 }, (_, i) => todayStr(new Date(now - i * DAYMS)));
  const inWeek = (t) => week.includes(todayStr(new Date(t)));
  const games = GAMES.map((meta, i) => {
    const rounds = Array.isArray(data.games[meta.id]?.rounds) ? data.games[meta.id].rounds : [];
    const wk = rounds.filter((r) => inWeek(r.t));
    const [key] = lvOf(meta);
    const firstLv = wk.length && Number.isFinite(Number(wk[0][key])) ? Number(wk[0][key]) : null;
    const nowLv = Number(data.games[meta.id]?.[key]);
    return { meta, mod: mods[i], wk: wk.length, total: rounds.length, m: mastery(meta), up: firstLv !== null && Number.isFinite(nowLv) && nowLv > firstLv ? { from: firstLv, to: nowLv } : null };
  });
  const activeDays = week.filter((d) => GAMES.some((g) => (data.games[g.id]?.rounds || []).some((r) => todayStr(new Date(r.t)) === d)));
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = todayStr(new Date(now - i * DAYMS));
    const played = GAMES.some((g) => (data.games[g.id]?.rounds || []).some((r) => todayStr(new Date(r.t)) === d));
    if (played) streak++; else if (i > 0) break; // hari ini belum main tidak memutuskan rentetan
  }
  const minutes = Math.round(week.reduce((a, d) => a + (data.days[d] || 0), 0) / 60000);
  const skills = Object.keys(SKILLS).map((k) => {
    const gs = games.filter((g) => g.meta.skill === k);
    const ms = gs.map((g) => g.m).filter((m) => m !== null);
    return { k, name: SKILLS[k].name, color: SKILLS[k].color, wk: gs.reduce((a, g) => a + g.wk, 0), m: ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length : null, games: gs };
  });
  const rounds = games.reduce((a, g) => a + g.wk, 0);
  // Cerapan: kekuatan, naik tahap, perlu perhatian (dengan cadangan game + misi rumah).
  // Kekuatan hanya dituntut bila ada bukti cukup (≥ 3 pusingan dalam bidang itu).
  const tried = skills.filter((x) => x.m !== null && x.games.reduce((t, g) => t + g.total, 0) >= 3);
  const strong = tried.length ? [...tried].sort((a, b) => b.m - a.m || b.wk - a.wk)[0] : null;
  const ups = games.filter((g) => g.up).sort((a, b) => (b.up.to - b.up.from) - (a.up.to - a.up.from));
  const weak = [...skills].sort((a, b) => (a.wk - b.wk) || ((a.m ?? -1) - (b.m ?? -1)))[0];
  const weakGame = [...weak.games].sort((a, b) => a.total - b.total)[0];
  return { week, activeDays: activeDays.length, streak, minutes, rounds, skills, strong, ups, weak, weakGame };
}
function renderReport(mods) {
  const R = weekReport(mods), name = data.settings.name.trim();
  const who = name ? esc(name) : 'Anak';
  const lines = [];
  if (R.strong && R.strong.m >= .5) lines.push(`<li><b>Kekuatan:</b> ${esc(R.strong.name)}. ${who} sudah di ${Math.round(R.strong.m * 100)}% laluan tahap dalam bidang ini.</li>`);
  if (R.ups.length) lines.push(`<li><b>Naik tahap:</b> ${R.ups.slice(0, 3).map((g) => `${esc(g.meta.title)} (${g.up.from} → ${g.up.to})`).join(', ')}.</li>`);
  if (R.weakGame) {
    const mis = R.weakGame.mod?.mission;
    lines.push(`<li><b>Perlu perhatian:</b> ${esc(R.weak.name)}${R.weak.wk ? ` (hanya ${R.weak.wk} pusingan)` : ' (belum dimain minggu ini)'}. Cuba <b>${esc(R.weakGame.meta.title)}</b>${mis ? `, dan di rumah: <i>${esc(mis.title)}</i>` : ''}.</li>`);
  }
  const head = R.rounds
    ? `Minggu ini ${who} bermain <b>${R.activeDays} hari</b>, <b>${R.rounds} pusingan</b>${R.minutes ? ` (± ${R.minutes} minit)` : ''}.`
    : `${who} belum bermain minggu ini. Cabaran hari ini di laman utama ialah tempat yang baik untuk mula.`;
  $('#report').innerHTML = `
    <div class="rep-head"><h3>Laporan minggu ini</h3><span class="rep-badge">7 hari terakhir</span></div>
    <p class="rep-sum">${head}</p>
    <div class="rep-kpis">
      <div class="stat"><b>${R.activeDays}<small>/7</small></b><span>Hari aktif</span></div>
      <div class="stat"><b>${R.streak}</b><span>Hari berturut-turut</span></div>
      <div class="stat"><b>${R.rounds}</b><span>Pusingan</span></div>
    </div>
    <div class="rep-days" aria-label="Hari aktif minggu ini">${[...R.week].reverse().map((d) => {
      const on = GAMES.some((g) => (data.games[g.id]?.rounds || []).some((r) => todayStr(new Date(r.t)) === d));
      const dt = new Date(d + 'T12:00:00');
      return `<span class="rep-day${on ? ' on' : ''}" title="${d}"><i></i>${dt.toLocaleDateString('ms-MY', { weekday: 'short' }).slice(0, 3)}</span>`;
    }).join('')}</div>
    <div class="rep-skills">${R.skills.map((x) => `<div class="rep-skill" style="--c:${x.color}">
      <span class="rep-name">${esc(x.name)}</span>
      <span class="rep-bar" role="img" aria-label="${esc(x.name)}: ${x.m === null ? 'belum dicuba' : Math.round(x.m * 100) + '% laluan tahap'}"><i style="width:${x.m === null ? 0 : Math.max(4, Math.round(x.m * 100))}%"></i></span>
      <span class="rep-val">${x.m === null ? 'Belum' : Math.round(x.m * 100) + '%'}<small>${x.wk ? ` · ${x.wk}×` : ''}</small></span></div>`).join('')}</div>
    <p class="sub rep-note">Bar = kedudukan tahap kesukaran semasa dalam setiap bidang (purata game yang pernah dimain). "3×" = pusingan minggu ini.</p>
    ${lines.length ? `<ul class="rep-insights">${lines.join('')}</ul>` : ''}
    <div class="rep-actions"><button class="btn-sm go" id="btn-share" type="button">Kongsi laporan</button><span class="sub" id="share-msg" role="status"></span></div>`;
  $('#btn-share').addEventListener('click', () => shareReport(R, name));
}
async function shareReport(R, name) {
  const who = name || 'Anak saya';
  const bars = R.skills.filter((x) => x.m !== null).sort((a, b) => b.m - a.m).map((x) => `• ${x.name}: ${Math.round(x.m * 100)}%`).join('\n');
  const text = `Laporan Rangsang Minda minggu ini\n${who} bermain ${R.activeDays} hari, ${R.rounds} pusingan${R.minutes ? ` (± ${R.minutes} minit)` : ''}.\n${bars ? `\nTahap ikut bidang:\n${bars}\n` : ''}${R.weakGame ? `\nFokus minggu depan: ${R.weak.name} (${R.weakGame.meta.title}).` : ''}`;
  const msg = $('#share-msg');
  try {
    if (navigator.share) { await navigator.share({ title: 'Laporan Rangsang Minda', text }); msg.textContent = ''; return; }
    await navigator.clipboard.writeText(text);
    msg.textContent = 'Laporan disalin. Tampal dalam WhatsApp atau e-mel.';
  } catch (e) {
    if (e && e.name === 'AbortError') return; // pengguna batal kongsi
    msg.textContent = 'Tidak dapat berkongsi pada peranti ini.';
  }
}

/* ================= PARENT AREA ================= */
async function renderParent() {
  rollDay();
  const mods = await Promise.all(GAMES.map((g) => loadGame(g.id)));
  mods.forEach((m) => stateOf(m)); // pastikan keadaan setiap game sah sebelum laporan
  renderReport(mods);
  $('#parent-games').innerHTML = mods.map((game, i) => {
    const meta = GAMES[i], sk = SKILLS[meta.skill];
    const s = stateOf(game), p = game.parent;
    const rows = s.rounds.slice(-10).reverse();
    const stats = p.stats(s).map((x) => `<div class="stat"><b>${x.v}</b><span>${x.label}</span></div>`).join('');
    const table = rows.length
      ? `<div class="table-wrap"><table><thead><tr><th>Masa</th>${p.cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${
        rows.map((r) => `<tr><td>${fmtDate(r.t)}</td>${p.row(r).map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
      : '<p class="empty">Belum dimain. Rekod muncul selepas anak tamat satu pusingan.</p>';
    return `<details class="gsec" style="--c:${sk.color}"><summary><span class="sthumb">${meta.thumb()}</span><span class="stitle"><b>${meta.title}</b><span class="sub">${sk.name} · ${s.rounds.length} pusingan</span></span></summary>
      <div class="gsec-body"><div class="stats">${stats}</div><div class="explain">${p.explain}</div>${table}</div></details>`;
  }).join('');
  save();
  $('#set-age').value = String(data.settings.age);
  $('#set-name').value = data.settings.name;
  $('#set-limit').value = String(data.settings.dailyMin);
  $('#set-voice').checked = !!data.settings.voice;
  const dv = voice.deviceVoiceName();
  $('#voice-note').textContent = voice.hasRecorded()
    ? 'Suara: rakaman Bahasa Melayu.'
    : (dv ? `Rakaman suara belum dimuat. Guna suara peranti: ${dv}.` : 'Rakaman suara dimuat bila anak mula bermain. Arahan juga dipaparkan sebagai teks.');
  const usedMin = Math.floor(data.today.ms / 60000), totalMin = data.settings.dailyMin + data.today.extraMin;
  $('#today-info').textContent = `Hari ini: ${usedMin} daripada ${totalMin} minit digunakan (semua permainan).`;
  $('#reset-confirm').hidden = true; $('#btn-reset').hidden = false;
  $('#restore-confirm').hidden = true; pendingRestore = null;
  renderBackupInfo();
}
async function openParent() { await renderParent(); $('#parent').hidden = false; $('#parent-close').focus(); }
$('#parent-close').addEventListener('click', () => { $('#parent').hidden = true; renderHome(); });
$('#set-age').addEventListener('change', (e) => { setAge(Number(e.target.value)); renderParent(); });
$('#set-limit').addEventListener('change', (e) => { data.settings.dailyMin = Number(e.target.value); save(); renderParent(); });
$('#set-name').addEventListener('change', (e) => { data.settings.name = e.target.value.trim().slice(0, 20); save(); renderParent(); });
$('#set-voice').addEventListener('change', (e) => { data.settings.voice = e.target.checked; save(); });
$('#btn-extend').addEventListener('click', () => { rollDay(); data.today.extraMin += 5; save(); renderParent(); });
$('#btn-reset').addEventListener('click', () => { $('#btn-reset').hidden = true; $('#reset-confirm').hidden = false; });
$('#btn-reset-no').addEventListener('click', () => { $('#reset-confirm').hidden = true; $('#btn-reset').hidden = false; });
$('#btn-reset-yes').addEventListener('click', () => { data = defaultData(); save(); renderParent(); });


/* ================= SANDARAN & PULIH ================= */
// Data hanya dalam peranti ini; sandaran ialah satu fail JSON yang ibu bapa simpan sendiri (cth. hantar ke WhatsApp sendiri).
const BACKUP_APP = 'rangsang-minda', BACKUP_V = 1, BACKUP_MAX_BYTES = 5 * 1024 * 1024;
// Dalam paparan claude.ai, fail disimpan melalui keupayaan "downloads"; di luar (laman sendiri) guna muat turun biasa.
let dlCap = null;
if (window.claude?.use) window.claude.use('downloads').then((d) => { dlCap = d; }).catch(() => {});
const roundCount = (d) => Object.values(d.games || {}).reduce((a, g) => a + (Array.isArray(g?.rounds) ? g.rounds.length : 0), 0);
function backupBlob() {
  const json = JSON.stringify({ app: BACKUP_APP, v: BACKUP_V, at: new Date().toISOString(), data });
  const name = `rangsang-minda-sandaran-${todayStr()}.json`;
  return { json, name };
}
function markBackedUp(msg) { data.lastBackup = Date.now(); save(); $('#backup-msg').textContent = msg; renderBackupInfo(); }
async function doBackup() {
  const { json, name } = backupBlob(), msg = $('#backup-msg');
  if (dlCap) {
    try { await dlCap.save({ filename: name, data: json }); markBackedUp(`Sandaran disimpan: ${name}`); }
    catch (e) { msg.textContent = e?.code === 'declined' ? 'Sandaran dibatalkan.' : 'Tidak dapat menyimpan fail di sini. Buka aplikasi dalam pelayar untuk menyimpan sandaran.'; }
    return;
  }
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  markBackedUp(`Sandaran dimuat turun: ${name}. Simpan di tempat selamat (cth. hantar ke WhatsApp sendiri).`);
}
async function doShareBackup() {
  const { json, name } = backupBlob(), msg = $('#backup-msg');
  try {
    await navigator.share({ files: [new File([json], name, { type: 'application/json' })], title: 'Sandaran Rangsang Minda' });
    markBackedUp('Sandaran dikongsi. Simpan fail itu, contohnya dalam WhatsApp atau e-mel sendiri.');
  } catch (e) { if (e?.name !== 'AbortError') msg.textContent = 'Tidak dapat berkongsi fail pada peranti ini. Guna "Simpan sandaran".'; }
}
let pendingRestore = null;
async function onRestoreFile(file) {
  const msg = $('#backup-msg');
  $('#restore-confirm').hidden = true; pendingRestore = null;
  if (!file) return;
  if (file.size > BACKUP_MAX_BYTES) { msg.textContent = 'Fail terlalu besar untuk sandaran Rangsang Minda.'; return; }
  let env;
  try { env = JSON.parse(await file.text()); } catch (e) { msg.textContent = 'Fail ini bukan sandaran Rangsang Minda (format tidak dikenali).'; return; }
  if (!env || env.app !== BACKUP_APP || typeof env.v !== 'number' || !env.data || typeof env.data !== 'object') { msg.textContent = 'Fail ini bukan sandaran Rangsang Minda.'; return; }
  if (env.v > BACKUP_V) { msg.textContent = 'Sandaran ini dari versi aplikasi yang lebih baharu. Kemas kini aplikasi dahulu.'; return; }
  const incoming = normalizeData(env.data, { strict: true });
  const when = Date.parse(env.at);
  pendingRestore = incoming;
  const nGames = Object.values(incoming.games).filter((g) => Array.isArray(g?.rounds) && g.rounds.length).length;
  $('#restore-summary').textContent = `Sandaran ${Number.isFinite(when) ? fmtDate(when) : ''}: ${roundCount(incoming)} pusingan dalam ${nGames} permainan, umur ${incoming.settings.age}${incoming.settings.name ? `, nama ${incoming.settings.name}` : ''}. Data dalam peranti ini (${roundCount(data)} pusingan) akan diganti.`;
  $('#restore-confirm').hidden = false;
  msg.textContent = '';
}
function applyRestore() {
  if (!pendingRestore) return;
  data = { ...pendingRestore, lastBackup: Date.now() };
  pendingRestore = null;
  save();
  renderParent();
  $('#backup-msg').textContent = 'Data berjaya dipulihkan.';
}
function renderBackupInfo() {
  const t = data.lastBackup, rounds = roundCount(data);
  const old = !t || Date.now() - t > 14 * 86400000;
  const el = $('#backup-info');
  el.textContent = t ? `Sandaran terakhir: ${fmtDate(t)}.` : 'Belum pernah disimpan.';
  el.classList.toggle('warn', old && rounds >= 10);
  if (old && rounds >= 10) el.textContent += ` Ada ${rounds} pusingan yang belum disandarkan; simpan sandaran sekarang.`;
  $('#btn-share-backup').hidden = !(navigator.canShare && !dlCap && navigator.canShare({ files: [new File(['{}'], 'x.json', { type: 'application/json' })] }));
}
$('#btn-backup').addEventListener('click', doBackup);
$('#btn-share-backup').addEventListener('click', doShareBackup);
$('#btn-restore').addEventListener('click', () => { $('#restore-file').value = ''; $('#restore-file').click(); });
$('#restore-file').addEventListener('change', (e) => onRestoreFile(e.target.files?.[0]));
$('#btn-restore-yes').addEventListener('click', applyRestore);
$('#btn-restore-no').addEventListener('click', () => { pendingRestore = null; $('#restore-confirm').hidden = true; $('#backup-msg').textContent = 'Pemulihan dibatalkan.'; });

/* ================= WIRING ================= */
$('#skill-chips').addEventListener('click', (e) => {
  const b = e.target.closest('[data-skill]'); if (!b) return;
  skillFilter = b.dataset.skill; renderHome();
});
async function onCardClick(e) {
  const b = e.target.closest('.gcard'); if (!b || b.disabled) return;
  voice.init(); // mesti dalam gerak isyarat pengguna supaya audio dibenarkan
  sessionRounds = 0;
  playRound(await loadGame(b.dataset.id));
}
$('#games').addEventListener('click', onCardClick);
$('#today-cards').addEventListener('click', onCardClick);
$('#btn-again').addEventListener('click', () => { if (active === null && lastGame) playRound(lastGame); });
$('#btn-rest').addEventListener('click', () => { if (lastGame) breathe(lastGame); });
$('#btn-done').addEventListener('click', goHome);
$('#btn-home').addEventListener('click', goHome);
$('#btn-parent').addEventListener('click', openGate);
$('#age-chips').addEventListener('click', (e) => { const b = e.target.closest('[data-age]'); if (b) setAge(Number(b.dataset.age)); });
$('#btn-mute').addEventListener('click', () => {
  voice.setMuted(!voice.isMuted());
  const btn = $('#btn-mute'), m = voice.isMuted();
  btn.setAttribute('aria-pressed', String(m));
  btn.setAttribute('aria-label', m ? 'Hidupkan bunyi' : 'Senyapkan bunyi');
  btn.style.opacity = m ? '.5' : '1';
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('#gate').hidden) $('#gate').hidden = true;
  else if (!$('#parent').hidden) { $('#parent').hidden = true; renderHome(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden && !$('#scr-game').hidden) goHome(); });


renderHome();
show('home');
