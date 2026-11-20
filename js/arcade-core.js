/* =========================================================
   ASTRO-matiks — Arcade (núcleo compartido)
   Lo usan arcade.html (hub), vidas.html y examen.html.
   - Estado y persistencia (localStorage)
   - Vidas estilo Duolingo
   - Generador infinito de ejercicios
   - Candado Pro: los módulos solo existen tras el pago
   ========================================================= */
const Arcade = (()=>{

/* ============ CONFIGURACIÓN (cámbiala para tus pruebas) ============ */
const CFG = {
  LIFE_MAX: 5,                   // vidas máximas
  REGEN_MS: 5 * 60 * 1000,       // 1 vida cada 5 min (pon 20000 para probar rápido)
  REFILL_COST: 40,               // puntos para comprar 1 vida
  XP_OK: 10,                     // puntos por acierto
  KEY: 'dojo-arcade-v1',
  MODES: [                       // modos del mini-examen
    { id:'rapido',   name:'Rápido',   q:5,  secs:5*60,  note:'5 preguntas · 5 min' },
    { id:'estandar', name:'Estándar', q:10, secs:10*60, note:'10 preguntas · 10 min' },
    { id:'largo',    name:'Largo',    q:20, secs:22*60, note:'20 preguntas · 22 min' }
  ]
};

/* ============ ESTADO ============ */
const DEF = { pts:0, lives:CFG.LIFE_MAX, t:Date.now(), best:0, bestPct:0, hist:[], solved:0, bestStreak:0, exams:0 };
let S;
try{ S = { ...DEF, ...JSON.parse(localStorage.getItem(CFG.KEY) || '{}') }; }catch(e){ S = { ...DEF }; }
const save = ()=>{ try{ localStorage.setItem(CFG.KEY, JSON.stringify(S)); }catch(e){} };

/* Pro: lee el comprobante que guarda checkout.html (vía js/pay.js) */
const isPro = ()=> typeof Pay !== 'undefined' && Pay.isPro();

/* Guardia: el examen solo se abre con Pro (el Modo Vidas es gratis; Pro = vidas infinitas) */
function guard(){
  if(!isPro()){ location.replace('arcade.html?bloqueado=1'); return false; }
  return true;
}

/* ============ UTILIDADES ============ */
const esc = s=> String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(m){
  const t = document.getElementById('toast'); if(!t) return;
  t.textContent = m; t.style.display = 'block';
  clearTimeout(toast._t); toast._t = setTimeout(()=> t.style.display = 'none', 5000);
}
const mmss = ms=>{ const s = Math.max(0, Math.ceil(ms/1000)); return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'); };

/* Tema claro/oscuro (comparte la clave con el resto del Dojo) */
function themeBtn(){
  const b = document.getElementById('btn-theme'); if(!b) return;
  b.onclick = ()=>{
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try{ localStorage.setItem('dojo-theme', next); }catch(e){}
  };
}

/* ============ VIDAS ============ */
function tick(){
  if(isPro()){ S.lives = CFG.LIFE_MAX; S.t = Date.now(); return false; }   // Pro: vidas infinitas
  if(S.lives >= CFG.LIFE_MAX){ S.t = Date.now(); return false; }
  const n = Math.floor((Date.now() - S.t) / CFG.REGEN_MS);
  if(n > 0){ S.lives = Math.min(CFG.LIFE_MAX, S.lives + n); S.t += n * CFG.REGEN_MS; save(); return true; }
  return false;
}
function loseLife(){
  if(isPro()) return;                                                     // Pro: no pierde vidas
  if(S.lives === CFG.LIFE_MAX) S.t = Date.now();
  S.lives = Math.max(0, S.lives - 1);
}
function buyLife(){
  if(S.lives >= CFG.LIFE_MAX || S.pts < CFG.REFILL_COST) return false;
  S.pts -= CFG.REFILL_COST; S.lives++; if(S.lives >= CFG.LIFE_MAX) S.t = Date.now();
  save(); return true;
}
const nextIn = ()=> Math.max(0, CFG.REGEN_MS - (Date.now() - S.t));
function heartsHTML(lostIdx){
  if(isPro()) return `<span class="hearts" aria-label="Vidas infinitas"><span class="full">♥</span> <b>∞</b></span>`;
  let h = '';
  for(let i=0;i<CFG.LIFE_MAX;i++) h += `<span class="${i < S.lives ? 'full' : 'empty'} ${i === lostIdx ? 'lost' : ''}">${i < S.lives ? '♥' : '♡'}</span>`;
  return `<span class="hearts" aria-label="${S.lives} de ${CFG.LIFE_MAX} vidas">${h}</span>`;
}

/* ============ GENERADOR INFINITO ============ */
const R = (a,b)=> a + Math.floor(Math.random()*(b-a+1));
const pick = a=> a[R(0, a.length-1)];
const shuffle = a=>{ a=[...a]; for(let i=a.length-1;i>0;i--){ const j=R(0,i); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n=> String(n).split('').map(d=>SUP[d]).join('');
const neg = s=> String(s).replace('-','−');
const cf = c=> c===1 ? '' : c===-1 ? '−' : neg(c);
const xp = n=> n===0 ? '' : n===1 ? 'x' : 'x'+sup(n);
const mono = (c,n)=> n===0 ? neg(c) : cf(c)+xp(n);
const poly = ts=> ts.filter(t=>t[0]!==0).map((t,i)=>{
  const s = mono(Math.abs(t[0]), t[1]);
  return i ? (t[0]<0 ? ' − ' : ' + ') + s : (t[0]<0 ? '−' : '') + s;
}).join('') || '0';

/* Cada generador devuelve { q, ok, bad:[3 errores típicos], why, ask? }.
   level 1 = básico, 2 = intermedio, 3 = avanzado. */
const GENS = [
  { level:1, name:'Regla de la potencia', fn(){
    const a=R(2,9), n=R(2,6);
    return { q:poly([[a,n]]), ok:poly([[a*n,n-1]]),
      bad:[poly([[a,n-1]]), poly([[a*n,n]]), poly([[n,n-1]])],
      why:`Regla de la potencia: el exponente baja multiplicando (${a}·${n} = ${a*n}) y al exponente se le resta 1.` };
  }},
  { level:1, name:'Polinomio', fn(){
    const a=R(2,5), n=R(2,4), b=R(-9,9)||3, c=R(-9,9)||2;
    return { q:poly([[a,n],[b,1],[c,0]]), ok:poly([[a*n,n-1],[b,0]]),
      bad:[poly([[a*n,n-1],[b,0],[c,0]]), poly([[a*n,n-1],[b,1]]), poly([[a,n-1],[b,0]])],
      why:`Se deriva término por término: la derivada de bx es b y la de una constante es 0.` };
  }},
  { level:1, name:'Logaritmo', fn(){
    const a=R(2,9);
    return { q:`${a}·ln(x)`, ok:`${a}/x`, bad:['1/x', `${a}/x²`, `${a}·x`],
      why:`La derivada de ln(x) es 1/x, y la constante ${a} sale multiplicando.` };
  }},
  { level:1, name:'Exponencial', fn(){
    const a=R(1,5), b=R(2,5);
    return { q:`${cf(a)}e^(${b}x)`, ok:`${cf(a*b)}e^(${b}x)`,
      bad:[`${cf(a)}e^(${b}x)`, `${cf(a*b)}x·e^(${b}x−1)`, `(${a}/${b})e^(${b}x)`],
      why:`La derivada de e^u es e^u·u′. El exponente no cambia y se multiplica por u′ = ${b}.` };
  }},
  { level:2, name:'Regla de la cadena', fn(){
    const a=R(2,4), b=R(1,6), n=R(2,5), inner=poly([[a,1],[b,0]]);
    const pw = m=> m===1 ? `(${inner})` : `(${inner})${sup(m)}`;
    return { q:pw(n), ok:`${a*n}${pw(n-1)}`,
      bad:[`${n}${pw(n-1)}`, `${a*n}${pw(n)}`, `${a}${pw(n-1)}`],
      why:`Regla de la cadena: derivas la potencia (${n}·(…)^${n-1}) y multiplicas por la derivada de lo de adentro (${a}). ${n}·${a} = ${a*n}.` };
  }},
  { level:2, name:'Trigonométrica', fn(){
    const a=R(1,5), b=R(2,5), s=pick(['sen','cos']), arg=`${b}x`;
    if(s==='sen') return { q:`${cf(a)}sen(${arg})`, ok:`${cf(a*b)}cos(${arg})`,
      bad:[`${cf(a)}cos(${arg})`, `${cf(-a*b)}cos(${arg})`, `${cf(a*b)}sen(${arg})`],
      why:`La derivada de sen(u) es cos(u)·u′. Aquí u′ = ${b}, y ${a}·${b} = ${a*b}.` };
    return { q:`${cf(a)}cos(${arg})`, ok:`${cf(-a*b)}sen(${arg})`,
      bad:[`${cf(a*b)}sen(${arg})`, `${cf(-a)}sen(${arg})`, `${cf(-a*b)}cos(${arg})`],
      why:`La derivada de cos(u) es −sen(u)·u′. Aquí u′ = ${b}, y el signo negativo se conserva.` };
  }},
  { level:2, name:'Raíz cuadrada', fn(){
    const k=R(1,4), c=2*k;
    return { q:`${c}√x`, ok:`${k}/√x`, bad:[`${c}/√x`, `${k}√x`, `${k}/x`],
      why:`√x = x^(1/2), así que su derivada es (1/2)x^(−1/2) = 1/(2√x). Entonces ${c}·1/(2√x) = ${k}/√x.` };
  }},
  { level:2, name:'Tangente', fn(){
    const b=R(2,6);
    return { q:`tan(${b}x)`, ok:`${b}sec²(${b}x)`, bad:[`sec²(${b}x)`, `${b}tan(${b}x)`, `${b}sec(${b}x)`],
      why:`La derivada de tan(u) es sec²(u)·u′. Aquí u′ = ${b}.` };
  }},
  { level:2, name:'Cociente', fn(){
    const a=R(2,9);
    return { q:`x/(x + ${a})`, ok:`${a}/(x + ${a})²`,
      bad:[`1/(x + ${a})²`, `${a}/(x + ${a})`, `(2x + ${a})/(x + ${a})²`],
      why:`Regla del cociente: (u′v − uv′)/v². Con u = x y v = x + ${a}: ((x + ${a}) − x)/(x + ${a})² = ${a}/(x + ${a})².` };
  }},
  { level:3, name:'Regla del producto', fn(){
    const n=R(2,4), u=`x${sup(n)}`, du=`${n}${xp(n-1)}`;
    return { q:`${u}·sen(x)`, ok:`${du}·sen(x) + ${u}·cos(x)`,
      bad:[`${du}·cos(x)`, `${u}·cos(x)`, `${du}·sen(x) − ${u}·cos(x)`],
      why:`Regla del producto: (u·v)′ = u′·v + u·v′. No se deriva cada factor por separado.` };
  }},
  { level:3, name:'Logaritmo compuesto', fn(){
    const a=R(2,5), b=R(1,7), inner=`${a}x + ${b}`;
    return { q:`ln(${inner})`, ok:`${a}/(${inner})`,
      bad:[`1/(${inner})`, `${a}·(${inner})`, `${a}/x`],
      why:`La derivada de ln(u) es u′/u. Aquí u′ = ${a}, así que el resultado es ${a}/(${inner}).` };
  }},
  { level:3, name:'Exponencial compuesta', fn(){
    const n=R(2,5);
    return { q:`e^(${n}x²)`, ok:`${2*n}x·e^(${n}x²)`,
      bad:[`${n}x·e^(${n}x²)`, `e^(${2*n}x)`, `${2*n}e^(${n}x²)`],
      why:`La derivada de e^u es e^u·u′. Aquí u = ${n}x², así que u′ = ${2*n}x.` };
  }},
  { level:3, name:'Segunda derivada', fn(){
    const a=R(2,5), n=R(3,5);
    return { ask:'f″(x)', q:poly([[a,n]]), ok:poly([[a*n*(n-1), n-2]]),
      bad:[poly([[a*n, n-1]]), poly([[a*n, n-2]]), poly([[a*(n-1), n-2]])],
      why:`Se deriva dos veces: f′ = ${poly([[a*n,n-1]])} y luego f″ = ${poly([[a*n*(n-1),n-2]])} (${a*n}·${n-1} = ${a*n*(n-1)}).` };
  }},
  { level:3, name:'Pendiente en un punto', fn(){
    const a=R(1,4), b=R(-5,5)||1, c=R(1,4), ok=2*a*c+b;
    return { ask:`f′(${c})`, q:poly([[a,2],[b,1]]), ok:neg(ok),
      bad:[neg(a*c*c+b*c), neg(2*a*c), neg(a*c+b)],
      why:`Primero f′(x) = ${poly([[2*a,1],[b,0]])}. Luego se sustituye x = ${c}: ${2*a}·${c} ${b<0?'−':'+'} ${Math.abs(b)} = ${neg(ok)}.` };
  }}
];

function mk(g){
  for(let i=0;i<30;i++){
    const d = g.fn();
    if(new Set([d.ok, ...d.bad]).size === 4)
      return { q:d.q, ok:d.ok, why:d.why, ask:d.ask || 'f′(x)', topic:g.name, opts:shuffle([d.ok, ...d.bad]) };
  }
  return mk(GENS[0]);
}

/* Dificultad adaptativa para la práctica: sube con la racha de aciertos */
function levelFor(streak){ return streak < 3 ? 1 : streak < 7 ? 2 : 3; }
function nextExercise(streak, prevTopic){
  const lv = levelFor(streak);
  let pool = GENS.filter(g=> g.level <= lv);
  const top = pool.filter(g=> g.level === lv);
  pool = pool.concat(top);                         // el nivel actual pesa el doble
  const cand = pool.filter(g=> g.name !== prevTopic);
  return mk(pick(cand.length ? cand : pool));
}
/* Examen: reparte las preguntas entre todos los temas */
function examSet(n){
  const gs = shuffle(GENS);
  return Array.from({length:n}, (_,i)=> mk(gs[i % gs.length]));
}

/* ============ BARRA SUPERIOR ============ */
function topbar(opts = {}){
  const pro = isPro();
  return `<div class="bar">
    <a class="back" href="${opts.back || 'index.html'}">← ${opts.backLabel || 'Dojo'}</a>
    <span class="brand"><span class="mark">d/dx</span> ${opts.title || 'Arcade'}</span>
    <span class="chip" title="Puntos"><span class="ic">◆</span>${S.pts}</span>
    ${opts.extra || ''}
    <span class="pill ${pro ? 'pro' : ''}">${pro ? 'PRO' : 'GRATIS'}</span>
    <button class="theme-btn" id="btn-theme" type="button" aria-label="Cambiar tema" title="Tema claro / oscuro">◐</button>
  </div>`;
}

/* Ir a pagar (checkout simulado) y volver al Arcade ya desbloqueado */
function goPay(){ Pay.start('arcade.html').catch(e=> toast(e.message)); }

return { CFG, S:()=>S, save, isPro, guard, esc, toast, mmss, themeBtn, tick, loseLife, buyLife, nextIn,
         heartsHTML, GENS, mk, nextExercise, examSet, levelFor, topbar, goPay, R, pick, shuffle };
})();
