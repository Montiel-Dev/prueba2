/* =========================================================
   ASTRO-matiks — constelación del curso
   Pantalla que se muestra al entrar a una materia: cada bloque
   es una estrella. Su tamaño y brillo crecen con el avance.
   Clic en una estrella → su panel inferior (Lecciones / Práctica /
   Examen) y el botón "Continuar", que abre justo lo que sigue.
   ========================================================= */

const Constellation = {
  W:1200, H:520,
  selected:null,

  // Posiciones en zigzag (lienzo de diseño 1200 × 520); se escala al ancho disponible
  POS:[
    {x:150,  y:200}, {x:340,  y:80}, {x:530,  y:220},
    {x:720,  y:90},  {x:910,  y:210}, {x:1070, y:100}
  ],

  TEMPLATE:`
    <div class="c-bg"></div>
    <div class="c-stars" aria-hidden="true"></div>
    <header class="c-top">
      <button type="button" class="c-back" id="c-back">← Mapa</button>
      <button type="button" class="c-plan" id="c-plan" title="Cambiar institución"></button>
    </header>
    <div class="c-hero">
      <div class="c-sun" id="c-sun" aria-hidden="true"><i></i></div>
      <div>
        <h1>Tu constelación</h1>
        <p id="c-total"></p>
      </div>
    </div>
    <div class="c-sky" id="c-sky">
      <svg class="c-lines" id="c-lines" aria-hidden="true"></svg>
      <div id="c-nodes"></div>
    </div>
    <section class="c-panel" id="c-panel" aria-live="polite"></section>
  `,

  init(){
    if(this.el) return;
    const el = document.createElement("div");
    el.id = "const-screen";
    el.className = "c-screen";
    el.setAttribute("aria-label", "Constelación del curso");
    el.innerHTML = this.TEMPLATE;
    document.body.appendChild(el);
    this.el = el;
    this._buildStars();
    el.querySelector("#c-back").addEventListener("click", ()=>{ this.hide(); MapScreen.show(); });
    el.querySelector("#c-plan").addEventListener("click", ()=>{
      Plans.openWizard(()=>{ UI.renderSidebar(); this.render(); }, true);
    });
    el.addEventListener("click", (e)=>{
      const n = e.target.closest(".c-node");
      if(n){ this.selected = n.dataset.id; this.render(); return; }
      const go = e.target.closest("[data-go]");
      if(go) this.go(this.selected, go.dataset.go);
    });
    let t;
    window.addEventListener("resize", ()=>{ clearTimeout(t); t = setTimeout(()=>{ if(this.isOpen()) this._layout(); }, 80); });
  },

  isOpen(){ return document.body.classList.contains("on-const"); },

  show(){
    this.init();
    document.body.classList.remove("in-session", "on-map");
    document.body.classList.add("on-const");
    if(!this.selected || !BLOCKS.some(b => b.id === this.selected)) this.selected = this._nextBlock().id;
    this.render();
  },

  hide(){ document.body.classList.remove("on-const"); },

  // ---------------- datos ----------------
  _order(){ return Plans.blockOrder().map(id => BLOCKS.find(b => b.id === id)).filter(Boolean); },

  // El bloque que sigue: el primero con práctica incompleta (misma regla que el inicio clásico)
  _nextBlock(){
    const order = this._order();
    return order.find(b => { const s = Engine.blockPracticeStats(b.id); return s.correct < s.total; }) || order[0];
  },

  // Qué abrir con "Continuar": la lección que falta → la práctica → el examen
  go(blockId, what){
    const block = BLOCKS.find(b => b.id === blockId);
    if(!block) return;
    this.hide();
    document.body.classList.remove("on-map");
    const sp = Engine.sectionPercents(blockId);
    let target = what;
    if(target === "continue"){
      target = sp.lessons < 100 ? "lessons" : sp.practice < 100 ? "practice" : sp.exam < 100 ? "exam" : "overview";
    }
    if(target === "lessons"){
      const seen = Engine.state.blocks[blockId].lessonsSeen;
      let idx = block.lessons.findIndex((_, i) => !seen[i]);
      if(idx < 0) idx = 0;
      UI.showLesson(blockId, idx);
    } else if(target === "practice") UI.startSession("practice", blockId);
    else if(target === "exam") UI.startSession("exam", blockId);
    else UI.showBlockOverview(blockId);
  },

  // ---------------- dibujo ----------------
  _buildStars(){
    const box = this.el.querySelector(".c-stars");
    let seed = 11;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for(let i = 0; i < 46; i++){
      const s = document.createElement("i");
      const size = rnd() < 0.2 ? 3 : 2;
      s.style.cssText = `left:${(rnd()*100).toFixed(2)}%;top:${(rnd()*100).toFixed(2)}%;width:${size}px;height:${size}px;opacity:${(0.2 + rnd()*0.45).toFixed(2)};`;
      if(i % 6 === 0){ s.className = "tw"; s.style.animationDelay = (rnd()*4).toFixed(2) + "s"; }
      box.appendChild(s);
    }
  },

  // Cuatro puntas, como en el diseño; el tamaño crece con el avance
  _starSVG(size){
    const c = size / 2, k = size * 0.14;
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">` +
      `<path d="M${c} 0 C${c + k} ${c - k} ${c + k} ${c - k} ${size} ${c} C${c + k} ${c + k} ${c + k} ${c + k} ${c} ${size} ` +
      `C${c - k} ${c + k} ${c - k} ${c + k} 0 ${c} C${c - k} ${c - k} ${c - k} ${c - k} ${c} 0Z"/></svg>`;
  },

  render(){
    const order = this._order();
    const total = Engine.overallPercent();
    const sel = this.selected;
    const nodes = this.el.querySelector("#c-nodes");
    nodes.innerHTML = "";

    order.forEach((b, i) => {
      const bp = Engine.blockPercent(b.id);
      const started = bp > 0 || Engine.blockPracticeStats(b.id).done > 0 || Engine.blockLessonStats(b.id).done > 0;
      const size = started ? Math.round(30 + bp * 0.38) : 26;
      const name = b.title.replace("Fundamentos y regla de la potencia", "Fundamentos")
        .replace("Derivadas trigonométricas", "Trigonométricas")
        .replace("Exponenciales y logaritmos", "Exponenciales y log.")
        .replace("Implícitas y orden superior", "Implícitas");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "c-node" + (started ? " on" : "") + (b.id === sel ? " sel" : "");
      btn.dataset.id = b.id;
      btn.dataset.i = i;
      btn.style.setProperty("--s", size + "px");
      btn.setAttribute("aria-pressed", b.id === sel ? "true" : "false");
      btn.setAttribute("aria-label", `${b.title}, ${started ? bp + "% completado" : "sin iniciar"}`);
      btn.innerHTML = `<span class="c-star">${this._starSVG(size)}</span>` +
        `<span class="c-name">${name}</span><span class="c-pct">${started ? bp + "%" : "Sin iniciar"}</span>`;
      nodes.appendChild(btn);
    });

    this.el.querySelector("#c-total").textContent = `Avance total ${total}%`;
    this.el.querySelector("#c-sun").style.setProperty("--p", total);
    this.el.querySelector("#c-plan").textContent = Plans.label();
    this._layout();
    this._renderPanel();
  },

  // Coloca estrellas y líneas de todos los cielos visibles (el del curso y el de cada bloque)
  _layout(){ document.querySelectorAll(".c-sky").forEach(sky => this.layoutSky(sky)); },

  layoutSky(sky){
    const nodes = [...sky.querySelectorAll(".c-node")];
    const n = nodes.length;
    const vw = sky.clientWidth || window.innerWidth;
    if(!n || !vw) return;
    const small = vw < 720;
    const pts = [];
    if(small){
      const H = Math.max(360, n * 96);
      sky.style.height = H + "px";
      for(let i = 0; i < n; i++) pts.push({ x: vw * (i % 2 ? 0.68 : 0.32), y: 50 + i * ((H - 100) / Math.max(1, n - 1)) });
    } else {
      sky.style.height = "";
      const pad = 100, usable = vw - pad * 2, h = sky.clientHeight || this.H;
      const slot = n > 1 ? usable / (n - 1) : 0;
      for(let i = 0; i < n; i++){
        const p = this.POS[i % this.POS.length];
        pts.push({ x: n > 1 ? pad + i * slot : vw / 2, y: h * (p.y / this.H) + 10 });
      }
    }
    let lines = "";
    nodes.forEach((node, i) => {
      node.style.left = pts[i].x + "px";
      node.style.top = pts[i].y + "px";
      if(i > 0){
        const q = pts[i - 1], on = node.classList.contains("on") && nodes[i - 1].classList.contains("on");
        lines += `<line x1="${q.x}" y1="${q.y}" x2="${pts[i].x}" y2="${pts[i].y}" class="${on ? "on" : "off"}"/>`;
      }
    });
    sky.querySelector(".c-lines").innerHTML = lines;
  },

  // Dibuja una constelación dentro de `host`. items: [{label, sub, pct, on, onClick}]
  mountSky(host, items){
    host.innerHTML = `<div class="c-sky c-sky-block"><svg class="c-lines" aria-hidden="true"></svg><div class="c-nodes"></div></div>`;
    const sky = host.firstChild, box = sky.querySelector(".c-nodes");
    items.forEach(it => {
      const size = it.on ? Math.round(30 + (it.pct || 0) * 0.3) : 26;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "c-node" + (it.on ? " on" : "");
      b.style.setProperty("--s", size + "px");
      b.setAttribute("aria-label", `${it.label}, ${it.sub}`);
      b.innerHTML = `<span class="c-star">${this._starSVG(size)}</span><span class="c-name"></span><span class="c-pct"></span>`;
      b.querySelector(".c-name").textContent = it.label;
      b.querySelector(".c-pct").textContent = it.sub;
      b.addEventListener("click", it.onClick);
      box.appendChild(b);
    });
    this.layoutSky(sky);
    if(!this._rs){
      this._rs = true; let t;
      window.addEventListener("resize", ()=>{ clearTimeout(t); t = setTimeout(()=> this._layout(), 80); });
    }
  },

  _renderPanel(){
    const b = BLOCKS.find(x => x.id === this.selected);
    if(!b) return;
    const sp = Engine.sectionPercents(b.id), bp = Engine.blockPercent(b.id);
    const bar = (label, v, cls, go) =>
      `<button type="button" class="c-sec" data-go="${go}" aria-label="${label}: ${v}%. Abrir">
         <span class="c-sec-top"><span>${label}</span><b>${v}%</b></span>
         <span class="c-bar"><i class="${cls}" style="width:${v}%"></i></span>
       </button>`;
    const label = bp > 0 ? "Continuar" : "Empezar";
    this.el.querySelector("#c-panel").innerHTML = `
      <h2>${b.title} · ${bp}%</h2>
      <div class="c-secs">
        ${bar("Lecciones", sp.lessons, "mint", "lessons")}
        ${bar("Práctica", sp.practice, "mint", "practice")}
        ${bar("Examen", sp.exam, "peri", "exam")}
      </div>
      <button type="button" class="c-go" data-go="continue">${label}</button>
    `;
  }
};
