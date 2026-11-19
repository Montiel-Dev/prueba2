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

const MAX_DIM = 1400;        // tamaño máximo (px) de la foto ya comprimida
const JPEG_Q = 0.82;
const MAX_SOURCE_MB = 20;    // límite del archivo original, antes de comprimir

const State = {
  step: "intro",      // intro | preview | loading | result | error
  imageDataUrl: null,
  mime: "image/jpeg",
  count: 4,
  data: null,          // respuesta de /api/variantes cuando ok:true
  errorMsg: "",
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
    State.step = "preview";
  }catch(e){
    State.step = "error"; State.errorMsg = e.message; State.canRetry = true;
  }
  render();
}

/* ---------------- llamada al servidor ---------------- */

async function generate(){
  State.step = "loading"; render();

  if(location.protocol === "file:"){
    State.step = "error"; State.canRetry = true;
    State.errorMsg = "Esta función necesita el sitio corriendo en un servidor (Vercel o `vercel dev`), no abriendo el archivo con doble clic.";
    return render();
  }

  try{
    const r = await fetch("/api/variantes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: State.imageDataUrl, mime: State.mime, count: State.count })
    });
    const d = await r.json().catch(() => ({}));

    if(!r.ok || d.error){
      State.step = "error"; State.canRetry = true;
      State.errorMsg = d.error || "No se pudo generar las variantes. Intenta de nuevo.";
      return render();
    }
    if(d.ok === false){
      State.step = "error"; State.canRetry = true;
      State.errorMsg = d.motivo || "No se reconoció un problema de derivadas en la foto. Intenta con otra.";
      return render();
    }

    State.data = d;
    State.openIdx = new Set();
    State.step = "result";
  }catch(e){
    State.step = "error"; State.canRetry = true;
    State.errorMsg = "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.";
  }
  render();
}

function reset(){
  State.step = "intro"; State.imageDataUrl = null; State.data = null; State.errorMsg = "";
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
  <div class="hero"><div class="eyebrow">Paso 2</div><h1>¿Se ve bien la foto?</h1></div>
  <section class="card">
    <img class="shot-preview" src="${State.imageDataUrl}" alt="Foto del problema">
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

function screenLoading(){
  return `
  <section class="card proc">
    <div class="spin"></div>
    <h3>Leyendo tu foto y creando variantes…</h3>
    <p class="mu">Esto puede tardar unos segundos.</p>
  </section>`;
}

function screenError(){
  return `
  <section class="card">
    <div class="alert bad">${esc(State.errorMsg)}</div>
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
