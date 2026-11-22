// Bunyi + suara. Utama: rakaman suara BM Malaysia (ElevenLabs "Hafiz"), dimuat per game bila dimain.
// Sandaran: suara peranti Bahasa Melayu (ms-*) sahaja; jika tiada, kapsyen sahaja.

// Baris yang dikongsi semua game (fail dalam kit/audio/).
export const SHARED_LINES = {
  start: 'Pandai! Sekarang kita main betul-betul.',
  bagus: 'Bagus!',
  pandainya: 'Pandainya!',
  'breath-in': 'Tarik nafas dalam-dalam…',
  'breath-out': 'Hembus perlahan-lahan…',
};

export function createVoice({ captionEl, voiceEnabled }) {
  let ac = null, master = null, muted = false, current = null, deviceVoice = null;
  const buffers = new Map(); // url → AudioBuffer (cache merentas game)
  const pending = new Map(); // url → Promise
  let lines = { ...SHARED_LINES };
  let urlOf = Object.fromEntries(Object.keys(SHARED_LINES).map((k) => [k, `kit/audio/${k}.mp3`]));

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = .9; master.connect(ac.destination);
    } catch (e) { ac = null; }
  }

  function loadUrl(url) {
    if (!ac) return Promise.resolve();
    if (buffers.has(url)) return Promise.resolve();
    if (!pending.has(url)) {
      pending.set(url, (async () => {
        try {
          const res = await fetch(url);
          if (res.ok) buffers.set(url, await ac.decodeAudioData(await res.arrayBuffer()));
        } catch (e) { /* fail dihilangkan: sandaran di bawah */ }
      })());
    }
    return pending.get(url);
  }

  // Tukar ke baris game ini dan mula muat rakamannya. Pulangkan Promise yang selesai bila semua dimuat.
  function use(game) {
    lines = { ...SHARED_LINES, ...game.lines };
    urlOf = Object.fromEntries(Object.keys(SHARED_LINES).map((k) => [k, `kit/audio/${k}.mp3`]));
    for (const k of game.recorded) urlOf[k] = `games/${game.id}/audio/${k}.mp3`;
    return Promise.all(Object.values(urlOf).map(loadUrl));
  }

  function tone(f, dur, { type = 'triangle', gain = .18, when = 0 } = {}) {
    if (!ac || muted) return;
    const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05);
  }
  function noise(sec, { type, from, to, gain }) {
    if (!ac || muted) return;
    const t = ac.currentTime, len = Math.max(1, Math.floor(ac.sampleRate * sec));
    const buf = ac.createBuffer(1, len, ac.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = type;
    f.frequency.setValueAtTime(from, t); f.frequency.linearRampToValueAtTime(to, t + sec * .5); f.frequency.linearRampToValueAtTime(from, t + sec);
    const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(gain, t + sec * .2); g.gain.linearRampToValueAtTime(.0001, t + sec);
    src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t + sec);
  }
  const sfx = {
    good() { tone(523.25, .22); tone(659.25, .3, { when: .11 }); tone(783.99, .42, { when: .22, gain: .14 }); },
    soft() { tone(392, .25, { type: 'sine', gain: .12 }); tone(330, .35, { type: 'sine', gain: .12, when: .18 }); },
    light() { tone(1046.5, .08, { type: 'sine', gain: .06 }); },
    pop() { tone(660, .12, { type: 'sine', gain: .1 }); },
    car(sec) { noise(sec, { type: 'lowpass', from: 300, to: 1100, gain: .07 }); },
    rustle() { noise(.35, { type: 'bandpass', from: 2400, to: 2800, gain: .12 }); },
  };

  function pickDeviceVoice() {
    try { deviceVoice = window.speechSynthesis.getVoices().find((v) => /^ms/i.test(v.lang)) || null; } catch (e) { deviceVoice = null; }
  }
  if ('speechSynthesis' in window) { pickDeviceVoice(); try { window.speechSynthesis.addEventListener('voiceschanged', pickDeviceVoice); } catch (e) { /* pelayar lama */ } }

  function stop() {
    if (current) { try { current.stop(); } catch (e) { /* sudah berhenti */ } current = null; }
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* abaikan */ }
  }

  // Papar kapsyen (ikon pilihan) dan mainkan baris. Pulangkan tempoh (ms) supaya urutan boleh tunggu suara habis.
  function say(key, icon) {
    const text = lines[key] || '';
    const cap = captionEl();
    if (cap) {
      cap.textContent = text;
      if (icon) cap.insertAdjacentHTML('afterbegin', `<span class="cap-ico" aria-hidden="true">${icon}</span>`);
    }
    const estimate = 600 + text.length * 55;
    if (muted || !voiceEnabled()) return estimate;
    stop();
    const buf = buffers.get(urlOf[key]);
    if (buf && ac && master) {
      try {
        const src = ac.createBufferSource(); src.buffer = buf; src.connect(master); src.start();
        current = src;
        return Math.round(buf.duration * 1000);
      } catch (e) { /* jatuh ke sandaran */ }
    }
    if (deviceVoice) {
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.voice = deviceVoice; u.lang = deviceVoice.lang; u.rate = .95; u.pitch = 1.1;
        window.speechSynthesis.speak(u);
      } catch (e) { /* kapsyen tetap dipapar */ }
    }
    return estimate;
  }

  return {
    init, use, say, stop, sfx, tone,
    setMuted(m) { muted = m; if (m) stop(); },
    isMuted: () => muted,
    hasRecorded: () => buffers.size > 0,
    deviceVoiceName: () => (deviceVoice ? deviceVoice.name : null),
  };
}
