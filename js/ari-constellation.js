/* =========================================================
   Derivadas Dojo — constelación de TEMAS de Aritmética
   Solo el mapa de temas (sin lecciones, práctica ni examen):
   sirve para planear el contenido antes de desarrollarlo.

   Cómo agregar/editar temas: edita el arreglo ARI_TOPICS.
   Cada bloque es una estrella; `topics` es la lista de temas
   que se muestra al tocarla. Nada de esto usa Engine todavía,
   así que no hay % de avance ni progreso guardado.

   Cuando se decida desarrollar el curso de verdad: crea los
   bloques reales en data.js (mismo formato que BLOCKS) y
   conecta "ari" en MapScreen.openCourse() a Constellation.show()
   como ya pasa con "calc".
   ========================================================= */

const ARI_TOPICS = [
  { id:"ari-numeros", title:"Números y operaciones", topics:[
    "Números naturales y enteros",
    "Orden, valor absoluto y recta numérica",
    "Suma, resta, multiplicación y división",
    "Jerarquía de operaciones y uso de paréntesis"
  ]},
  { id:"ari-divisibilidad", title:"Divisibilidad", topics:[
    "Múltiplos y divisores",
    "Criterios de divisibilidad",
    "Números primos y compuestos, factorización",
    "Mínimo común múltiplo y máximo común divisor"
  ]},
  { id:"ari-fracciones", title:"Fracciones", topics:[
    "Fracciones equivalentes y simplificación",
    "Suma y resta de fracciones",
    "Multiplicación y división de fracciones",
    "Fracciones mixtas, comparación y orden"
  ]},
  { id:"ari-decimales", title:"Decimales", topics:[
    "Lectura, escritura y orden de decimales",
    "Operaciones con números decimales",
    "Conversión entre fracciones y decimales",
    "Redondeo y aproximación"
  ]},
  { id:"ari-potencias", title:"Potencias y raíces", topics:[
    "Potencias de exponente natural y leyes de los exponentes",
    "Exponentes cero y negativos",
    "Notación científica",
    "Raíz cuadrada y raíz cúbica"
  ]},
  { id:"ari-razones", title:"Razones, proporciones y porcentajes", topics:[
    "Razones y proporciones",
    "Regla de tres simple y compuesta",
    "Porcentajes: cálculo e interpretación",
    "Aumentos, descuentos e interés simple"
  ]}
];

const AriConstellation = {
  selected:null,

  TEMPLATE:`
    <div class="c-bg"></div>
    <div class="c-stars" aria-hidden="true"></div>
    <header class="c-top">
      <button type="button" class="c-back" id="ac-back">← Mapa</button>
    </header>
    <div class="c-hero">
      <div>
        <h1>Aritmética · constelación de temas</h1>
        <p>Así quedará organizado el curso. Por ahora solo el mapa de temas — aún sin lecciones ni ejercicios.</p>
      </div>
    </div>
    <div class="c-sky" id="ac-sky">
      <svg class="c-lines" id="ac-lines" aria-hidden="true"></svg>
      <div id="ac-nodes"></div>
    </div>
    <section class="c-panel ac-panel" id="ac-panel" aria-live="polite"></section>
  `,

  init(){
    if(this.el) return;
    const el = document.createElement("div");
    el.id = "const-screen-ari";
    el.className = "c-screen";
    el.setAttribute("aria-label", "Constelación de temas de Aritmética");
    el.innerHTML = this.TEMPLATE;
    document.body.appendChild(el);
    this.el = el;
    Constellation._buildStars.call(this);
    el.querySelector("#ac-back").addEventListener("click", ()=>{ this.hide(); MapScreen.show(); });
    el.addEventListener("click", (e)=>{
      const n = e.target.closest(".c-node");
      if(n){ this.selected = n.dataset.id; this.render(); }
    });
    let t;
    window.addEventListener("resize", ()=>{ clearTimeout(t); t = setTimeout(()=>{ if(this.isOpen()) this._layout(); }, 80); });
  },

  isOpen(){ return document.body.classList.contains("on-const-ari"); },

  show(){
    this.init();
    document.body.classList.remove("in-session", "on-map");
    document.body.classList.add("on-const-ari");
    if(!this.selected || !ARI_TOPICS.some(b => b.id === this.selected)) this.selected = ARI_TOPICS[0].id;
    this.render();
  },

  hide(){ document.body.classList.remove("on-const-ari"); },

  _layout(){ Constellation.layoutSky(this.el.querySelector("#ac-sky")); },

  render(){
    const nodes = this.el.querySelector("#ac-nodes");
    nodes.innerHTML = "";
    const sel = this.selected;

    ARI_TOPICS.forEach(b => {
      const size = 26; // ningún tema tiene contenido todavía: todas las estrellas igual, "sin iniciar"
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "c-node" + (b.id === sel ? " sel" : "");
      btn.dataset.id = b.id;
      btn.style.setProperty("--s", size + "px");
      btn.setAttribute("aria-pressed", b.id === sel ? "true" : "false");
      btn.setAttribute("aria-label", `${b.title}, ${b.topics.length} temas, próximamente`);
      btn.innerHTML = `<span class="c-star">${Constellation._starSVG(size)}</span>` +
        `<span class="c-name">${b.title}</span><span class="c-pct">Próximamente</span>`;
      nodes.appendChild(btn);
    });

    this._layout();
    this._renderPanel();
  },

  _renderPanel(){
    const b = ARI_TOPICS.find(x => x.id === this.selected);
    if(!b) return;
    const esc = (t)=> String(t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
    const list = b.topics.map(t => `<li>${esc(t)}</li>`).join("");
    this.el.querySelector("#ac-panel").innerHTML = `
      <h2>${esc(b.title)}</h2>
      <ul class="ac-list">${list}</ul>
      <p class="ac-soon">Próximamente: lecciones y ejercicios guiados de este tema.</p>
    `;
  }
};
