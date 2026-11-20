/* =========================================================
   Derivadas Dojo — pantalla de inicio: mapa de materias
   Una burbuja central (Matemáticas) y 6 ramas. Primer clic en
   una burbuja: zoom + recuadro de requisitos. Segundo clic en
   la misma burbuja: entra al curso. Esc / clic en el fondo /
   botón ×: vuelve a la vista general.
   Los datos viven en js/subjects.js.
   ========================================================= */

const MapScreen = {
  W:1280, H:800, CX:640, CY:400,       // lienzo de diseño (se escala a la ventana)
  RX:350, RY:210,                      // órbita de las ramas
  ORX:560, ORY:330,                    // órbita exterior (extras)
  BD:160,                              // diámetro de las burbujas de rama
  BS:1.45,                             // celular: las burbujas se ven este tanto más grandes (css/mobile.css lee --bs)
  CR:112,                              // radio de la burbuja central (diámetro 224)
  MIDD:52,                             // diámetro máximo del nodo amarillo (entre Matemáticas y su rama)
  HINT_KEY:"dojo-hint-alg",            // ya se hizo clic en Álgebra por primera vez
  focus:null,                          // burbuja con zoom
  branch:null,                         // rama abierta (muestra relaciones y extras)
  nodes:{}, midNodes:{}, extraNodes:{}, extraPos:{}, _extrasFor:null,

  TEMPLATE:`
    <div class="m-bg"></div>
    <div class="m-stars" aria-hidden="true"></div>
    <header class="m-top">
      <div class="m-hud">
        <span class="m-pro" id="m-pro" hidden>PRO</span>
        <button type="button" class="m-arcade" id="m-replay" hidden>↻ Ver colapso</button>
        <a class="m-arcade" id="m-camara" href="camara.html">📷 Escáner</a>
        <button type="button" class="m-login" id="m-login" aria-label="Iniciar sesión" title="Iniciar sesión">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 8l4 4-4 4"/><path d="M14 12H4"/>
          </svg>
          <span class="m-login-ini" aria-hidden="true"></span>
        </button>
      </div>
    </header>
    <a class="m-orb m-challenge" id="m-challenge" href="arcade.html" aria-label="Desafío: abrir el modo arcade">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M13 2L4 14h7l-1 8 9-12h-7z"/>
      </svg>
      <span class="m-orb-name">Desafío</span>
      <span class="m-orb-sub">Arcade</span>
    </a>
    <div class="m-orb m-streak" id="m-streak" role="status">
      <span class="m-neb" id="m-neb" aria-hidden="true"></span>
      <svg class="m-flame" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <path d="M12 2c1 3.5-1.5 5-3 7.2C7.4 11.6 7 13 7 14.5A5 5 0 0 0 17 15c0-2-.8-3.4-2-4.8-.2 1.2-.8 2-1.7 2.3C13.9 9 13.5 4.8 12 2z" fill="currentColor"/>
      </svg>
      <span class="m-orb-num" id="m-streak-n">0</span>
      <span class="m-orb-sub" id="m-streak-l">días de racha</span>
      <span class="m-neb-name" id="m-neb-name"></span>
    </div>
    <dialog class="m-login-dlg" id="m-login-dlg" aria-labelledby="m-login-title">
      <form method="dialog" id="m-login-form">
        <h2 id="m-login-title">Iniciar sesión</h2>
        <p class="m-login-note">Por ahora tu perfil se guarda solo en este dispositivo.</p>
        <label>Nombre<input name="name" id="m-login-name" autocomplete="name" required maxlength="40"></label>
        <label>Correo<input name="email" id="m-login-email" type="email" autocomplete="email" required maxlength="80"></label>
        <div class="m-login-actions">
          <button type="button" class="m-btn" id="m-login-cancel">Cancelar</button>
          <button type="submit" class="m-btn m-btn-primary">Entrar</button>
        </div>
      </form>
      <div id="m-login-in" hidden>
        <h2 id="m-login-who"></h2>
        <p class="m-login-note" id="m-login-mail"></p>
        <div class="m-login-actions">
          <button type="button" class="m-btn" id="m-login-close">Cerrar</button>
          <button type="button" class="m-btn m-btn-primary" id="m-login-out">Cerrar sesión</button>
        </div>
      </div>
    </dialog>
    <p class="m-start" id="m-start">Toca Matemáticas para comenzar</p>
    <button type="button" class="m-collapse" id="m-collapse" hidden>Colapsar la estrella</button>
    <div class="m-world" id="m-world">
      <div class="m-orbit m-orbit-out" aria-hidden="true"></div>
      <div class="m-orbit m-orbit-in" aria-hidden="true"></div>
      <div class="m-lines" id="m-lines-center" aria-hidden="true"></div>
      <div class="m-lines" id="m-lines-extra" aria-hidden="true"></div>
      <div class="m-sun" id="m-sun" aria-hidden="true"></div>
      <button type="button" class="m-center" id="m-center" aria-label="Matemáticas: volver a la vista general">
        <span class="m-center-sym">π</span>
        <span class="m-center-name">Matemáticas</span>
        <span class="m-center-pct" id="m-center-pct"></span>
      </button>
      <div id="m-branches"></div>
      <div id="m-extras"></div>
    </div>
    <aside class="m-panel" id="m-panel" aria-hidden="true"></aside>
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
    this._startComets();
    this._buildSun();
    this._buildBranches();
    this._buildCenterLines();
    this._bindStars();

    this._bindLogin();
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
    this.intro = !this._seen;          // la primera vez: portada con la burbuja central en grande
    this._seen = true;
    const pro = this.el.querySelector("#m-pro");
    if(pro) pro.hidden = !(typeof Pay !== "undefined" && Pay.isPro());
    this._paintStreak();
    this._paintLogin();
    this.render();
  },

  // ---------------- racha de días ----------------
  _paintStreak(){
    const n = (Engine.state && Engine.state.streak && Engine.state.streak.count) || 0;
    this.el.querySelector("#m-streak-n").textContent = n;
    this.el.querySelector("#m-streak-l").textContent = n === 1 ? "día de racha" : "días de racha";
    const neb = Nebulae.forDays(n);
    const host = this.el.querySelector("#m-neb");
    if(host.dataset.key !== neb.key){ host.innerHTML = Nebulae.svg(neb.key); host.dataset.key = neb.key; }
    this.el.querySelector("#m-neb-name").textContent = neb.name;
    const nextTxt = neb.next ? ` Con ${neb.next.days} días verás ${neb.next.name}.` : " Alcanzaste la última nebulosa.";
    const box = this.el.querySelector("#m-streak");
    box.setAttribute("aria-label", `Racha de ${n} ${n === 1 ? "día" : "días"} seguidos. Nebulosa: ${neb.name}.${nextTxt}`);
    box.title = `${neb.name}.${nextTxt}`;
  },

  // ---------------- inicio de sesión (perfil local; aún sin servidor) ----------------
  USER_KEY:"derivadas-dojo-user",
  _user(){ try{ return JSON.parse(localStorage.getItem(this.USER_KEY)); }catch(e){ return null; } },

  _paintLogin(){
    const u = this._user(), b = this.el.querySelector("#m-login");
    b.classList.toggle("is-in", !!u);
    b.querySelector(".m-login-ini").textContent = u ? (u.name.trim()[0] || "?").toUpperCase() : "";
    const label = u ? `Sesión de ${u.name}` : "Iniciar sesión";
    b.setAttribute("aria-label", label); b.title = label;
  },

  _bindLogin(){
    const el = this.el, dlg = el.querySelector("#m-login-dlg");
    const form = el.querySelector("#m-login-form"), inn = el.querySelector("#m-login-in");
    const open = ()=>{
      const u = this._user();
      form.hidden = !!u; inn.hidden = !u;
      if(u){ el.querySelector("#m-login-who").textContent = "Hola, " + u.name; el.querySelector("#m-login-mail").textContent = u.email; }
      dlg.showModal();
    };
    el.querySelector("#m-login").addEventListener("click", open);
    el.querySelector("#m-login-cancel").addEventListener("click", ()=> dlg.close());
    el.querySelector("#m-login-close").addEventListener("click", ()=> dlg.close());
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      const name = el.querySelector("#m-login-name").value.trim(), email = el.querySelector("#m-login-email").value.trim();
      if(!name || !email) return;
      try{ localStorage.setItem(this.USER_KEY, JSON.stringify({ name, email })); }catch(err){}
      dlg.close(); this._paintLogin();
    });
    el.querySelector("#m-login-out").addEventListener("click", ()=>{
      try{ localStorage.removeItem(this.USER_KEY); }catch(err){}
      dlg.close(); this._paintLogin();
    });
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
      s.style.cssText = `left:${(rnd()*100).toFixed(2)}%;top:${(rnd()*100).toFixed(2)}%;width:${size}px;height:${size}px;--o:${big ? 0.95 : (0.25 + rnd()*0.5).toFixed(2)};`;
      if(big) s.className = "big";
      else if(i % 5 === 0){ s.className = "twinkle"; s.style.animationDelay = (rnd()*4).toFixed(2) + "s"; }
      box.appendChild(s);
    }
  },

  // Cometa diminuto: cada cierto tiempo cruza el fondo. Su cabeza mide 3 px (menos que las estrellas grandes).
  _startComets(){
    if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = this.el.querySelector(".m-stars");
    const launch = ()=>{
      if(this.isOpen() && !document.hidden){
        const W = this.el.clientWidth, H = this.el.clientHeight;
        const dir = Math.random() < 0.5 ? 1 : -1;
        const x0 = dir > 0 ? Math.random()*W*0.5 : W*0.5 + Math.random()*W*0.5;
        const y0 = Math.random()*H*0.35;
        const dist = 160 + Math.random()*140, ang = 18 + Math.random()*22;
        const dx = dir*Math.cos(ang*Math.PI/180)*dist, dy = Math.sin(ang*Math.PI/180)*dist;
        const rot = Math.atan2(dy, dx)*180/Math.PI;
        const c = document.createElement("span");
        c.className = "m-comet";
        box.appendChild(c);
        const a = c.animate([
          { transform:`translate(${x0}px,${y0}px) rotate(${rot}deg)`, opacity:0 },
          { opacity:1, offset:.15 },
          { opacity:1, offset:.75 },
          { transform:`translate(${x0+dx}px,${y0+dy}px) rotate(${rot}deg)`, opacity:0 }
        ], { duration:1800 + Math.random()*900, easing:"linear" });
        a.onfinish = ()=> c.remove();
      }
      setTimeout(launch, 9000 + Math.random()*13000);   // uno cada 9–22 s
    };
    setTimeout(launch, 4000 + Math.random()*4000);
  },

  // Las estrellas brillan un poco más cuando el cursor (o el dedo) se acerca
  _bindStars(){
    const stars = [...this.el.querySelectorAll(".m-stars i")];
    let pos = [], raf = 0, mx = -1e4, my = -1e4;
    const measure = ()=>{ pos = stars.map(s=>{ const r = s.getBoundingClientRect(); return { x:r.left + r.width/2, y:r.top + r.height/2 }; }); };
    const paint = ()=>{
      raf = 0;
      if(!pos.length) measure();
      const R = 180;
      stars.forEach((s,i)=>{
        const d = Math.hypot(pos[i].x - mx, pos[i].y - my);
        s.style.setProperty("--g", d < R ? Math.pow(1 - d/R, 1.4).toFixed(2) : "0");
      });
    };
    const ask = ()=>{ if(!raf) raf = requestAnimationFrame(paint); };
    this.el.addEventListener("pointermove", e=>{ mx = e.clientX; my = e.clientY; ask(); });
    this.el.addEventListener("pointerleave", ()=>{ mx = my = -1e4; ask(); });
    window.addEventListener("resize", ()=>{ pos = []; });
  },

  _branchPos(id){
    const a = SUBJECTS[id].ang * Math.PI / 180, k = SUBJECTS[id].push || 0;   // push: se aleja del Sol
    return { x: this.CX + (this.RX + k)*Math.cos(a), y: this.CY + (this.RY + k)*Math.sin(a) };
  },

  _bubble(id, d, x, y, cls){
    const wrap = document.createElement("div");
    wrap.className = "m-bubble " + cls;
    wrap.style.cssText = `left:${x - d/2}px;top:${y - d/2}px;width:${d}px;height:${d}px;`;
    wrap.innerHTML = `<button type="button" class="m-bubble-btn" data-id="${id}"><span class="m-label"></span><span class="m-pct"></span></button>`;
    wrap.querySelector(".m-label").textContent = SUBJECTS[id].label;
    if(id === "geo" && typeof GEO_ART !== "undefined"){       // octaedro de malla + figuras flotantes
      wrap.insertAdjacentHTML("afterbegin", GEO_ART.orbit);
      wrap.querySelector(".m-bubble-btn").insertAdjacentHTML("afterbegin", GEO_ART.core);
    }
    if(id === "calc" && typeof CALC_ART !== "undefined"){      // parábola con tangente + parábolas que salen y entran
      wrap.querySelector(".m-bubble-btn").insertAdjacentHTML("afterbegin", CALC_ART.core);
      wrap.insertAdjacentHTML("beforeend", CALC_ART.orbit);
    }
    if(id === "alg" && typeof ALG_ART !== "undefined"){       // fichas de álgebra (x + 1)²
      wrap.querySelector(".m-bubble-btn").insertAdjacentHTML("afterbegin", ALG_ART.core);
      wrap.insertAdjacentHTML("afterbegin", ALG_ART.back);     // hojas que quedan detrás de la burbuja
      wrap.insertAdjacentHTML("beforeend", ALG_ART.front);     // hojas que quedan delante
    }
    if(id === "fis" && typeof FIS_ART !== "undefined")        // masa central + manzana en órbita
      wrap.insertAdjacentHTML("beforeend", FIS_ART.art);
    if(id === "trig" && typeof TRIG_ART !== "undefined")      // ángulos desde un vértice + rótulos flotantes
      wrap.insertAdjacentHTML("beforeend", TRIG_ART.art);
    if(id === "int" && typeof INT_ART !== "undefined")        // columnas de Riemann bajo la curva
      wrap.insertAdjacentHTML("beforeend", INT_ART.art);
    return wrap;
  },

  _buildBranches(){
    const host = this.el.querySelector("#m-branches");
    BRANCH_IDS.forEach(id=>{
      const p = this._branchPos(id);
      const node = this._bubble(id, this.BD, p.x, p.y, "m-branch");
      host.appendChild(node);
      this.nodes[id] = node;
    });
    this._buildMid(host);
  },

  // Nodos amarillos fijos sobre la línea Matemáticas → rama (hoy: Aritmética entre Matemáticas y Álgebra).
  // Siempre se ven, estén o no abiertas las ramas.
  _buildMid(host){
    this.midNodes = {};
    BRANCH_IDS.forEach(bid=>{
      (SUBJECTS[bid].extras || []).filter(e => e[2] === "mid").forEach(([id])=>{
        const bp = this._branchPos(bid);
        const BR = this.BD/2;
        const dx = bp.x - this.CX, dy = bp.y - this.CY, len = Math.hypot(dx, dy);
        const gap = len - this.CR - BR;
        const size = Math.min(this.MIDD, Math.floor(gap - 24));        // burbuja pequeña: se revela al hacerle clic
        const d = this.CR + gap/2;
        const x = this.CX + dx/len*d, y = this.CY + dy/len*d;
        const node = this._bubble(id, size, x, y, "m-extra m-mid");
        node.title = SUBJECTS[id].label;
        host.appendChild(node);
        this.midNodes[id] = { node, lv:"a", pos:{ x, y, d:size }, parent:bid };
      });
    });
  },

  // Busca un nodo extra o amarillo por id
  _ex(id){ return this.extraNodes[id] || this.midNodes[id] || null; },
  _exPos(id){ const m = this.midNodes[id]; return this.extraPos[id] || (m && m.pos) || null; },

  // Brillo amarillo de Álgebra: solo hasta el primer clic en ella
  _hintDone(){ try{ return !!localStorage.getItem(this.HINT_KEY); }catch(e){ return !!this._hd; } },
  _markHint(){ this._hd = true; try{ localStorage.setItem(this.HINT_KEY, "1"); }catch(e){} },

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
    const ring = cur.extras.filter(e => e[2] !== "mid");      // los que van en el anillo exterior
    const n = ring.length;
    const offs = n === 3 ? [-22, 0, 22] : [-18, 18];
    const bp = this._branchPos(cur.id);
    const colors = { a:"#7CF0C9", m:"#8AA4FF", b:"#5A627C" };
    let ri = 0;
    cur.extras.forEach((ex)=>{
      const [id, lv, where] = ex;
      if(where === "mid") return;                       // el nodo amarillo es fijo (ver _buildMid)
      const size = REL_LEVELS[lv].size;
      const t = (cur.ang + offs[ri++]) * Math.PI / 180;
      const k = cur.push || 0;                          // el anillo de subtemas también se aleja si la rama se alejó
      const x = this.CX + (this.ORX + k)*Math.cos(t);
      const y = this.CY + (this.ORY + k)*Math.sin(t);
      const node = this._bubble(id, size, x, y, "m-extra");
      host.appendChild(node);
      lines.appendChild(this._line(bp.x, bp.y, x, y, colors[lv], lv === "b"));
      this.extraNodes[id] = { node, lv };
      this.extraPos[id] = { x, y, d:size };
    });
  },

  // ---------------- interacción ----------------
  _exitIntro(){
    this.intro = false;
    this.world.classList.add("m-slow");
    setTimeout(()=> this.world.classList.remove("m-slow"), 1300);
    this.render();
  },

  _onClick(e){
    if(e.target.closest(".m-login-dlg") || e.target.closest(".m-orb") || e.target.closest("#m-login")) return;
    if(this.el.classList.contains("bh-event")) return;        // durante el colapso no se puede interactuar
    if(e.target.closest("#m-collapse")){ this._playHole(); return; }
    if(e.target.closest("#m-replay")){ this.el.classList.remove("is-bh"); this._playHole(); return; }
    if(this.intro){ if(!e.target.closest(".m-top")) this._exitIntro(); return; }
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
    if(id === "alg") this._markHint();                 // ya sabe por dónde empezar: se apaga el brillo
    if(s.kind === "branch") this.branch = id;
    else if(!this._ex(id)) return;
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
    if(!isUnlocked(id) || !s.available){
      const ex = this._ex(id), n = (this.nodes[id] || (ex && ex.node));
      if(n){ n.classList.remove("m-shake"); void n.offsetWidth; n.classList.add("m-shake"); }
      const box = this.panel && this.panel.querySelector(".m-lock");
      if(box){ box.classList.remove("m-shake"); void box.offsetWidth; box.classList.add("m-shake"); }
      return;
    }
    // La institución se elige al escoger la asignatura (una vez por asignatura; se recuerda)
    Plans.subject = id; Plans.load();
    const go = ()=>{ this.el.classList.add("is-leaving"); setTimeout(()=> this.openCourse(id), 320); };
    if(Plans.sel) go();
    else Plans.openWizard(()=>{ UI.renderSidebar(); go(); }, true);
  },

  // Aquí se conecta cada curso con su contenido
  openCourse(id){
    if(!isUnlocked(id)) return;          // nunca abrir una materia bloqueada
    this.hide();
    if(id === "calc"){ Constellation.show(); }
    if(id === "ari"){ AriScreen.show(); }
  },

  // ---------------- dibujo ----------------
  render(){
    const f = this.focus, b = this.branch;
    this.el.classList.toggle("has-focus", !!f);
    this.el.classList.toggle("is-intro", !!this.intro);

    if(this._extrasFor !== b) this._buildExtras();

    BRANCH_IDS.forEach(id=>{
      const node = this.nodes[id];
      const rel = b && id !== b ? SUBJECTS[b].rel[id] : null;
      const hint = id === "alg" && !this._hintDone() && !this.intro && !this.el.classList.contains("is-bh");
      node.className = "m-bubble m-branch" + (hint ? " m-nudge" : "") + (rel ? " lv-" + rel : "") + (id === b ? " is-open" : "") +
        (f === id ? " is-focus" : "") + (f && f !== id ? " is-dim" : "") + (isUnlocked(id) ? "" : " is-locked");
      this._fill(node, id, f === id);
      if(hint){
        const btn = node.querySelector(".m-bubble-btn");
        btn.setAttribute("aria-label", btn.getAttribute("aria-label") + ". Sugerida para empezar");
        node.title = "Empieza aquí";
      } else node.removeAttribute("title");
    });
    Object.keys(this.midNodes).forEach(id=>{            // nodo amarillo fijo
      const { node } = this.midNodes[id];
      node.className = "m-bubble m-extra m-mid" + (subjectPct(id) >= 100 ? " m-mid-done" : "") + (f === id ? " is-focus" : "") + (f && f !== id ? " is-dim" : "") + (isUnlocked(id) ? "" : " is-locked");
      this._fill(node, id, f === id);
    });
    Object.keys(this.extraNodes).forEach(id=>{
      const { node, lv } = this.extraNodes[id];
      node.className = "m-bubble m-extra lv-" + lv + (this._fresh ? " m-enter" : "") + (f === id ? " is-focus" : "") + (f && f !== id ? " is-dim" : "") + (isUnlocked(id) ? "" : " is-locked");
      this._fill(node, id, f === id);
    });
    this._fresh = false;
    this.el.querySelector("#m-lines-center").classList.toggle("is-dim", !!f);
    this.el.querySelector("#m-lines-extra").classList.toggle("is-dim", !!f);

    this._sunStage();
    this.el.querySelector("#m-center-pct").textContent = this._pct() + "% avance";
    this.el.querySelector("#m-center").style.setProperty("--p", totalPct());
    this.el.querySelector("#m-center").setAttribute("aria-label", this.intro ? "Matemáticas: toca para comenzar" : "Matemáticas: volver a la vista general");
    if(f) this._renderPanel(f);
    this.panel.setAttribute("aria-hidden", f ? "false" : "true");
    this._applyView();
  },

  LOCK_SVG:`<svg class="m-lockico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`,

  _fill(node, id, pressed){
    const pct = subjectPct(id);
    node.style.setProperty("--p", pct);
    const bh = this.el.classList.contains("is-bh");      // tras el colapso ya no se muestran porcentajes
    node.querySelector(".m-pct").textContent = bh ? "" : pct + "%";
    const btn = node.querySelector(".m-bubble-btn");
    const locked = !isUnlocked(id);
    btn.setAttribute("aria-label", bh ? SUBJECTS[id].label : `${SUBJECTS[id].label}, ${locked ? "bloqueada, " : ""}${pct}% completado`);
    if(locked && !btn.querySelector(".m-lockico")) btn.insertAdjacentHTML("beforeend", this.LOCK_SVG);
    if(!locked){ const li = btn.querySelector(".m-lockico"); if(li) li.remove(); }
    btn.setAttribute("aria-pressed", pressed ? "true" : "false");
  },

  // Zoom: coloca la burbuja elegida a la izquierda y el recuadro a la derecha
  _applyView(){
    const vw = window.innerWidth, vh = window.innerHeight;
    const small = vw < 820;
    const short = vh < 560;                            // celular en horizontal
    const compact = small || short;                    // celular (vertical u horizontal)
    this.el.classList.toggle("m-compact", compact);
    this.el.classList.toggle("m-short", short);
    // en celular las burbujas se agrandan en la vista general (al hacer zoom vuelven a su tamaño)
    this.el.style.setProperty("--bs", compact && !this.intro && !this.focus ? this.BS : 1);
    const topPad = 70, botPad = 80;
    const availH = vh - topPad - botPad;
    const fit = Math.max(0.25, Math.min(vw / this.W, availH / this.H));
    let tx, ty, S;

    if(this.intro){
      const want = small ? Math.min(vw*0.8, vh*0.5) : Math.min(vh*0.64, vw*0.5);
      S = want / (this.CR*2);
      tx = vw/2 - this.CX*S;
      ty = vh/2 - this.CY*S;
    } else if(!this.focus){
      let hx = 0, hy = 0;                                                  // mitad del ancho/alto que ocupan las ramas + margen
      BRANCH_IDS.forEach(b=>{ const q = this._branchPos(b); hx = Math.max(hx, Math.abs(q.x - this.CX)); hy = Math.max(hy, Math.abs(q.y - this.CY)); });
      const k = compact ? this.BS : 1, m = compact ? 6 : 22;
      hx += this.BD*k/2 + m; hy += this.BD*k/2 + m;
      let oT = 44, oB = 44;                                                // en la vista general se aprovecha casi toda la altura
      if(compact){
        // se deja libre la cabecera y, en vertical, la franja de abajo donde viven el Desafío y la nebulosa de la racha
        const top = this.el.querySelector(".m-top"), sk = this.el.querySelector("#m-streak");
        oT = ((top && top.offsetHeight) || 56) + 4;
        oB = short ? 12 : (sk && sk.offsetHeight ? this.el.clientHeight - sk.offsetTop + 4 : 150);
      }
      const oH = Math.max(120, vh - oT - oB), oW = compact ? vw - 12 : vw;
      S = Math.min(oW / (2*hx), oH / (2*hy));
      tx = vw/2 - this.CX*S;
      ty = oT + oH/2 - this.CY*S;
    } else {
      const id = this.focus;
      let p, d;
      if(SUBJECTS[id].kind === "branch"){ p = this._branchPos(id); d = this.BD; }
      else { p = this._exPos(id); d = p.d; }
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
    const bh = this.el.classList.contains("is-bh");
    const esc = (t)=> String(t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

    const reqs = s.requisites.length
      ? s.requisites.map(r=>{
          const name = r.id ? SUBJECTS[r.id].label : r.title;
          const hard = r.id && r.min;
          const ok = hard && subjectPct(r.id) >= r.min;
          const need = hard ? ` · requiere ${r.min}%` : "";
          const rp = r.id && !bh ? `<em>${subjectPct(r.id)}%${hard ? (ok ? " ✓" : "") : ""}</em>` : "";
          return `<li class="${hard ? (ok ? "req-ok" : "req-miss") : ""}"><div><strong>${esc(name)}</strong><span>${esc(r.text)}${need}</span></div>${rp}</li>`;
        }).join("")
      : `<li class="none"><div><strong>Sin requisitos</strong><span>Es un buen punto de partida.</span></div></li>`;

    let related = "";
    if(s.kind === "branch"){
      const chips = Object.keys(s.rel).map(rid =>
        `<span class="m-chip lv-${s.rel[rid]}"><i></i>${esc(SUBJECTS[rid].label)}</span>`).join("");
      related = `<h3>Se relaciona con</h3><div class="m-chips">${chips}</div>`;
    } else if(this.midNodes[id]){
      related = "";                                   // el nodo base no muestra posición ni relación
    } else if(this.branch){
      const lv = this.extraNodes[id] ? this.extraNodes[id].lv : "b";
      related = `<h3>Relación con ${esc(SUBJECTS[this.branch].label)}</h3><div class="m-chips"><span class="m-chip lv-${lv}"><i></i>${REL_LEVELS[lv].label}</span></div>`;
    }

    const miss = missingReqs(id);
    const locked = miss.length > 0;
    const status = locked ? `Bloqueada` : s.available
      ? `Disponible · ${BLOCKS.length} bloques`
      : `Próximamente`;
    const lockBox = locked
      ? `<div class="m-lock" role="note"><b>🔒 Aún no puedes entrar</b><ul>${miss.map(m =>
          `<li>Completa <strong>${esc(m.label)}</strong> al ${m.min}% (llevas ${m.pct}%)</li>`).join("")}</ul></div>`
      : "";
    const action = locked
      ? `<button type="button" class="m-btn" data-act="enter" aria-disabled="true">🔒 Bloqueada</button>`
      : s.available
      ? `<button type="button" class="m-btn m-btn-primary" data-act="enter">Entrar al curso</button>`
      : `<button type="button" class="m-btn" data-act="enter" aria-disabled="true">Curso en preparación</button>`;

    this.panel.innerHTML = `
      <button type="button" class="m-close" data-act="close" aria-label="Cerrar y volver al mapa">×</button>
      <div class="m-eyebrow">${esc(status)}</div>
      <h2>${esc(s.label)}</h2>
      <p class="m-desc">${esc(s.desc)}</p>
      ${lockBox}
      ${bh ? "" : `<div class="m-prog">
        <div class="m-prog-top"><span>Tu avance</span><b>${pct}%</b></div>
        <div class="m-prog-bar"><div style="width:${pct}%"></div></div>
      </div>`}
      <h3>Requisitos</h3>
      <ul class="m-reqs">${reqs}</ul>
      ${related}
      <h3>Leyenda</h3>
      <div class="m-panel-legend">
        <span><i class="dot lv-a"></i>Muy relacionada</span>
        <span><i class="dot lv-m"></i>Relacionada</span>
        <span><i class="dot lv-b"></i>Poco relacionada</span>
        ${Object.keys(this.midNodes).some(k => subjectPct(k) < 100) ? `<span><i class="dot mid"></i>Materia base</span>` : ""}
        ${bh ? "" : `<span><i class="dot ring"></i>Anillo = completado</span>`}
      </div>
      <div class="m-actions">${action}<span class="m-tip">o toca de nuevo la burbuja</span></div>
    `;
  }
};
