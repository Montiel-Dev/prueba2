/* =========================================================
   ASTRO-matiks — Planes de estudio por institución
   El contenido (BLOCKS en data.js) no cambia. Un plan es solo
   una "lente": define las UNIDADES de tu institución, en su orden
   oficial, y qué bloques del Dojo cubren cada una.

   - Unidad con `blocks`  → ya tiene lecciones y ejercicios.
   - Unidad sin `blocks`  → aparece en tu plan, con sus temas, marcada
                             "Próximamente" (aquí se agregará contenido).
   - Unidad con `extra`   → refuerzo que va más allá de tu programa.

   Para agregar contenido a una unidad: crea el bloque en data.js y
   pon su id en `blocks` de la unidad correspondiente.
   Para registrar el programa específico de un plantel o estado: añade
   un plan nuevo en PLANS y apúntalo en INSTITUTIONS[..].resolve().
   ========================================================= */

const PLANS = {
  /* Sin institución: el recorrido original del Dojo */
  libre: {
    name: "Recorrido libre (todos los bloques)",
    status: "libre",
    source: "Orden original del Dojo.",
    units: null
  },

  /* Bachillerato — Pensamiento Matemático III (MCCEMS 2023).
     Basado en las 15 progresiones de aprendizaje del programa de la DGB/SEP
     (3.er semestre), agrupadas por tema y en el mismo orden. */
  mccems: {
    name: "Pensamiento Matemático III · Bachillerato",
    status: "nacional",
    source: "Progresiones de aprendizaje del Marco Curricular Común de la Educación Media Superior (SEP, 2023).",
    units: [
      { title: "Variación y recta tangente",
        topics: ["Variación promedio e instantánea", "Procesos infinitos y movimiento", "El problema de la recta tangente"],
        blocks: [] },
      { title: "Funciones y sus gráficas",
        topics: ["Modelación del cambio con funciones reales", "Simetrías, crecimiento y decrecimiento", "Máximos y mínimos relativos", "Concavidades"],
        blocks: [] },
      { title: "Límites y continuidad",
        topics: ["El límite y el comportamiento local de una gráfica", "Continuidad con el concepto de límite"],
        blocks: [] },
      { title: "La derivada y sus reglas",
        topics: ["Interpretación de la derivada y su definición formal", "Derivadas de funciones constantes, lineales y polinomiales", "Reglas de suma, producto, cociente y cadena"],
        blocks: ["fundamentos", "producto-cociente", "cadena"] },
      { title: "Aplicaciones de la derivada",
        topics: ["La derivada como razón de cambio instantánea", "Análisis y trazado de gráficas con la derivada", "Problemas de optimización"],
        blocks: [] },
      { title: "Exponenciales, logaritmos y trigonométricas",
        topics: ["Gráficas exponenciales y logarítmicas como funciones inversas", "Fenómenos periódicos y funciones trigonométricas", "Ideas del teorema fundamental del cálculo"],
        blocks: [] },
      { title: "Para ir más allá del programa", extra: true,
        topics: ["Derivadas trigonométricas", "Derivadas de exponenciales y logaritmos", "Derivación implícita y orden superior"],
        blocks: ["trig", "explog", "implicitas"] }
    ]
  },

  /* TecNM — Cálculo Diferencial (plan ISIC-2010-224 y afines). */
  tecnm: {
    name: "Cálculo Diferencial · Ingeniería",
    status: "oficial",
    source: "Temario de Cálculo Diferencial del TecNM (plan de estudios ISIC-2010-224).",
    units: [
      { title: "Números reales",
        topics: ["Axiomas e intervalos", "Valor absoluto y propiedades", "Desigualdades de 1.er y 2.º grado", "Desigualdades con valor absoluto"],
        blocks: [] },
      { title: "Funciones",
        topics: ["Dominio, rango y gráfica", "Inyectiva, suprayectiva y biyectiva", "Algebraicas y trascendentes", "Operaciones y composición", "Función inversa e implícita"],
        blocks: [] },
      { title: "Límites y continuidad",
        topics: ["Noción y definición de límite", "Propiedades y cálculo de límites", "Límites laterales, infinitos y asíntotas", "Continuidad y tipos de discontinuidad"],
        blocks: [] },
      { title: "La derivada",
        topics: ["Interpretación geométrica y razón de cambio", "Definición de la derivada y diferenciales", "Cálculo de derivadas", "Regla de la cadena", "Derivadas implícitas", "Derivadas de orden superior"],
        blocks: ["fundamentos", "producto-cociente", "cadena", "trig", "explog", "implicitas"] },
      { title: "Aplicaciones de la derivada",
        topics: ["Recta tangente y normal", "Teoremas de Rolle y del valor medio", "Máximos, mínimos y concavidad", "Graficación y optimización", "Tasas relacionadas", "Regla de L'Hôpital"],
        blocks: [] }
    ]
  }
};

/* Instituciones, preguntas de seguimiento y qué plan resuelven.
   `verified`: true = programa oficial revisado; false = se usa el programa
   base del nivel y falta confirmar el del plantel/estado. */
const INSTITUTIONS = [
  { id: "cobaem", name: "COBAEM", desc: "Colegio de Bachilleres del Estado", icon: "📘",
    questions: [{ id: "estado", label: "¿De qué estado es tu COBAEM?", options: ["Estado de México", "Morelos"] }],
    resolve: ()=> ({ plan: "mccems", verified: false }) },
  { id: "dgeti", name: "DGETI", desc: "CBTis, CETis y bachillerato tecnológico", icon: "🛠️",
    questions: [],
    resolve: ()=> ({ plan: "mccems", verified: false }) },
  { id: "tecnm", name: "TecNM", desc: "Institutos Tecnológicos · Ingeniería", icon: "⚙️",
    questions: [],
    resolve: ()=> ({ plan: "tecnm", verified: true }) },
  { id: "uaem", name: "UAEM", desc: "Universidad Autónoma del Estado", icon: "🎓",
    questions: [
      { id: "estado", label: "¿De qué estado es tu UAEM?", options: ["Morelos", "Estado de México (UAEMex)"] },
      { id: "nivel", label: "¿Qué nivel cursas?", options: ["Bachillerato (Preparatoria)", "Licenciatura / Ingeniería"] }
    ],
    resolve: a => a.nivel && a.nivel.startsWith("Lic")
      ? { plan: "tecnm", verified: false }
      : { plan: "mccems", verified: false } },
  { id: "libre", name: "Otra / explorar", desc: "Ver todos los bloques sin plan", icon: "🧭",
    questions: [],
    resolve: ()=> ({ plan: "libre", verified: true }) }
];

const Plans = {
  KEY: "dojo-plan-v1",
  sel: null,           // { inst, answers, plan, verified }
  subject: "calc",     // asignatura a la que pertenece la selección (se pregunta al entrar a cada una)

  key(){ return this.subject === "calc" ? this.KEY : this.KEY + ":" + this.subject; },
  load(){
    this.sel = null;
    try{
      const s = JSON.parse(localStorage.getItem(this.key()));
      if(s && PLANS[s.plan]) this.sel = s;
    }catch(e){}
    return this.sel;
  },
  save(){ try{ localStorage.setItem(this.key(), JSON.stringify(this.sel)); }catch(e){} },

  plan(){ return this.sel ? PLANS[this.sel.plan] : PLANS.libre; },
  units(){ return this.plan().units; },                       // null = recorrido libre
  inst(){ return this.sel && INSTITUTIONS.find(i => i.id === this.sel.inst); },

  /* etiqueta corta: "TecNM", "UAEM · Morelos · Licenciatura" */
  label(){
    if(!this.sel) return "Sin plan";
    const i = this.inst();
    const a = Object.values(this.sel.answers || {}).map(v => v.replace(/ \(.*\)/, "").replace(/ \/ .*/, ""));
    return [i ? i.name : "", ...a].filter(Boolean).join(" · ");
  },

  /* ids de bloques en el orden del plan (los extra al final) */
  blockOrder(){
    const u = this.units();
    if(!u) return BLOCKS.map(b => b.id);
    const ids = [];
    u.forEach(x => x.blocks.forEach(id => { if(!ids.includes(id)) ids.push(id); }));
    return ids;
  },

  /* ---------- asistente de primer uso ---------- */
  openWizard(onDone, canCancel){
    const root = document.getElementById("onboard");
    let inst = null, answers = {}, qi = 0;
    const done = ()=>{
      const r = inst.resolve(answers);
      this.sel = { inst: inst.id, answers, plan: r.plan, verified: r.verified };
      this.save(); root.innerHTML = ""; root.hidden = true; document.body.classList.remove("onboarding");
      onDone && onDone();
    };
    const shell = (inner)=>{
      root.hidden = false; document.body.classList.add("onboarding");
      root.innerHTML = `<div class="ob-card" role="dialog" aria-modal="true" aria-labelledby="ob-t">
        <div class="ob-brand"><span class="brand-mark">d/dx</span> ASTRO-matiks</div>${inner}
        ${canCancel ? '<button class="ob-link" id="ob-cancel" type="button">Cancelar</button>' : ""}</div>`;
      const c = document.getElementById("ob-cancel");
      if(c) c.onclick = ()=>{ root.innerHTML = ""; root.hidden = true; document.body.classList.remove("onboarding"); };
    };
    const stepInst = ()=>{
      shell(`<h1 id="ob-t">¿De qué institución vienes?</h1>
        <p class="lead">Adaptamos los temas y su orden al plan de estudios de tu institución.</p>
        <div class="ob-grid">${INSTITUTIONS.map(i => `<button class="ob-opt" data-i="${i.id}" type="button">
          <span class="ob-ic">${i.icon}</span><b>${i.name}</b><small>${i.desc}</small></button>`).join("")}</div>`);
      root.querySelectorAll("[data-i]").forEach(b => b.onclick = ()=>{
        inst = INSTITUTIONS.find(x => x.id === b.dataset.i); answers = {}; qi = 0;
        inst.questions.length ? stepQ() : stepConfirm();
      });
    };
    const stepQ = ()=>{
      const q = inst.questions[qi];
      shell(`<h1 id="ob-t">${q.label}</h1>
        <p class="lead">${inst.name} · el programa puede cambiar según tu respuesta.</p>
        <div class="ob-list">${q.options.map((o, k) => `<button class="ob-opt row" data-k="${k}" type="button"><b>${o}</b></button>`).join("")}</div>
        <button class="ob-link" id="ob-back" type="button">← Atrás</button>`);
      root.querySelectorAll("[data-k]").forEach(b => b.onclick = ()=>{
        answers[q.id] = q.options[+b.dataset.k]; qi++;
        qi < inst.questions.length ? stepQ() : stepConfirm();
      });
      document.getElementById("ob-back").onclick = ()=>{
        if(qi > 0){ qi--; delete answers[inst.questions[qi].id]; stepQ(); } else stepInst();
      };
    };
    const stepConfirm = ()=>{
      const r = inst.resolve(answers), p = PLANS[r.plan];
      const tag = Object.values(answers).join(" · ");
      const units = p.units ? `<ol class="ob-units">${p.units.map(u => `<li${u.extra ? ' class="x"' : ""}>${u.title}${u.blocks.length ? "" : " <small>pronto</small>"}</li>`).join("")}</ol>` : "";
      shell(`<h1 id="ob-t">Tu plan: ${inst.name}${tag ? " · " + tag : ""}</h1>
        <p class="lead"><b>${p.name}</b></p>${units}
        <p class="ob-note ${r.verified ? "" : "warn"}">${r.verified
          ? "Fuente: " + p.source
          : "Usamos el programa base de este nivel (" + p.source + ") porque aún no está cargado el programa específico de tu plantel. Confírmalo con tu docente."}</p>
        <div class="ob-actions"><button class="btn btn-primary" id="ob-ok" type="button">Empezar</button>
          <button class="ob-link" id="ob-back" type="button">← Cambiar</button></div>`);
      document.getElementById("ob-ok").onclick = done;
      document.getElementById("ob-back").onclick = ()=>{
        if(inst.questions.length){ qi = inst.questions.length - 1; delete answers[inst.questions[qi].id]; stepQ(); } else stepInst();
      };
    };
    stepInst();
  }
};
