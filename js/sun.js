/* =========================================================
   ASTRO-matiks — el Sol-faro (burbuja central) y el agujero negro
   - El color de la estrella evoluciona con el % total de la materia,
     como las estrellas reales según su temperatura:
     0 % roja (M) → naranja (K) → amarilla (G) → blanca (A) → blanco-azulada (B, 100 %).
   - Los 12 rayos se encienden uno a uno (como las Power Stars del faro).
   - Al llegar al 100 %: la estrella colapsa, explota y queda un agujero negro;
     las burbujas se espaguetizan y caen. Después reaparecen girando alrededor.
   Vista previa sin avanzar:  ?pct=60   |   ?fase=agujero
   ========================================================= */
const STAR_STOPS = [
  { p:0,   c1:"#FF8A57", c2:"#D9452B", c3:"#7A1E12", gl:"#FF5A36" },
  { p:25,  c1:"#FFD08A", c2:"#F29A3A", c3:"#9A4F12", gl:"#FF9A3C" },
  { p:50,  c1:"#FFF6D8", c2:"#F7D06A", c3:"#B9741A", gl:"#FFD25A" },
  { p:75,  c1:"#FFFFFF", c2:"#EAF0FF", c3:"#9FB4E6", gl:"#DCE6FF" },
  { p:100, c1:"#F2F8FF", c2:"#A9CBFF", c3:"#4F78D6", gl:"#7FB0FF" }
];
const _hex = h => [1,3,5].map(i => parseInt(h.slice(i, i+2), 16));
const _mix = (a, b, t) => "#" + _hex(a).map((v,i) => Math.round(v + (_hex(b)[i] - v) * t).toString(16).padStart(2,"0")).join("");
const _lum = h => { const [r,g,b] = _hex(h).map(v => { v /= 255; return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); }); return .2126*r + .7152*g + .0722*b; };

Object.assign(MapScreen, {
  _params(){ try{ return new URLSearchParams(location.search); }catch(e){ return new URLSearchParams(""); } },
  _pct(){
    const q = this._params();
    if(q.get("fase") === "agujero") return 100;
    const v = q.get("pct");
    return v !== null ? Math.max(0, Math.min(100, +v || 0)) : totalPct();
  },
  _starAt(p){
    let i = 0; while(i < STAR_STOPS.length - 2 && p > STAR_STOPS[i+1].p) i++;
    const a = STAR_STOPS[i], b = STAR_STOPS[i+1], t = Math.max(0, Math.min(1, (p - a.p) / (b.p - a.p)));
    return { c1:_mix(a.c1,b.c1,t), c2:_mix(a.c2,b.c2,t), c3:_mix(a.c3,b.c3,t), gl:_mix(a.gl,b.gl,t) };
  },

  _buildSun(){
    const C = 260, host = this.el.querySelector("#m-sun"); this.sun = host;
    const P = (r,a) => `${(C + r*Math.cos(a)).toFixed(1)},${(C + r*Math.sin(a)).toFixed(1)}`;
    let rays = "", ticks = "";
    for(let k = 0; k < 12; k++){
      const a = -Math.PI/2 + k*Math.PI/6, L = 150 + (k%2 ? 0 : 22) + 10*Math.sin(k*2.1);
      rays  += `<polygon class="ray" points="${P(96,a-.03)} ${P(L,a)} ${P(96,a+.03)}"/>`;
      ticks += `<line class="tick" x1="${P(96,a).split(",")[0]}" y1="${P(96,a).split(",")[1]}" x2="${P(106,a).split(",")[0]}" y2="${P(106,a).split(",")[1]}"/>`;
    }
    const t = -22*Math.PI/180, ex = 176*Math.cos(210*Math.PI/180), ey = 46*Math.sin(210*Math.PI/180);
    const bx = (C + ex*Math.cos(t) - ey*Math.sin(t)).toFixed(1), by = (C + ex*Math.sin(t) + ey*Math.cos(t)).toFixed(1);
    const grad = (id, v) => `<linearGradient id="${id}"${v ? ' x1="0" y1="0" x2="0" y2="1"' : ""}><stop offset="0" style="stop-color:var(--gl);stop-opacity:0"/><stop offset=".5" style="stop-color:var(--c1)"/><stop offset="1" style="stop-color:var(--gl);stop-opacity:0"/></linearGradient>`;
    const ell = (rx, ry, cls, w, o) => `<ellipse class="${cls}" cx="${C}" cy="${C}" rx="${rx}" ry="${ry}" fill="none" stroke="url(#bh-d)" stroke-width="${w}" opacity="${o}" transform="rotate(-16 ${C} ${C})"/>`;
    host.innerHTML = `<svg viewBox="0 0 520 520" width="100%" height="100%" aria-hidden="true"><defs>
      <radialGradient id="ms-d"><stop offset="0" style="stop-color:var(--c1)"/><stop offset=".6" style="stop-color:var(--c2)"/><stop offset=".9" style="stop-color:var(--c2)"/><stop offset="1" style="stop-color:var(--c3)"/></radialGradient>
      <radialGradient id="ms-g"><stop offset=".3" style="stop-color:var(--gl);stop-opacity:var(--ga)"/><stop offset=".55" style="stop-color:var(--gl);stop-opacity:var(--gb)"/><stop offset="1" style="stop-color:var(--gl);stop-opacity:0"/></radialGradient>
      <radialGradient id="ms-h"><stop offset=".28" style="stop-color:var(--gl);stop-opacity:.75"/><stop offset=".45" style="stop-color:var(--gl);stop-opacity:.3"/><stop offset=".7" style="stop-color:var(--gl);stop-opacity:.1"/><stop offset="1" style="stop-color:var(--gl);stop-opacity:0"/></radialGradient>
      <filter id="ms-b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
      <radialGradient id="ms-e"><stop offset=".86" style="stop-color:var(--gl);stop-opacity:0"/><stop offset="1" style="stop-color:var(--gl);stop-opacity:.5"/></radialGradient>
      ${grad("ms-s")}${grad("ms-sv", true)}
      <filter id="ms-n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.1 -.35"/></filter>
      <clipPath id="ms-k"><circle cx="${C}" cy="${C}" r="78"/></clipPath>
      <linearGradient id="bh-d"><stop offset="0" stop-color="#FF6A2A"/><stop offset=".5" stop-color="#FFE9C4"/><stop offset="1" stop-color="#FFB347"/></linearGradient>
      <radialGradient id="bh-g"><stop offset=".6" stop-color="#FF9A3C" stop-opacity="0"/><stop offset=".82" stop-color="#FF9A3C" stop-opacity=".35"/><stop offset="1" stop-color="#FF9A3C" stop-opacity="0"/></radialGradient>
    </defs>
    <g class="m-sun-star">
      <circle class="halo" cx="${C}" cy="${C}" r="258" fill="url(#ms-h)"/>
      <circle class="corona" cx="${C}" cy="${C}" r="86" fill="none" stroke-width="16" style="stroke:var(--gl)" filter="url(#ms-b)"/>
      <circle class="glow" cx="${C}" cy="${C}" r="200" fill="url(#ms-g)"/>
      <rect class="sp" x="${C-190}" y="${C-.75}" width="380" height="1.5" fill="url(#ms-s)"/><rect class="sp" x="${C-.75}" y="${C-190}" width="1.5" height="380" fill="url(#ms-sv)"/>
      <rect class="beam" x="${C-3}" y="30" width="6" height="${2*C-60}" fill="url(#ms-sv)"/>
      <g class="spin a"><ellipse class="orb" cx="${C}" cy="${C}" rx="176" ry="46" transform="rotate(-22 ${C} ${C})"/><circle class="bead" cx="${bx}" cy="${by}" r="3.5"/></g>
      <g class="spin b"><ellipse class="orb" cx="${C}" cy="${C}" rx="148" ry="36" transform="rotate(28 ${C} ${C})"/></g>
      ${rays}${ticks}
      <circle cx="${C}" cy="${C}" r="82" fill="url(#ms-e)"/><circle cx="${C}" cy="${C}" r="78" fill="url(#ms-d)"/>
      <g clip-path="url(#ms-k)"><rect x="${C-78}" y="${C-78}" width="156" height="156" filter="url(#ms-n)" style="fill:var(--c3)" opacity=".28"/></g>
      <circle cx="${C}" cy="${C}" r="90" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="3"/>
      <circle class="ringp" cx="${C}" cy="${C}" r="90" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="3" stroke-linecap="round" transform="rotate(-90 ${C} ${C})"/>
    </g>
    <circle class="m-flash" cx="${C}" cy="${C}" r="60" fill="#fff"/>
    <circle class="m-shock" cx="${C}" cy="${C}" r="40" fill="none" stroke="#fff" stroke-width="3"/>
    <g class="m-hole">
      <circle cx="${C}" cy="${C}" r="100" fill="url(#bh-g)"/>
      ${ell(160,38,"disk",12,.28)}${ell(160,38,"disk flow",5,.7)}${ell(120,28,"disk flow2",3,.9)}
      <circle cx="${C}" cy="${C}" r="50" fill="none" stroke="#FF9A3C" stroke-opacity=".35" stroke-width="7"/>
      <circle cx="${C}" cy="${C}" r="46" fill="none" stroke="#FFE2B0" stroke-width="2"/>
      <circle cx="${C}" cy="${C}" r="42" fill="#000"/>
      <path d="M ${C-160} ${C} A 160 38 0 0 0 ${C+160} ${C}" fill="none" stroke="url(#bh-d)" stroke-width="7" stroke-linecap="round" transform="rotate(-16 ${C} ${C})"/>
      <path d="M ${C-54} ${C-8} A 56 56 0 0 1 ${C+54} ${C-8}" fill="none" stroke="#FFB347" stroke-width="5" stroke-linecap="round" opacity=".9" transform="rotate(-16 ${C} ${C})"/>
    </g></svg>`;
  },

  // Pinta la estrella según el porcentaje
  _paintSun(p){
    const f = p/100, c = this._starAt(p), s = this.sun.style;
    ["c1","c2","c3","gl"].forEach(k => s.setProperty("--" + k, c[k]));
    s.setProperty("--ga", (.22 + .2*f).toFixed(2));
    s.setProperty("--gb", (.08 + .08*f).toFixed(2));
    s.setProperty("--ha", (.4 + .4*f).toFixed(2));      // halo amplio
    s.setProperty("--cor", (.5 + .4*f).toFixed(2));     // corona junto al disco
    s.setProperty("--orb", (.14 + .3*f).toFixed(2));
    s.setProperty("--sp", p >= 50 ? (.5*f).toFixed(2) : "0");
    s.setProperty("--beam", p >= 100 ? ".3" : "0");
    this.el.style.setProperty("--tc", _lum(_mix(c.c1, c.c2, .5)) > .3 ? "#0C0E15" : "#FFFFFF");
    const lit = Math.round(12*f);
    this.sun.querySelectorAll(".ray").forEach((r,i) => r.classList.toggle("on", i < lit));
    this.sun.querySelectorAll(".tick").forEach((r,i) => r.classList.toggle("off", i < lit));
    const L = 2*Math.PI*90, ring = this.sun.querySelector(".ringp");
    ring.setAttribute("stroke-dasharray", `${(L*f).toFixed(1)} ${L.toFixed(1)}`);
    ring.style.opacity = p ? 1 : 0;
    this.sun.querySelector(".glow").setAttribute("r", (150 + 50*f).toFixed(0));
  },

  // Se llama desde render(): color, fase de agujero negro y botón de repetir
  _sunStage(){
    const p = this._pct(), el = this.el, force = this._params().get("fase") === "agujero";
    this._paintSun(p);
    if(p < 100){
      el.classList.remove("is-bh");
      if(this._params().get("pct") === null && !force){ try{ localStorage.removeItem("dojo-bh"); }catch(e){} }
    } else if(!el.classList.contains("is-bh") && !this._holeBusy){
      let seen = false; try{ seen = localStorage.getItem("dojo-bh") === "1"; }catch(e){}
      if(seen && !force) el.classList.add("is-bh");
    }
    const bh = el.classList.contains("is-bh");
    // Al llegar al 100 % se ofrece colapsar la estrella (no ocurre solo)
    const cb = el.querySelector("#m-collapse");
    if(cb) cb.hidden = !(p >= 100 && !bh && !this._holeBusy && !this.intro && !this.focus);
    const rb = el.querySelector("#m-replay");
    if(rb) rb.hidden = !bh;
  },

  // Colapso → supernova → agujero negro, con las burbujas espaguetizadas
  _playHole(){
    if(this._holeBusy) return;
    this._holeBusy = true;
    const el = this.el, sun = this.sun;
    const still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    try{ localStorage.setItem("dojo-bh", "1"); }catch(e){}
    const cb = el.querySelector("#m-collapse"); if(cb) cb.hidden = true;
    if(still){ el.classList.add("is-bh"); this._holeBusy = false; this.render(); return; }
    el.classList.remove("is-bh");
    el.classList.add("bh-event");
    void sun.offsetWidth;
    sun.classList.add("bh-collapse");
    setTimeout(()=> this._spaghetti(), 2800);
    setTimeout(()=>{ el.classList.add("is-bh"); this.render(); }, 3400);     // desde aquí las burbujas pierden sus porcentajes
    setTimeout(()=>{ sun.classList.remove("bh-collapse"); el.classList.remove("bh-event"); this._holeBusy = false; }, 8200);
  },

  // Cada burbuja se estira hacia el centro, se hace un hilo y cae; luego reaparece
  _spaghetti(){
    BRANCH_IDS.forEach((id, i)=>{
      const node = this.nodes[id], p = this._branchPos(id);
      const dx = this.CX - p.x, dy = this.CY - p.y, th = Math.atan2(dy, dx) * 180 / Math.PI;
      const T = (k, sx, sy) => `translate(${dx*k}px,${dy*k}px) rotate(${th}deg) scale(${sx},${sy}) rotate(${-th}deg)`;
      const fall = node.animate([
        { transform:"none", opacity:1 },
        { transform:T(.22,1.4,.88), opacity:1, offset:.25 },
        { transform:T(.6,3.4,.45), opacity:1, offset:.6 },
        { transform:T(.96,11,.07), opacity:0 }
      ], { duration:2600, delay:i*160, easing:"cubic-bezier(.5,0,.9,.5)", fill:"both" });
      fall.onfinish = ()=> setTimeout(()=>{
        fall.cancel();
        node.animate([{ opacity:0, transform:"scale(.4)" }, { opacity:1, transform:"none" }], { duration:1100, easing:"ease-out" });
      }, 900);
    });
  }
});
