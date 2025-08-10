// ===== Smooth scroll to #about (Button im Hero) =====
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
  });
});

// ===== Ambient Audio: starts after first user interaction; mute toggle + hotkey 'M' =====
const ambient = document.getElementById('ambient');
const muteBtn  = document.getElementById('muteBtn');
let audioOn = (localStorage.getItem('gb_audio_on') ?? 'true') === 'true';

function applyAudioState(){
  muteBtn.textContent = audioOn ? '🔊' : '🔈';
  muteBtn.setAttribute('aria-pressed', String(!audioOn));
  if (!ambient) return;
  if (audioOn) { ambient.volume = 0.38; ambient.play().catch(()=>{}); }
  else { ambient.pause(); }
}
document.addEventListener('pointerdown', () => { if (audioOn) ambient.play().catch(()=>{}); }, { once:true });
muteBtn.addEventListener('click', ()=>{ audioOn = !audioOn; localStorage.setItem('gb_audio_on', String(audioOn)); applyAudioState(); });
document.addEventListener('keydown', e => { if (e.key.toLowerCase() === 'm') muteBtn.click(); });
applyAudioState();

// ===== Parallax: subtle move of the background image =====
const bgImage = document.querySelector('.bg-image');
let px=0, py=0;
document.addEventListener('mousemove', (e)=>{
  const tx = (e.clientX / innerWidth - 0.5) * 14; // target shift
  const ty = (e.clientY / innerHeight - 0.5) * 14;
  px += (tx - px) * 0.08;
  py += (ty - py) * 0.08;
  bgImage.style.transform = `translate(${px}px, ${py}px) scale(1.03)`;
});

// ===== Snow System (two layers) =====
class SnowField{
  constructor(canvas, opts){
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = Object.assign({count:150, size:[0.6,2.2], speed:[20,60], wind:[-10,10], opacity:[0.25,0.85]}, opts||{});
    this.flakes = [];
    this.resize();
    this.spawn();
    this.last = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }
  rand(a,b){ return a + Math.random()*(b-a); }
  resize(){
    this.c.width = innerWidth; this.c.height = innerHeight;
  }
  spawn(){
    const {count,size,opacity} = this.opts;
    this.flakes.length = 0;
    for(let i=0;i<count;i++){
      this.flakes.push({
        x: Math.random()*this.c.width,
        y: Math.random()*this.c.height,
        r: this.rand(size[0], size[1]),
        o: this.rand(opacity[0], opacity[1]),
        drift: Math.random()*Math.PI*2,
      });
    }
  }
  loop(t){
    const dt = (t - this.last)/1000; this.last = t;
    const {speed, wind} = this.opts;
    const vx = this.rand(wind[0], wind[1]) * 0.02; // gentle wind variability
    const vy = this.rand(speed[0], speed[1]) * dt;
    const {ctx, c} = this;
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle = '#fff';
    for(const f of this.flakes){
      // update
      f.x += vx + Math.sin(f.drift)*0.2;
      f.y += vy*(0.3 + f.r*0.35);
      f.drift += 0.02;

      // wrap
      if (f.y > c.height) { f.y = -5; f.x = Math.random()*c.width; }
      if (f.x > c.width+5) f.x = -5; else if (f.x < -5) f.x = c.width+5;

      // draw (soft circle)
      ctx.globalAlpha = f.o;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(this.loop.bind(this));
  }
}

const snowBack  = new SnowField(document.getElementById('snowBack'),  { count: 180, size:[0.6,1.6], speed:[12,28],  wind:[-6,6],  opacity:[0.10,0.35] });
const snowFront = new SnowField(document.getElementById('snowFront'), { count: 120, size:[1.2,2.6], speed:[28,60],  wind:[-14,14], opacity:[0.35,0.85] });

addEventListener('resize', ()=>{ snowBack.resize(); snowFront.resize(); });

// ===== Little entrance fades =====
document.querySelector('.logo')?.addEventListener('load', ()=>{
  document.body.classList.add('ready');
});

// === i18n ===
const I18N = {
  de: {
    subtitle: `Ein sauberes Sci-Fi Action-RPG: 16 Zonen, Bossfights, Holo-Hub.<br/>Aktiviere das <strong>Core-Protokoll</strong> – bald.`,
    more: "Mehr erfahren",
    aboutTitle: "Was ist GENEBLADE?",
    aboutText: "GENEBLADE ist ein stilfokussiertes Sci-Fi-Action-RPG in Unreal Engine 5. Du erkundest 16 eigenständige Zonen – jede mit eigener Atmosphäre, Mechaniken und Bossfights – und schaltest mit jedem Run neue Wege, Moves und Ausrüstung frei. Im Holo-Hub bereitest du Builds vor, trainierst Movement, nimmst Aufträge an und triffst LYZRA: eine Mentorin-KI, die dich durch Lore, Systeme und Entscheidungen führt. Der Fokus liegt auf sauberem, schnellen Gameplay: klare Ziele, lesbare Kämpfe, präzises Movement und Progression ohne Grind-Zwang. Alle Kosmetiks sind rein In-Game erspielbar; kein Echtgeld-Shop, keine Paywalls. Ob du für perfekte Zeiten routest, Bosse zerlegst oder die Alte Geschichte von GENEBLADE Stück für Stück entschlüsselst – jede Zone belohnt Können, Neugier und Style.",
    releaseTitle: "Wann kommt GENEBLADE?",
    releaseText: `Noch nicht so lange bis 1&nbsp;Jahr – aber <strong>Soon...</strong>.<br>
                  Wir arbeiten mit Hochdruck an 16 Zonen, schnellem Movement und Bossfights.<br>
                  Die erste spielbare Version lässt dich bald ins Core-Protokoll eintreten.`
  },
  en: {
    subtitle: `A clean sci-fi action RPG: 16 zones, boss fights, holo-hub.<br/>Activate the <strong>Core Protocol</strong> — soon.`,
    more: "Learn more",
    aboutTitle: "What is GENEBLADE?",
    aboutText: "GENEBLADE is a style-driven sci-fi action RPG built in Unreal Engine 5. Explore 16 distinct zones—each with its own atmosphere, mechanics, and boss fights—while unlocking routes, movement options, and gear run by run. The Holo-Hub is your base to craft builds, practice movement, accept contracts, and meet LYZRA, a mentor-AI guiding you through lore, systems, and choices. The focus is clean, fast gameplay: readable combat, precise movement, and progression without forced grind. All cosmetics are earned in-game only—no real-money shop, no paywalls. Whether you route for best times, dismantle bosses, or unravel the Old Story of GENEBLADE piece by piece, every zone rewards skill, curiosity, and style.",
    releaseTitle: "When is GENEBLADE coming?",
    releaseText: `Not too long — roughly within the next year, <strong>soon...</strong>.<br>
                  We’re pushing on 16 zones, fast movement and boss fights.<br>
                  The first playable build will let you enter the Core Protocol soon.`
  }
};

// Elemente cachen
const tEls = {
  subtitle:      document.getElementById("t-subtitle"),
  more:          document.getElementById("t-more"),
  aboutTitle:    document.getElementById("t-about-title"),
  aboutText:     document.getElementById("t-about-text"),
  releaseTitle:  document.getElementById("t-release-title"), // neu
  releaseText:   document.getElementById("t-release-text")   // neu
};

const langBtns = document.querySelectorAll(".lang-btn");

// Sprache setzen
function setLang(lang){
  const dict = I18N[lang] || I18N.de;

  if (tEls.subtitle)      tEls.subtitle.innerHTML  = dict.subtitle;   // enthält HTML
  if (tEls.more)          tEls.more.textContent    = dict.more;
  if (tEls.aboutTitle)    tEls.aboutTitle.textContent = dict.aboutTitle;
  if (tEls.aboutText)     tEls.aboutText.textContent  = dict.aboutText;
  if (tEls.releaseTitle)  tEls.releaseTitle.textContent = dict.releaseTitle; // neu
  if (tEls.releaseText)   tEls.releaseText.innerHTML   = dict.releaseText;   // enthält HTML

  document.documentElement.setAttribute("lang", lang);
  langBtns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  try { localStorage.setItem("lang", lang); } catch {}
}


// Klick-Handler
langBtns.forEach(btn => btn.addEventListener("click", () => setLang(btn.dataset.lang)));

// Initialsprache: localStorage → Browser → de
const stored = (()=>{ try { return localStorage.getItem("lang"); } catch { return null; } })();
const nav    = (navigator.language || "de").slice(0,2).toLowerCase();
setLang(stored && I18N[stored] ? stored : (I18N[nav] ? nav : "de"));

// Jahr automatisch
document.getElementById('year').textContent = new Date().getFullYear();

// in I18N.de / I18N.en ergänzen:
I18N.de.connect = "VERBINDE DICH MIT GENEBLADE";
I18N.en.connect = "CONNECT WITH GENEBLADE";
I18N.de.support = "Support"; I18N.en.support = "Support";
I18N.de.press = "Presse";   I18N.en.press = "Press";
I18N.de.terms = "Nutzungsbedingungen"; I18N.en.terms = "Terms of Use";
I18N.de.privacy = "Datenschutzerklärung"; I18N.en.privacy = "Privacy Policy";
I18N.de.eula = "EULA"; I18N.en.eula = "EULA";
I18N.de.cookies = "Cookie‑Einstellungen"; I18N.en.cookies = "Cookie settings";

// und in setLang() nach deinen anderen Zuweisungen:
const el = id => document.getElementById(id);
el("t-connect")      && (el("t-connect").textContent = I18N[lang].connect);
el("t-support")      && (el("t-support").textContent = I18N[lang].support);
el("t-press")        && (el("t-press").textContent   = I18N[lang].press);
el("t-terms")        && (el("t-terms").textContent   = I18N[lang].terms);
el("t-privacy")      && (el("t-privacy").textContent = I18N[lang].privacy);
el("t-eula")         && (el("t-eula").textContent    = I18N[lang].eula);
el("t-cookies")      && (el("t-cookies").textContent = I18N[lang].cookies);

// ===== Energy Field (futuristische Partikel) =====
(function () {
  const cvs = document.getElementById('fxEnergy');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');

  // Respektiere reduzierte Bewegung
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const isMobile = matchMedia('(max-width: 600px)').matches;
  const COUNT = isMobile ? 60 : 120;
  const SPEED = 0.6;
  const RADIUS = Math.min(innerWidth, innerHeight) * 0.45;

  let w = 0, h = 0, cx = 0, cy = 0, t = 0;
  let particles = [];
  let parallax = { x: 0, y: 0, tx: 0, ty: 0 };

  function resize() {
    w = cvs.width = innerWidth;
    h = cvs.height = innerHeight;
    cx = w * 0.52;
    cy = h * 0.46;
  }
  resize();
  addEventListener('resize', resize);

  function rand(a, b) { return a + Math.random() * (b - a); }

  function init() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      const r = rand(RADIUS * 0.15, RADIUS);
      particles.push({
        r,
        a: rand(0, Math.PI * 2),
        s: rand(0.3, 1.2),
        hue: rand(190, 205),
        life: rand(0.4, 1),
      });
    }
  }
  init();

  addEventListener('mousemove', (e) => {
    parallax.tx = (e.clientX / w - 0.5) * 30;
    parallax.ty = (e.clientY / h - 0.5) * 30;
  });

  function loop(ts) {
    t = ts * 0.001;
    parallax.x += (parallax.tx - parallax.x) * 0.06;
    parallax.y += (parallax.ty - parallax.y) * 0.06;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    for (const p of particles) {
      p.a += (SPEED * p.s) * 0.01;

      const ex = Math.cos(p.a) * p.r * 1.05 + parallax.x;
      const ey = Math.sin(p.a * 1.03) * p.r * 0.65 + parallax.y;
      const x = cx + ex, y = cy + ey;

      const size = (1 + Math.sin(t * 2 + p.r * 0.002)) * 0.8 + 0.6;

      const g = ctx.createRadialGradient(x, y, 0, x, y, 22);
      g.addColorStop(0, `hsla(${p.hue}, 85%, 65%, ${0.35 * p.life})`);
      g.addColorStop(1, `hsla(${p.hue}, 95%, 55%, 0)`);

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 1.8 * size, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `hsla(${p.hue}, 90%, 70%, ${0.18 * p.life})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - ex * 0.02, y - ey * 0.02);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
