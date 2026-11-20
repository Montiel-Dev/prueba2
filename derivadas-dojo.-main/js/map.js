/* =========================================================
   Derivadas Dojo — pantalla de inicio: mapa de materias
   Una burbuja central (Matemáticas) y 5 ramas. Primer clic en
   una burbuja: zoom + recuadro de requisitos. Segundo clic en
   la misma burbuja: entra al curso. Esc / clic en el fondo /
   botón ×: vuelve a la vista general.
   Los datos viven en js/subjects.js.
   ========================================================= */

const MapScreen = {
  W:1280, H:800, CX:640, CY:400,       // lienzo de diseño (se escala a la ventana)
  RX:270, RY:165,                      // órbita de las ramas
  ORX:480, ORY:285,                    // órbita exterior (extras)
  focus:null,                          // burbuja con zoom
  branch:null,                         // rama abierta (muestra relaciones y extras)
  nodes:{}, extraNodes:{}, extraPos:{}, _extrasFor:null,

  TEMPLATE:`
    <div class="m-bg"></div>
    <div class="m-stars" aria-hidden="true"></div>
    <header class="m-top">
      <div class="m-brand"><span class="m-mark">d/dx</span><span class="m-name">Derivadas Dojo</span></div>
      <div class="m-hud">
        <span class="m-pro" id="m-pro" hidden>PRO</span>
        <a class="m-arcade" id="m-arcade" href="arcade.html">♥ Arcade</a>
      </div>
    </header>
    <p class="m-hint" id="m-hint"></p>
    <div class="m-world" id="m-world">
      <div class="m-orbit m-orbit-out" aria-hidden="true"></div>
      <div class="m-orbit m-orbit-in" aria-hidden="true"></div>
      <div class="m-lines" id="m-lines-center" aria-hidden="true"></div>
      <div class="m-lines" id="m-lines-extra" aria-hidden="true"></div>
      <button type="button" class="m-center" id="m-center" aria-label="Matemáticas: volver a la vista general">
        <span class="m-center-sym">π</span>
        <span class="m-center-name">Matemáticas</span>
        <span class="m-center-pct" id="m-center-pct"></span>
      </button>
      <div id="m-branches"></div>
      <div id="m-extras"></div>
    </div>
    <aside class="m-panel" id="m-panel" aria-hidden="true"></aside>
    <footer class="m-legend" aria-hidden="true">
      <span><i class="dot lv-a"></i>Muy relacionada</span>
      <span><i class="dot lv-m"></i>Relacionada</span>
      <span><i class="dot lv-b"></i>Poco relacionada</span>
      <span><i class="dot ring"></i>Anillo = completado</span>
    </footer>
  `,

  // ---------------- arranque ----------------
  init(){
    if(this.el) return;
    const el = document.createElement("div");
    el.id = "map-screen";
    el.className = "m-screen";
    el.setAttribute("aria-label", "Mapa de materias");
    el.innerHTML = this.TEMPLATE;
    document.body.appendChild(el);
    this.el = el;
    this.world = el.querySelector("#m-world");
    this.panel = el.querySelector("#m-panel");
    this._buildStars();
    this._buildBranches();
    this._buildCenterLines();

    el.addEventListener("click", (e)=> this._onClick(e));
    document.addEventListener("keydown", (e)=>{
      if(e.key === "Escape" && this.isOpen() && this.focus){ this.reset(); }
    });
    let t;
    window.addEventListener("resize", ()=>{ clearTimeout(t); t = setTimeout(()=>{ if(this.isOpen()) this._applyView(); }, 80); });
  },

  isOpen(){ return document.body.classList.contains("on-map"); },

  show(){
    this.init();
    document.body.classList.remove("in-session");
    document.body.classList.add("on-map");
    this.el.classList.remove("is-leaving");
    this.focus = null;
    this.branch = null;
    const pro = this.el.querySelector("#m-pro");
    if(pro) pro.hidden = !(typeof Pay !== "undefined" && Pay.isPro());
    this.render();
  },

  hide(){ document.body.classList.remove("on-map"); },

  // ---------------- construcción ----------------
  _buildStars(){
    const box = this.el.querySelector(".m-stars");
    let seed = 7;
    const rnd = ()=>{ seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for(let i=0; i<70; i++){
      const big = i < 6;
      const s = document.createElement("i");
      const size = big ? 4 : (rnd() < 0.3 ? 3 : 2);
      s.style.cssText = `left:${(rnd()*100).toFixed(2)}%;top:${(rnd()*100).toFixed(2)}%;width:${size}px;height:${size}px;opacity:${big ? 0.95 : (0.25 + rnd()*0.5).toFixed(2)};`;
      if(big) s.className = "big";
      else if(i % 5 === 0){ s.className = "twinkle"; s.style.animationDelay = (rnd()*4).toFixed(2) + "s"; }
      box.appendChild(s);
    }
  },

  _branchPos(id){
    const a = SUBJECTS[id].ang * Math.PI / 180;
    return { x: this.CX + this.RX*Math.cos(a), y: this.CY + this.RY*Math.sin(a) };
  },

  _bubble(id, d, x, y, cls){
    const wrap = document.createElement("div");
    wrap.className = "m-bubble " + cls;
    wrap.style.cssText = `left:${x - d/2}px;top:${y - d/2}px;width:${d}px;height:${d}px;`;
    wrap.innerHTML = `<button type="button" class="m-bubble-btn" data-id="${id}"><span class="m-label"></span><span class="m-pct"></span></button>`;
    wrap.querySelector(".m-label").textContent = SUBJECTS[id].label;
    return wrap;
  },

  _buildBranches(){
    const host = this.el.querySelector("#m-branches");
    BRANCH_IDS.forEach(id=>{
      const p = this._branchPos(id);
      const node = this._bubble(id, 132, p.x, p.y, "m-branch");
      host.appendChild(node);
      this.nodes[id] = node;
    });
  },

  _line(x1, y1, x2, y2, color, dashed){
    const dx = x2-x1, dy = y2-y1;
    const len = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    const l = document.createElement("div");
    l.className = "m-line";
    l.style.cssText = `left:${x1}px;top:${y1}px;width:${len}px;border-top-color:${color};border-top-style:${dashed?"dashed":"solid"};transform:rotate(${ang}deg);`;
    return l;
  },

  _buildCenterLines(){
    const host = this.el.querySelector("#m-lines-center");
    BRANCH_IDS.forEach(id=>{
      const p = this._branchPos(id);
      host.appendChild(this._line(this.CX, this.CY, p.x, p.y, "rgba(236,237,243,0.25)", false));
    });
  },

  // ---------------- extras de la rama abierta ----------------
  _buildExtras(){
    const host = this.el.querySelector("#m-extras");
    const lines = this.el.querySelector("#m-lines-extra");
    host.innerHTML = "";
    lines.innerHTML = "";
    this.extraNodes = {};
    this.extraPos = {};
    this._extrasFor = this.branch;
    this._fresh = true;
    if(!this.branch) return;

    const cur = SUBJECTS[this.branch];
    const n = cur.extras.length;
    const offs = n === 3 ? [-20, 0, 20] : [-14, 14];
    const bp = this._branchPos(cur.id);
    const colors = { a:"#7CF0C9", m:"#8AA4FF", b:"#5A627C" };
    cur.extras.forEach((ex, i)=>{
      const [id, lv] = ex;
      const size = REL_LEVELS[lv].size;
      const t = (cur.ang + offs[i]) * Math.PI / 180;
      const x = this.CX + this.ORX*Math.cos(t);
      const y = this.CY + this.ORY*Math.sin(t);
      const node = this._bubble(id, size, x, y, "m-extra");
      host.appendChild(node);
      lines.appendChild(this._line(bp.x, bp.y, x, y, colors[lv], lv === "b"));
      this.extraNodes[id] = { node, lv };
      this.extraPos[id] = { x, y, d:size };
    });
  },

  // ---------------- interacción ----------------
  _onClick(e){
    const btn = e.target.closest(".m-bubble-btn");
    if(btn){ this.select(btn.dataset.id); return; }
    const act = e.target.closest("[data-act]");
    if(act){
      if(act.dataset.act === "enter") this.enter(this.focus);
      if(act.dataset.act === "close") this.reset();
      return;
    }
    if(e.target.closest(".m-panel") || e.target.closest(".m-top")) return;
    if(this.focus) this.reset();   // fondo o burbuja central
  },

  select(id){
    if(this.focus === id){ this.enter(id); return; }   // segundo clic
    const s = SUBJECTS[id];
    if(s.kind === "branch") this.branch = id;
    else if(!this.extraNodes[id]) return;
    this.focus = id;
    this.render();
  },

  reset(){
    this.focus = null;
    this.branch = null;
    this.render();
  },

  enter(id){
    const s = SUBJECTS[id];
    if(!s.available){
      const n = (this.nodes[id] || (this.extraNodes[id] && this.extraNodes[id].node));
      if(n){ n.classList.remove("m-shake"); void n.offsetWidth; n.classList.add("m-shake"); }
      return;
    }
    this.el.classList.add("is-leaving");
    setTimeout(()=> this.openCourse(id), 320);
  },

  // Aquí se conecta cada curso con su contenido
  openCourse(id){
    this.hide();
    if(id === "calc"){ UI.showHome(); }
  },

  // ---------------- dibujo ----------------
  render(){
    const f = this.focus, b = this.branch;
    this.el.classList.toggle("has-focus", !!f);

    if(this._extrasFor !== b) this._buildExtras();

    BRANCH_IDS.forEach(id=>{
      const node = this.nodes[id];
      const rel = b && id !== b ? SUBJECTS[b].rel[id] : null;
      node.className = "m-bubble m-branch" + (rel ? " lv-" + rel : "") + (id === b ? " is-open" : "") +
        (f === id ? " is-focus" : "") + (f && f !== id ? " is-dim" : "");
      this._fill(node, id, f === id);
    });
    Object.keys(this.extraNodes).forEach(id=>{
      const { node, lv } = this.extraNodes[id];
      node.className = "m-bubble m-extra lv-" + lv + (this._fresh ? " m-enter" : "") + (f === id ? " is-focus" : "") + (f && f !== id ? " is-dim" : "");
      this._fill(node, id, f === id);
    });
    this._fresh = false;
    this.el.querySelector("#m-lines-center").classList.toggle("is-dim", !!f);
    this.el.querySelector("#m-lines-extra").classList.toggle("is-dim", !!f);

    this.el.querySelector("#m-center-pct").textContent = totalPct() + "% avance";
    this.el.querySelector("#m-center").style.setProperty("--p", totalPct());
    this.el.querySelector("#m-hint").textContent = f
      ? "Toca de nuevo la burbuja para entrar al curso. Esc para volver."
      : "Elige una materia para ver cómo se relaciona con las demás.";

    if(f) this._renderPanel(f);
    this.panel.setAttribute("aria-hidden", f ? "false" : "true");
    this._applyView();
  },

  _fill(node, id, pressed){
    const pct = subjectPct(id);
    node.style.setProperty("--p", pct);
    node.querySelector(".m-pct").textContent = pct + "%";
    const btn = node.querySelector(".m-bubble-btn");
    btn.setAttribute("aria-label", `${SUBJECTS[id].label}, ${pct}% completado`);
    btn.setAttribute("aria-pressed", pressed ? "true" : "false");
  },

  // Zoom: coloca la burbuja elegida a la izquierda y el recuadro a la derecha
  _applyView(){
    const vw = window.innerWidth, vh = window.innerHeight;
    const small = vw < 820;
    const topPad = 70, botPad = 80;
    const availH = vh - topPad - botPad;
    const fit = Math.max(0.25, Math.min(vw / this.W, availH / this.H));
    let tx, ty, S;

    if(!this.focus){
      S = fit;
      tx = (vw - this.W*fit) / 2;
      ty = topPad + (availH - this.H*fit) / 2;
    } else {
      const id = this.focus;
      let p, d;
      if(SUBJECTS[id].kind === "branch"){ p = this._branchPos(id); d = 132; }
      else { p = this.extraPos[id]; d = p.d; }
      const want = small ? Math.min(vw*0.46, vh*0.26) : Math.min(vh*0.38, vw*0.24);
      S = Math.max(fit, want / d);
      const sx = small ? vw/2 : vw*0.31;
      const sy = small ? vh*0.27 : vh*0.5;
      tx = sx - p.x*S;
      ty = sy - p.y*S;
    }
    this.world.style.transform = `translate(${tx}px,${ty}px) scale(${S})`;
  },

  // ---------------- recuadro de requisitos ----------------
  _renderPanel(id){
    const s = SUBJECTS[id];
    const pct = subjectPct(id);
    const esc = (t)=> String(t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

    const reqs = s.requisites.length
      ? s.requisites.map(r=>{
          const name = r.id ? SUBJECTS[r.id].label : r.title;
          const rp = r.id ? `<em>${subjectPct(r.id)}%</em>` : "";
          return `<li><div><strong>${esc(name)}</strong><span>${esc(r.text)}</span></div>${rp}</li>`;
        }).join("")
      : `<li class="none"><div><strong>Sin requisitos</strong><span>Es un buen punto de partida.</span></div></li>`;

    let related = "";
    if(s.kind === "branch"){
      const chips = Object.keys(s.rel).map(rid =>
        `<span class="m-chip lv-${s.rel[rid]}"><i></i>${esc(SUBJECTS[rid].label)}</span>`).join("");
      related = `<h3>Se relaciona con</h3><div class="m-chips">${chips}</div>`;
    } else if(this.branch){
      const lv = this.extraNodes[id] ? this.extraNodes[id].lv : "b";
      related = `<h3>Relación con ${esc(SUBJECTS[this.branch].label)}</h3><div class="m-chips"><span class="m-chip lv-${lv}"><i></i>${REL_LEVELS[lv].label}</span></div>`;
    }

    const status = s.available
      ? `Disponible · ${BLOCKS.length} bloques`
      : `Próximamente`;
    const action = s.available
      ? `<button type="button" class="m-btn m-btn-primary" data-act="enter">Entrar al curso</button>`
      : `<button type="button" class="m-btn" data-act="enter" aria-disabled="true">Curso en preparación</button>`;

    this.panel.innerHTML = `
      <button type="button" class="m-close" data-act="close" aria-label="Cerrar y volver al mapa">×</button>
      <div class="m-eyebrow">${esc(status)}</div>
      <h2>${esc(s.label)}</h2>
      <p class="m-desc">${esc(s.desc)}</p>
      <div class="m-prog">
        <div class="m-prog-top"><span>Tu avance</span><b>${pct}%</b></div>
        <div class="m-prog-bar"><div style="width:${pct}%"></div></div>
      </div>
      <h3>Requisitos</h3>
      <ul class="m-reqs">${reqs}</ul>
      ${related}
      <div class="m-actions">${action}<span class="m-tip">o toca de nuevo la burbuja</span></div>
    `;
  }
};
