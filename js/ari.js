/* =========================================================
   ASTRO-matiks — constelación de Aritmética (solo la vista)
   Primera estrella: "Conjuntos numéricos y sistemas de numeración".
   Aún no tiene lecciones: usa el mismo lenguaje visual de
   constelación.css y el botón queda en "Próximamente".
   Las demás estrellas se agregarán después en STARS.
   ========================================================= */

const AriScreen = {
  STARS:[
    { id:"conjuntos", title:"Conjuntos numéricos y sistemas de numeración" }
  ],

  _star(size){
    const c = size / 2, k = (size * 0.14).toFixed(2);
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">` +
      `<path d="M${c} 0 C${c + +k} ${c - k} ${c + +k} ${c - k} ${size} ${c} C${c + +k} ${c + +k} ${c + +k} ${c + +k} ${c} ${size} ` +
      `C${c - k} ${c + +k} ${c - k} ${c + +k} 0 ${c} C${c - k} ${c - k} ${c - k} ${c - k} ${c} 0Z"/></svg>`;
  },

  init(){
    if(this.el) return;
    const s = this.STARS[0];
    const el = document.createElement("div");
    el.id = "ari-screen";
    el.className = "c-screen is-ari";
    el.setAttribute("aria-label", "Constelación de Aritmética");
    el.innerHTML = `
      <div class="c-bg"></div>
      <div class="c-stars" aria-hidden="true"></div>
      <header class="c-top">
        <button type="button" class="c-back" id="ari-back">← Mapa</button>
        <button type="button" class="c-plan" id="ari-plan" title="Cambiar institución"></button>
      </header>
      <div class="c-hero">
        <div class="c-sun" aria-hidden="true" style="--p:0"><i></i></div>
        <div><h1>Constelación de Aritmética</h1><p>Avance total 0%</p></div>
      </div>
      <div class="c-sky">
        <svg class="c-lines" aria-hidden="true"></svg>
        <div>
          <button type="button" class="c-node on sel" style="--s:38px; left:50%; top:calc(38% + 10px); width:210px" aria-pressed="true"
                  aria-label="${s.title}, próximamente">
            <span class="c-star">${this._star(38)}</span>
            <span class="c-name">${s.title}</span>
            <span class="c-pct">Próximamente</span>
          </button>
        </div>
      </div>
      <section class="c-panel" aria-live="polite">
        <h2>${s.title}</h2>
        <div class="c-secs">
          <div class="c-sec"><span class="c-sec-top"><span>Lecciones</span><b>0%</b></span><span class="c-bar"><i class="mint" style="width:0%"></i></span></div>
          <div class="c-sec"><span class="c-sec-top"><span>Práctica</span><b>0%</b></span><span class="c-bar"><i class="peri" style="width:0%"></i></span></div>
          <div class="c-sec"><span class="c-sec-top"><span>Examen</span><b>0%</b></span><span class="c-bar"><i class="peri" style="width:0%"></i></span></div>
        </div>
        <button type="button" class="c-go" disabled>Próximamente</button>
      </section>`;
    document.body.appendChild(el);
    this.el = el;
    this._buildStars();
    el.querySelector("#ari-back").addEventListener("click", ()=>{ this.hide(); MapScreen.show(); });
    el.querySelector("#ari-plan").addEventListener("click", ()=>{
      Plans.openWizard(()=>{ UI.renderSidebar(); this._label(); }, true);
    });
  },

  _label(){ this.el.querySelector("#ari-plan").textContent = Plans.label(); },

  _buildStars(){
    const box = this.el.querySelector(".c-stars");
    let seed = 11;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for(let i = 0; i < 46; i++){
      const d = document.createElement("i");
      const size = rnd() < 0.2 ? 3 : 2;
      d.style.cssText = `left:${(rnd()*100).toFixed(2)}%;top:${(rnd()*100).toFixed(2)}%;width:${size}px;height:${size}px;opacity:${(0.2 + rnd()*0.45).toFixed(2)};`;
      if(i % 6 === 0){ d.className = "tw"; d.style.animationDelay = (rnd()*4).toFixed(2) + "s"; }
      box.appendChild(d);
    }
  },

  show(){
    this.init();
    document.body.classList.remove("in-session", "on-map", "on-const");
    document.body.classList.add("on-ari");
    this._label();
  },

  hide(){ document.body.classList.remove("on-ari"); }
};
