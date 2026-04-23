/* ═══════════════════════════════════════════════════════════════
   ORACLE DES NOMBRES - Moteur de prédiction pseudo-scientifique
   ═══════════════════════════════════════════════════════════════

   AVERTISSEMENT TECHNIQUE : ce moteur est intentionnellement ridicule.
   Il produit des prédictions déterministes à partir de la date du tirage
   (même date = mêmes numéros), habillées d'un discours pseudo-astrologique
   et pseudo-scientifique. Cela n'a AUCUNE valeur prédictive.

   Les tirages EuroMillions sont indépendants et uniformément aléatoires
   (χ² = 53.0 sur 1939 tirages observés, dans l'IC 95% d'un processus
   parfaitement aléatoire). Cet outil est une parodie.
   ═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────
// PRNG déterministe (Mulberry32)
// ─────────────────────────────────────────────
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = seed;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function dateToSeed(dateStr) {
  // Hash simple mais stable sur une chaîne ISO date
  let h = 2166136261;
  for (let i = 0; i < dateStr.length; i++) {
    h ^= dateStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ─────────────────────────────────────────────
// Astronomie (version "oracle", précision ~jour)
// ─────────────────────────────────────────────
const SYNODIC_MONTH = 29.530588853;
const REF_NEW_MOON_JD = 2451550.26;

function julianDate(date) {
  let y = date.getUTCFullYear();
  let m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5 + 0.5;
}

function moonAge(date) {
  const jd = julianDate(date);
  let age = (jd - REF_NEW_MOON_JD) % SYNODIC_MONTH;
  if (age < 0) age += SYNODIC_MONTH;
  return age;
}

function moonPhase(age) {
  const phases = [
    ["🌑", "Nouvelle Lune"],
    ["🌒", "Premier Croissant"],
    ["🌓", "Premier Quartier"],
    ["🌔", "Gibbeuse Croissante"],
    ["🌕", "Pleine Lune"],
    ["🌖", "Gibbeuse Décroissante"],
    ["🌗", "Dernier Quartier"],
    ["🌘", "Dernier Croissant"],
  ];
  const idx = Math.floor(((age + SYNODIC_MONTH / 16) % SYNODIC_MONTH) / (SYNODIC_MONTH / 8));
  return phases[idx % 8];
}

const ZODIAC = [
  { name: "Capricorne", sym: "♑", from: [12, 22], to: [1, 19], element: "Terre", planet: "Saturne" },
  { name: "Verseau",    sym: "♒", from: [1, 20],  to: [2, 18], element: "Air",   planet: "Uranus"  },
  { name: "Poissons",   sym: "♓", from: [2, 19],  to: [3, 20], element: "Eau",   planet: "Neptune" },
  { name: "Bélier",     sym: "♈", from: [3, 21],  to: [4, 19], element: "Feu",   planet: "Mars"    },
  { name: "Taureau",    sym: "♉", from: [4, 20],  to: [5, 20], element: "Terre", planet: "Vénus"   },
  { name: "Gémeaux",    sym: "♊", from: [5, 21],  to: [6, 20], element: "Air",   planet: "Mercure" },
  { name: "Cancer",     sym: "♋", from: [6, 21],  to: [7, 22], element: "Eau",   planet: "Lune"    },
  { name: "Lion",       sym: "♌", from: [7, 23],  to: [8, 22], element: "Feu",   planet: "Soleil"  },
  { name: "Vierge",     sym: "♍", from: [8, 23],  to: [9, 22], element: "Terre", planet: "Mercure" },
  { name: "Balance",    sym: "♎", from: [9, 23],  to: [10, 22], element: "Air",  planet: "Vénus"   },
  { name: "Scorpion",   sym: "♏", from: [10, 23], to: [11, 21], element: "Eau",  planet: "Pluton"  },
  { name: "Sagittaire", sym: "♐", from: [11, 22], to: [12, 21], element: "Feu",  planet: "Jupiter" },
];

function zodiacForDate(date) {
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  for (const z of ZODIAC) {
    if ((m === z.from[0] && d >= z.from[1]) || (m === z.to[0] && d <= z.to[1])) {
      return z;
    }
  }
  return ZODIAC[0]; // fallback Capricorne
}

// "Mercure rétrograde" pseudo-aléatoire mais déterministe par trimestre
// (en vrai Mercure rétrograde ~3x par an pendant ~3 semaines, mais on simplifie)
function mercuryRetrograde(date) {
  const year = date.getUTCFullYear();
  const doy = Math.floor((date - new Date(Date.UTC(year, 0, 0))) / 86400000);
  // 3 périodes de 21 jours par an, position variable selon l'année
  const rand = mulberry32(year);
  for (let i = 0; i < 3; i++) {
    const start = Math.floor(rand() * 100) + i * 110;
    if (doy >= start && doy < start + 21) return true;
  }
  return false;
}

// "Planète dominante" du jour (bidon mais cohérent)
const PLANETS = ["Soleil", "Lune", "Mars", "Mercure", "Jupiter", "Vénus", "Saturne"];
function dominantPlanet(date) {
  // Jour de la semaine : les jours sont liés aux planètes dans l'astrologie classique
  // (lundi = Lune, mardi = Mars, mercredi = Mercure, jeudi = Jupiter, vendredi = Vénus,
  //  samedi = Saturne, dimanche = Soleil)
  const weekday = date.getUTCDay();
  const mapping = [0, 1, 2, 3, 4, 5, 6]; // dim, lun, mar, mer, jeu, ven, sam
  return PLANETS[mapping[weekday]];
}

// Biorythmes (total fumage d'oeil, mais c'est ça qui est drôle)
function biorhythm(date, type) {
  // Cycle de référence depuis une date arbitraire
  const ref = new Date(Date.UTC(2000, 0, 1));
  const days = Math.floor((date - ref) / 86400000);
  const periods = { physical: 23, emotional: 28, intellectual: 33, spiritual: 37 };
  return Math.sin(2 * Math.PI * days / periods[type]);
}

// ─────────────────────────────────────────────
// Vocabulaire flamboyant
// ─────────────────────────────────────────────
const ADJECTIFS = ["cosmique", "mystique", "sidéral", "ésotérique", "transcendant", "éthéré", "occulte", "numineux", "astral"];
const VERBES = ["révèle", "murmure", "proclame", "susurre", "dévoile", "annonce", "prophétise", "décrète"];
const CONCEPTS = ["aura vibratoire", "champ quantique numérologique", "alignement karmique", "conjonction fractale", "résonance harmonique", "matrice akashique", "flux d'énergie primordial"];

const PROPHETIES_TEMPLATES = [
  "Sous l'influence conjointe de {planet} et de la {phase}, le Grand Tout {verbe} ces nombres aux âmes éveillées.",
  "La configuration {adj} entre {zodiac} et {planet} active une {concept} favorable à l'émergence de ces chiffres.",
  "Lorsque {phase} rencontre {zodiac} dans le {element} primordial, {planet} {verbe} la combinaison gagnante des sphères.",
  "Les oscillations {adj} du {concept} lié à {planet} convergent en ces nombres, portés par la signature vibratoire de {zodiac}.",
  "En ce jour régi par {planet}, {phase} catalyse l'émergence d'une {concept} qui {verbe} ces nombres aux initiés.",
  "La dualité {adj} entre {element} et {planet} crée une fenêtre opportune ; {zodiac} {verbe} cette combinaison à l'univers.",
];

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function fillTemplate(tpl, ctx) {
  return tpl
    .replace("{phase}", ctx.phase)
    .replace("{planet}", ctx.planet)
    .replace("{zodiac}", ctx.zodiac)
    .replace("{element}", ctx.element)
    .replace(/{adj}/g, ctx.adj)
    .replace(/{verbe}/g, ctx.verbe)
    .replace(/{concept}/g, ctx.concept);
}

// ─────────────────────────────────────────────
// Génération des numéros
// ─────────────────────────────────────────────
function sample(rng, min, max, count) {
  const pool = [];
  for (let i = min; i <= max; i++) pool.push(i);
  // Fisher-Yates partiel
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rng() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).sort((a, b) => a - b);
}

// ─────────────────────────────────────────────
// L'oracle principal
// ─────────────────────────────────────────────
function oracle(dateStr) {
  const date = new Date(dateStr + "T12:00:00Z");
  const seed = dateToSeed(dateStr);
  const rng = mulberry32(seed);

  // Astronomie bidon
  const age = moonAge(date);
  const [phaseSym, phaseName] = moonPhase(age);
  const illumination = (1 - Math.cos(2 * Math.PI * age / SYNODIC_MONTH)) / 2;
  const zodiac = zodiacForDate(date);
  const planet = dominantPlanet(date);
  const retrograde = mercuryRetrograde(date);

  // Biorythmes
  const physical = biorhythm(date, 'physical');
  const emotional = biorhythm(date, 'emotional');
  const intellectual = biorhythm(date, 'intellectual');
  const spiritual = biorhythm(date, 'spiritual');

  // Tirage des numéros (en fait c'est juste le RNG seedé, mais chut)
  const mainNumbers = sample(rng, 1, 50, 5);
  const stars = sample(rng, 1, 12, 2);

  // Confidence totalement inventée mais qui varie entre 42% et 97% pour l'effet
  const confidence = Math.floor(42 + 55 * (0.5 + 0.5 * Math.sin(seed * 0.0001)));

  // La prophétie
  const ctx = {
    phase: `${phaseSym} ${phaseName}`,
    planet: planet,
    zodiac: `${zodiac.sym} ${zodiac.name}`,
    element: zodiac.element,
    adj: pick(rng, ADJECTIFS),
    verbe: pick(rng, VERBES),
    concept: pick(rng, CONCEPTS),
  };
  const prophecy = fillTemplate(pick(rng, PROPHETIES_TEMPLATES), ctx);

  // Le "raisonnement" détaillé
  const reasoning = [
    `Phase lunaire : ${phaseSym} ${phaseName} (illumination ${(illumination * 100).toFixed(1)}%)`,
    `Signe solaire : ${zodiac.sym} ${zodiac.name} — élément ${zodiac.element}, planète régente ${zodiac.planet}`,
    `Planète dominante du jour : ${planet}`,
    retrograde ? `⚠ Mercure en rétrogradation — méfiance sur le rang 3` : `Mercure en position directe — transmission claire`,
    `Biorythme physique : ${(physical * 100).toFixed(0)}% — ${physical > 0 ? 'phase ascendante' : 'phase descendante'}`,
    `Biorythme émotionnel : ${(emotional * 100).toFixed(0)}%`,
    `Biorythme intellectuel : ${(intellectual * 100).toFixed(0)}% ${intellectual > 0.7 ? '(exceptionnellement élevé)' : ''}`,
    `Biorythme spirituel : ${(spiritual * 100).toFixed(0)}%`,
    `Réseau neuronal quantique v47.2.1 — convergence après 8192 itérations fractales`,
    `Indice de confiance oracle : ${confidence}%`,
  ];

  return {
    date: dateStr,
    dateFormatted: date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    mainNumbers,
    stars,
    prophecy,
    reasoning,
    confidence,
    astro: { phaseName, phaseSym, illumination, zodiac, planet, retrograde },
  };
}

// ─────────────────────────────────────────────
// Helpers UI
// ─────────────────────────────────────────────
function renderBalls(mainNumbers, stars, mini = false) {
  const ballClass = mini ? 'mini-ball' : 'ball';
  const starClass = mini ? 'mini-ball star' : 'ball star';
  const sep = mini ? 'mini-separator' : 'ball-separator';

  const mainHtml = mainNumbers.map(n => `<span class="${ballClass}">${n}</span>`).join('');
  const starHtml = stars.map(n => `<span class="${starClass}">${n}</span>`).join('');
  return `${mainHtml}<span class="${sep}">✦</span>${starHtml}`;
}

function nextDraw(draws) {
  const today = new Date().toISOString().slice(0, 10);
  return draws.find(d => d >= today) || draws[0];
}

function daysBetween(dateStr) {
  const target = new Date(dateStr + "T12:00:00Z");
  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

function countdownText(dateStr) {
  const d = daysBetween(dateStr);
  if (d === 0) return "C'est ce soir — les astres s'alignent en ce moment même";
  if (d === 1) return "Demain — l'éther frémit déjà";
  if (d < 0) return `Tirage passé (il y a ${-d} jours)`;
  if (d < 7) return `Dans ${d} jours — les énergies convergent`;
  if (d < 30) return `Dans ${d} jours — patience, voyageur`;
  return `Dans ${d} jours — les étoiles tracent leur route`;
}
