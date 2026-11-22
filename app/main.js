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
const defaultData = () => ({ settings: { age: 4, dailyMin: 10, voice: true }, today: { date: todayStr(), ms: 0, extraMin: 0 }, games: {} });
function load() {
  const base = defaultData();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return base;
    const d = JSON.parse(raw) || {};
    const out = { ...base, ...d, settings: { ...base.settings, ...(d.settings || {}) }, today: { ...base.today, ...(d.today || {}) } };
    if (![3, 4, 5, 6].includes(out.settings.age)) out.settings.age = 4;
    if (![5, 10, 15, 20].includes(out.settings.dailyMin)) out.settings.dailyMin = 10;
    if (!out.games || typeof out.games !== 'object' || Array.isArray(out.games)) out.games = {};
    return out;
  } catch (e) { return base; }
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
  data.today.ms += Math.max(0, performance.now() - roundStart);
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
    say: voice.say, stopSpeech: voice.stop, sfx: voice.sfx,
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
function renderHome() {
  const age = data.settings.age;
  const over = timeLeft() <= 0;
  $('#games').innerHTML = GAMES.filter((g) => age >= g.ages[0] && age <= g.ages[1]).map((g) => {
    const sk = SKILLS[g.skill];
    return `<button class="gcard" type="button" role="listitem" data-id="${g.id}" style="--c:${sk.color}"${over ? ' disabled' : ''}>
      <span class="gthumb">${g.thumb()}</span><span class="gname">${g.title}</span><span class="gskill">${sk.name}</span></button>`;
  }).join('');
  $('#limit-msg').hidden = !over;
  $('#age-chips').innerHTML = [3, 4, 5, 6].map((n) => `<button class="chip" type="button" data-age="${n}" aria-pressed="${age === n}" aria-label="Umur ${n} tahun">${n}</button>`).join('');
  $('#home-note').textContent = `Prototaip v0.5 · ${GAMES.length} permainan · Tiada iklan · Data disimpan dalam peranti ini sahaja`;
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

/* ================= PARENT AREA ================= */
async function renderParent() {
  rollDay();
  const mods = await Promise.all(GAMES.map((g) => loadGame(g.id)));
  $('#parent-games').innerHTML = mods.map((game, i) => {
    const meta = GAMES[i], sk = SKILLS[meta.skill];
    const s = stateOf(game), p = game.parent;
    const rows = s.rounds.slice(-10).reverse();
    const stats = p.stats(s).map((x) => `<div class="stat"><b>${x.v}</b><span>${x.label}</span></div>`).join('');
    const table = rows.length
      ? `<div class="table-wrap"><table><thead><tr><th>Masa</th>${p.cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${
        rows.map((r) => `<tr><td>${fmtDate(r.t)}</td>${p.row(r).map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
      : '<p class="empty">Belum dimain. Rekod muncul selepas anak tamat satu pusingan.</p>';
    return `<details class="gsec" style="--c:${sk.color}"${i === 0 ? ' open' : ''}><summary><span class="sthumb">${meta.thumb()}</span><span class="stitle"><b>${meta.title}</b><span class="sub">${sk.name} · ${s.rounds.length} pusingan</span></span></summary>
      <div class="gsec-body"><div class="stats">${stats}</div><div class="explain">${p.explain}</div>${table}</div></details>`;
  }).join('');
  save();
  $('#set-age').value = String(data.settings.age);
  $('#set-limit').value = String(data.settings.dailyMin);
  $('#set-voice').checked = !!data.settings.voice;
  const dv = voice.deviceVoiceName();
  $('#voice-note').textContent = voice.hasRecorded()
    ? 'Suara: rakaman Bahasa Melayu.'
    : (dv ? `Rakaman suara belum dimuat. Guna suara peranti: ${dv}.` : 'Rakaman suara dimuat bila anak mula bermain. Arahan juga dipaparkan sebagai teks.');
  const usedMin = Math.floor(data.today.ms / 60000), totalMin = data.settings.dailyMin + data.today.extraMin;
  $('#today-info').textContent = `Hari ini: ${usedMin} daripada ${totalMin} minit digunakan (semua permainan).`;
  $('#reset-confirm').hidden = true; $('#btn-reset').hidden = false;
}
async function openParent() { await renderParent(); $('#parent').hidden = false; $('#parent-close').focus(); }
$('#parent-close').addEventListener('click', () => { $('#parent').hidden = true; renderHome(); });
$('#set-age').addEventListener('change', (e) => { setAge(Number(e.target.value)); renderParent(); });
$('#set-limit').addEventListener('change', (e) => { data.settings.dailyMin = Number(e.target.value); save(); renderParent(); });
$('#set-voice').addEventListener('change', (e) => { data.settings.voice = e.target.checked; save(); });
$('#btn-extend').addEventListener('click', () => { rollDay(); data.today.extraMin += 5; save(); renderParent(); });
$('#btn-reset').addEventListener('click', () => { $('#btn-reset').hidden = true; $('#reset-confirm').hidden = false; });
$('#btn-reset-no').addEventListener('click', () => { $('#reset-confirm').hidden = true; $('#btn-reset').hidden = false; });
$('#btn-reset-yes').addEventListener('click', () => { data = defaultData(); save(); renderParent(); });

/* ================= WIRING ================= */
$('#games').addEventListener('click', async (e) => {
  const b = e.target.closest('.gcard'); if (!b || b.disabled) return;
  voice.init(); // mesti dalam gerak isyarat pengguna supaya audio dibenarkan
  sessionRounds = 0;
  playRound(await loadGame(b.dataset.id));
});
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
