/* =========================================================
   Derivadas Dojo — Escáner de problemas (cámara + IA)
   Flujo: tomar/subir foto -> comprimir en el navegador ->
   POST /api/variantes -> muestra N variantes con solución
   paso a paso (mismo tema y dificultad que la foto).

   Acceso: por ahora es GRATIS para todos a propósito (ver
   nota en api/variantes.js sobre cómo volverlo parte de
   Dojo Pro más adelante con Pay.isPro()).
   ========================================================= */

const $app = document.getElementById("app");

const MAX_DIM = 1000;        // tamaño máximo (px) de la foto ya comprimida (más chica = más rápido)
const JPEG_Q = 0.75;
const MAX_SOURCE_MB = 20;    // límite del archivo original, antes de comprimir
const CLIENT_TIMEOUT_MS = 58000; // si el servidor no responde en este tiempo, se avisa en vez de esperar sin fin

const State = {
  step: "intro",      // intro | reading | preview | loading | result | error
  texto: "",          // texto del problema (leído de la foto o escrito por el alumno)
  readWarn: "",       // aviso si no se pudo leer la foto
  imageDataUrl: null,
  mime: "image/jpeg",
  count: 4,
  data: null,          // respuesta de /api/variantes cuando ok:true
  errorMsg: "",
  detail: "",
  canRetry: true,
  openIdx: new Set()   // índices de variantes con la solución abierta
};

const NIVEL_LABEL = { 1: "Básico", 2: "Intermedio", 3: "Avanzado" };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function topbar(){
  return `<div class="bar">
    <a class="back" href="index.html">← Dojo</a>
    <span class="brand"><span class="mark">d/dx</span> Escáner de problemas</span>
    <span class="pill" style="color:var(--accent);border-color:var(--accent)">NUEVO</span>
    <button class="theme-btn" id="btn-theme" type="button" aria-label="Cambiar tema" title="Tema claro / oscuro">◐</button>
  </div>`;
}

function themeBtn(){
  const b = document.getElementById("btn-theme");
  if(!b) return;
  b.onclick = () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try{ localStorage.setItem("dojo-theme", next); }catch(e){}
  };
}

/* ---------------- captura + compresión ---------------- */

function fileToCompressedDataUrl(file){
  return new Promise((resolve, reject) => {
    if(!file.type.startsWith("image/")) return reject(new Error("Ese archivo no es una imagen."));
    if(file.size > MAX_SOURCE_MB * 1024 * 1024) return reject(new Error(`La foto pesa más de ${MAX_SOURCE_MB} MB.`));

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la foto."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo abrir la foto."));
      img.onload = () => {
        let { width: w, height: h } = img;
        if(w > MAX_DIM || h > MAX_DIM){
          const scale = MAX_DIM / Math.max(w, h);
          w = Math.round(w * scale); h = Math.round(h * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", JPEG_Q));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function onFile(file){
  if(!file) return;
  try{
    State.imageDataUrl = await fileToCompressedDataUrl(file);
    State.mime = "image/jpeg";
    State.data = null;
    State.openIdx = new Set();
  }catch(e){
    State.step = "error"; State.errorMsg = e.message; State.canRetry = true;
    return render();
  }
  readPhoto();
}

/* ---------------- llamadas al servidor ---------------- */

// POST JSON con límite de tiempo propio (así nunca se queda esperando sin fin).
async function postJson(url, body, ms){
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try{
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal });
    const d = await r.json().catch(() => ({}));
    return { ok: r.ok, d };
  }finally{ clearTimeout(timer); }
}

function startTicker(){
  const t0 = Date.now();
  const tick = setInterval(() => {
    const el = document.getElementById("elapsed");
    if(el) el.textContent = Math.round((Date.now() - t0) / 1000) + " s";
  }, 500);
  return () => clearInterval(tick);
}

/* Paso 1: foto -> texto del problema. Si falla, NO se bloquea al alumno:
   pasa a la pantalla de texto para que lo escriba o lo corrija. */
async function readPhoto(){
  State.step = "reading"; State.readWarn = ""; State.texto = ""; render();
  const stop = startTicker();
  try{
    if(location.protocol === "file:") throw new Error("file");
    const { ok, d } = await postJson("/api/leer", { image: State.imageDataUrl, mime: State.mime }, CLIENT_TIMEOUT_MS);
    console.log("[escáner] leer:", d.debug || d);
    if(ok && d.ok && d.texto) State.texto = d.texto;
    else State.readWarn = d.motivo || d.error || "No pude leer la foto.";
  }catch(e){
    State.readWarn = e && e.name === "AbortError" ? "La lectura de la foto tardó demasiado." : "No pude leer la foto.";
  }finally{ stop(); }
  if(State.readWarn) State.readWarn += " Escribe el problema aquí abajo y sigue sin foto, o toma otra.";
  State.step = "preview";
  render();
}

/* Paso 2: texto -> variantes (sin imagen, rápido). */
async function generate(){
  const ta = document.getElementById("texto");
  if(ta) State.texto = ta.value.trim();
  if(State.texto.length < 3){ State.readWarn = "Escribe el problema primero."; return render(); }
  State.step = "loading"; State.detail = ""; render();

  if(location.protocol === "file:"){
    State.step = "error"; State.canRetry = true;
    State.errorMsg = "Esta función necesita el sitio corriendo en un servidor (Vercel o `vercel dev`), no abriendo el archivo con doble clic.";
    return render();
  }

  const t0 = Date.now();
  const stop = startTicker();
  try{
    const { ok, d } = await postJson("/api/variantes", { texto: State.texto, count: State.count }, CLIENT_TIMEOUT_MS);
    console.log("[escáner] variantes", Math.round((Date.now() - t0) / 1000) + " s", "| servidor:", d.debug || d);

    if(!ok || d.error){
      State.step = "preview"; State.readWarn = (d.error || "No se pudieron generar las variantes.") + " Puedes volver a intentarlo.";
      State.detail = d.detalle || "";
      return render();
    }
    State.data = d;
    State.openIdx = new Set();
    State.step = "result";
  }catch(e){
    State.step = "preview";
    State.readWarn = e && e.name === "AbortError"
      ? "La IA tardó demasiado. Vuelve a intentarlo (con menos variantes suele ir más rápido)."
      : "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.";
  }finally{ stop(); }
  render();
}

function reset(){
  State.step = "intro"; State.imageDataUrl = null; State.texto = ""; State.readWarn = ""; State.data = null; State.errorMsg = "";
  render();
}

/* ---------------- pantallas ---------------- */

function screenIntro(){
  const offline = location.protocol === "file:";
  return `
  <div class="hero">
    <div class="eyebrow">Practica con tus propios problemas</div>
    <h1>Escáner de problemas</h1>
    <p class="mu">Toma una foto a un problema de derivadas (de tu libro, tarea o examen) y genera
    <strong>variantes parecidas</strong> — mismo tema y misma dificultad, con números distintos —
    cada una con su solución paso a paso, para seguir practicando.</p>
  </div>
  ${offline ? `<div class="alert warn">Para usar el escáner, abre el sitio publicado (Vercel) o corre <code>vercel dev</code> — no funciona abriendo <code>index.html</code> con doble clic.</div>` : ""}
  <section class="card">
    <h3>1. Consigue una foto del problema</h3>
    <p class="mu" style="margin:0 0 14px">Que se vea completo y con buena luz. Puedes tomarla ahora o subir una que ya tengas.</p>
    <div class="gap">
      <label class="btn lg" for="file-camera">📷 Tomar foto</label>
      <label class="btn alt lg" for="file-upload">🖼️ Subir una foto</label>
    </div>
    <input type="file" id="file-camera" accept="image/*" capture="environment" hidden>
    <input type="file" id="file-upload" accept="image/*" hidden>
    <button type="button" class="lnk" id="btn-type" style="margin-top:10px">o escribe el problema a mano</button>
  </section>
  <section class="card">
    <h3>Cómo funciona</h3>
    <ul style="margin:0;padding-left:18px;color:var(--text-dim);font-size:14.5px;display:grid;gap:4px">
      <li>Lee tu foto y reconoce de qué problema se trata (tema y dificultad).</li>
      <li>Crea variantes nuevas con la misma técnica, pero otros números.</li>
      <li>Te da la solución completa, paso a paso, de cada variante.</li>
    </ul>
  </section>`;
}

function screenPreview(){
  return `
  <div class="hero"><div class="eyebrow">Paso 2</div><h1>Revisa el problema</h1></div>
  ${State.imageDataUrl ? `<section class="card"><img class="shot-preview" src="${State.imageDataUrl}" alt="Foto del problema"></section>` : ""}
  <section class="card">
    ${State.readWarn ? `<div class="alert warn">${esc(State.readWarn)}${State.detail ? `<div class="mu" style="font-size:12px;margin-top:6px">Detalle técnico: ${esc(State.detail)}</div>` : ""}</div>` : ""}
    <h3>Esto es lo que debo resolver</h3>
    <p class="mu" style="margin:0 0 8px">Corrígelo si la lectura de la foto no quedó exacta (p. ej. exponentes o signos).</p>
    <textarea id="texto" rows="3" maxlength="500" placeholder="Ej.: Deriva: f(x) = (3x^2 + 1)^4"
      style="width:100%;box-sizing:border-box;padding:12px;border-radius:var(--r-m);border:2px solid var(--line);background:var(--surface-2);color:var(--text);font:500 16px var(--font-ui);resize:vertical">${esc(State.texto)}</textarea>
  </section>
  <section class="card">
    <h3>¿Cuántas variantes quieres?</h3>
    <div class="count-picker" id="count-picker">
      ${[3, 4, 6].map(n => `<button type="button" class="count-opt${State.count === n ? " sel" : ""}" data-n="${n}">${n}</button>`).join("")}
    </div>
    <div class="gap" style="margin-top:16px">
      <button class="btn lg" id="btn-generate">✨ Generar variantes</button>
      <label class="lnk" for="file-camera" style="cursor:pointer">Tomar otra foto</label>
    </div>
    <input type="file" id="file-camera" accept="image/*" capture="environment" hidden>
  </section>`;
}

function screenReading(){
  return `
  <section class="card proc">
    <div class="spin"></div>
    <h3>Leyendo tu foto…</h3>
    <p class="mu">Unos segundos. <span id="elapsed">0 s</span></p>
  </section>`;
}

function screenLoading(){
  return `
  <section class="card proc">
    <div class="spin"></div>
    <h3>Creando variantes…</h3>
    <p class="mu">Esto puede tardar unos segundos. <span id="elapsed">0 s</span></p>
  </section>`;
}

function screenError(){
  return `
  <section class="card">
    <div class="alert bad">${esc(State.errorMsg)}${State.detail ? `<div class="mu" style="font-size:12px;margin-top:6px">Detalle técnico: ${esc(State.detail)}</div>` : ""}</div>
    <div class="gap">
      ${State.canRetry ? `<label class="btn" for="file-camera">📷 Tomar otra foto</label>` : ""}
      <button class="btn alt" id="btn-reset">Volver al inicio</button>
    </div>
    <input type="file" id="file-camera" accept="image/*" capture="environment" hidden>
  </section>`;
}

function screenResult(){
  const d = State.data;
  const nivel = NIVEL_LABEL[d.nivel] || "—";
  return `
  <div class="hero"><div class="eyebrow">${esc(d.tema || "Derivadas")} · Nivel ${esc(nivel)}</div>
    <h1>Variantes para practicar</h1>
    <p class="mu">Problema original que leí en tu foto: <em>${esc(d.transcripcion || "—")}</em></p>
  </div>
  <div class="var-list">
    ${d.variantes.map((v, i) => `
      <section class="card var-card">
        <div class="eyebrow">Variante ${i + 1}</div>
        <p class="var-enun">${esc(v.enunciado)}</p>
        <button type="button" class="lnk var-toggle" data-i="${i}">${State.openIdx.has(i) ? "Ocultar solución" : "Ver solución paso a paso"}</button>
        ${State.openIdx.has(i) ? `
          <ol class="var-steps">${v.pasos.map(p => `<li>${esc(p)}</li>`).join("")}</ol>
          <div class="var-result">${esc(v.resultado)}</div>
        ` : ""}
      </section>`).join("")}
  </div>
  <section class="card">
    <div class="gap">
      <button class="btn" id="btn-again">✨ Generar otras variantes</button>
      <label class="btn alt" for="file-camera">📷 Tomar otra foto</label>
    </div>
    <input type="file" id="file-camera" accept="image/*" capture="environment" hidden>
  </section>`;
}

/* ---------------- render + binds ---------------- */

function render(){
  const body =
    State.step === "intro" ? screenIntro() :
    State.step === "reading" ? screenReading() :
    State.step === "preview" ? screenPreview() :
    State.step === "loading" ? screenLoading() :
    State.step === "error" ? screenError() :
    screenResult();

  $app.innerHTML = topbar() + body;
  themeBtn();
  bind();
}

function bind(){
  const camInput = document.getElementById("file-camera");
  const upInput = document.getElementById("file-upload");
  if(camInput) camInput.onchange = e => onFile(e.target.files[0]);
  if(upInput) upInput.onchange = e => onFile(e.target.files[0]);

  const picker = document.getElementById("count-picker");
  if(picker) picker.querySelectorAll(".count-opt").forEach(b => {
    b.onclick = () => { State.count = +b.dataset.n; render(); };
  });

  const ta = document.getElementById("texto");
  if(ta) ta.oninput = () => { State.texto = ta.value; };
  const typeBtn = document.getElementById("btn-type");
  if(typeBtn) typeBtn.onclick = () => { State.imageDataUrl = null; State.readWarn = ""; State.step = "preview"; render(); const t = document.getElementById("texto"); if(t) t.focus(); };

  const genBtn = document.getElementById("btn-generate");
  if(genBtn) genBtn.onclick = generate;

  const againBtn = document.getElementById("btn-again");
  if(againBtn) againBtn.onclick = generate;

  const resetBtn = document.getElementById("btn-reset");
  if(resetBtn) resetBtn.onclick = reset;

  document.querySelectorAll(".var-toggle").forEach(b => {
    b.onclick = () => {
      const i = +b.dataset.i;
      State.openIdx.has(i) ? State.openIdx.delete(i) : State.openIdx.add(i);
      render();
    };
  });
}

render();
