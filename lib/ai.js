/* =========================================================
   Capa de IA multi-proveedor (solo servidor, carpeta api/).
   Las API keys NUNCA deben llegar al navegador.

   POR QUÉ SE CAMBIÓ (v3):
   Antes todo dependía de Gemini en UNA sola llamada pesada
   (foto + generar variantes + soluciones). Si Gemini se ponía
   lento, el "modelo de respaldo" también (mismo proveedor, misma
   cuota/red) y daba 504 en cadena. Ahora:

   1. DOS PASOS pequeños en vez de uno grande:
        a) leer(foto)      -> texto del problema   (salida corta)
        b) variantes(texto) -> N variantes         (SIN imagen)
      Solo el paso (a) usa visión; el (b) es texto puro y es
      mucho más rápido y lo resuelve cualquier modelo.
   2. VARIOS PROVEEDORES en carrera ("hedged requests"): se
      lanza el primero; si no contesta en HEDGE_MS (o falla)
      se lanza el siguiente SIN cancelar el primero; gana el
      primero que devuelva algo válido y se cancelan los demás.
      Proveedores: Groq, Gemini, Mistral, OpenRouter, Anthropic.
      Se usan solo los que tengan API key configurada.
   3. Respuesta JSON tolerante (extrae el primer {...}).
   ========================================================= */

const env = (k, d) => (process.env[k] !== undefined && process.env[k] !== "" ? process.env[k] : d);
const int = (k, d) => parseInt(process.env[k], 10) || d;

const HEDGE_MS = int("AI_HEDGE_MS", 9000);          // espera antes de lanzar el siguiente proveedor
const CALL_TIMEOUT_MS = int("AI_CALL_TIMEOUT_MS", 25000); // tope por llamada individual
const ORDER = env("AI_PROVIDERS", "groq,gemini,mistral,openrouter,anthropic")
  .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

/* ---------- definición de proveedores ---------- */
const PROVIDERS = {
  groq: {
    kind: "openai", keyEnv: "GROQ_API_KEY", json: true,
    url: "https://api.groq.com/openai/v1/chat/completions",
    visionModel: env("GROQ_VISION_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct"),
    textModel: env("GROQ_TEXT_MODEL", "llama-3.3-70b-versatile")
  },
  mistral: {
    kind: "openai", keyEnv: "MISTRAL_API_KEY", json: true,
    url: "https://api.mistral.ai/v1/chat/completions",
    visionModel: env("MISTRAL_VISION_MODEL", "mistral-small-latest"),
    textModel: env("MISTRAL_TEXT_MODEL", "mistral-small-latest")
  },
  openrouter: {
    kind: "openai", keyEnv: "OPENROUTER_API_KEY", json: false,
    url: "https://openrouter.ai/api/v1/chat/completions",
    visionModel: env("OPENROUTER_VISION_MODEL", "google/gemini-2.0-flash-001"),
    textModel: env("OPENROUTER_TEXT_MODEL", "meta-llama/llama-3.3-70b-instruct:free")
  },
  gemini: {
    kind: "gemini", keyEnv: "GEMINI_API_KEY",
    visionModel: env("GEMINI_MODEL", "gemini-flash-latest"),
    textModel: env("GEMINI_TEXT_MODEL", env("GEMINI_MODEL", "gemini-flash-latest"))
  },
  anthropic: {
    kind: "anthropic", keyEnv: "ANTHROPIC_API_KEY",
    visionModel: env("ANTHROPIC_MODEL", "claude-haiku-5-5"),
    textModel: env("ANTHROPIC_MODEL", "claude-haiku-5-5")
  }
};

function httpError(status, message, extra){
  const e = new Error(message);
  e.status = status;
  e.extra = extra;
  return e;
}

function send(res, status, body){
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

// Siempre devuelve un objeto ya parseado.
function jsonBody(req){
  let data = req.body;
  if(typeof data === "string"){
    try{ data = JSON.parse(data || "{}"); }
    catch(e){ throw httpError(400, "JSON inválido."); }
  }
  return data || {};
}

/* Proveedores con API key, en el orden de AI_PROVIDERS. */
function available({ vision } = {}){
  return ORDER
    .filter(n => PROVIDERS[n] && process.env[PROVIDERS[n].keyEnv])
    .map(n => ({ name: n, ...PROVIDERS[n], model: vision ? PROVIDERS[n].visionModel : PROVIDERS[n].textModel }))
    .filter(p => p.model);
}

/* ---------- llamada HTTP con timeout propio + cancelación externa ---------- */
async function fetchJson(url, options, signal, timeoutMs){
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  if(signal){ if(signal.aborted) ctrl.abort(); else signal.addEventListener("abort", onAbort, { once: true }); }
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, timeoutMs);
  try{
    const r = await fetch(url, { ...options, signal: ctrl.signal });
    const out = await r.json().catch(() => ({}));
    return { r, out };
  }catch(e){
    if(timedOut) throw httpError(504, `sin respuesta en ${Math.round(timeoutMs / 1000)} s`);
    if(e && e.name === "AbortError") throw httpError(499, "cancelado");
    throw httpError(502, "no se pudo conectar: " + String((e && e.message) || e).slice(0, 80));
  }finally{
    clearTimeout(timer);
    if(signal) signal.removeEventListener("abort", onAbort);
  }
}

const apiMessage = out => (out && out.error && (out.error.message || (typeof out.error === "string" ? out.error : ""))) || "";

/* ---------- adaptadores: devuelven SOLO el texto de la respuesta ---------- */
async function callOpenAI(p, { system, user, image, maxTokens }, signal){
  const content = image
    ? [{ type: "image_url", image_url: { url: `data:${image.mime};base64,${image.base64}` } }, { type: "text", text: user }]
    : user;
  const build = useJson => ({
    model: p.model, max_tokens: maxTokens, temperature: 0.4,
    ...(useJson ? { response_format: { type: "json_object" } } : {}),
    messages: [{ role: "system", content: system }, { role: "user", content }]
  });
  const headers = { "Content-Type": "application/json", Authorization: "Bearer " + process.env[p.keyEnv] };
  let useJson = !!p.json;
  for(let attempt = 0; attempt < 2; attempt++){
    const { r, out } = await fetchJson(p.url, { method: "POST", headers, body: JSON.stringify(build(useJson)) }, signal, CALL_TIMEOUT_MS);
    if(r.ok){
      const c = out.choices && out.choices[0];
      return { text: (c && c.message && c.message.content) || "", usage: out.usage || null };
    }
    if(r.status === 400 && useJson && /response_format|json/i.test(apiMessage(out))){ useJson = false; continue; }
    throw httpError(r.status, apiMessage(out) || "error HTTP " + r.status);
  }
  throw httpError(502, "respuesta inválida");
}

async function callAnthropic(p, { system, user, image, maxTokens }, signal){
  const content = [];
  if(image) content.push({ type: "image", source: { type: "base64", media_type: image.mime, data: image.base64 } });
  content.push({ type: "text", text: user });
  const { r, out } = await fetchJson("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env[p.keyEnv], "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: p.model, max_tokens: maxTokens, system, messages: [{ role: "user", content }] })
  }, signal, CALL_TIMEOUT_MS);
  if(!r.ok) throw httpError(r.status, apiMessage(out) || "error HTTP " + r.status);
  return { text: (out.content || []).filter(b => b.type === "text").map(b => b.text).join("\n"), usage: out.usage || null };
}

async function callGemini(p, { system, user, image, maxTokens }, signal){
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(p.model)}:generateContent`;
  const parts = [];
  if(image) parts.push({ inline_data: { mime_type: image.mime, data: image.base64 } });
  parts.push({ text: user });
  // Razonamiento mínimo para ir rápido; si el modelo no acepta esa config se reintenta sin ella.
  const thinking = /gemini-2\.5/.test(p.model) ? { thinkingBudget: 0 }
    : (/gemini-([3-9]|\d{2})/.test(p.model) || /latest/.test(p.model)) ? { thinkingLevel: "minimal" } : null;
  let think = process.env.GEMINI_THINKING === "default" ? null : thinking;
  for(let attempt = 0; attempt < 2; attempt++){
    const generationConfig = { maxOutputTokens: maxTokens, responseMimeType: "application/json", temperature: 0.4 };
    if(think) generationConfig.thinkingConfig = think;
    const { r, out } = await fetchJson(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env[p.keyEnv] },
      body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts }], generationConfig })
    }, signal, CALL_TIMEOUT_MS);
    if(r.ok){
      const cand = (out.candidates || [])[0];
      if(cand && (cand.finishReason === "SAFETY" || cand.finishReason === "RECITATION")) throw httpError(502, "bloqueado por seguridad");
      const text = ((cand && cand.content && cand.content.parts) || []).filter(x => !x.thought).map(x => x.text || "").join("\n");
      return { text, usage: out.usageMetadata || null };
    }
    if(r.status === 400 && think && /think/i.test(apiMessage(out))){ think = null; continue; }
    throw httpError(r.status, apiMessage(out) || "error HTTP " + r.status);
  }
  throw httpError(502, "respuesta inválida");
}

const ADAPTERS = { openai: callOpenAI, anthropic: callAnthropic, gemini: callGemini };

/* ---------- JSON tolerante ---------- */
function parseJsonLoose(text){
  const t = String(text || "").replace(/```json|```/gi, "").trim();
  if(!t) throw new Error("vacío");
  try{ return JSON.parse(t); }catch(e){ /* sigue */ }
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if(a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
  throw new Error("no es JSON");
}

/* ---------- carrera escalonada entre proveedores ---------- */
function hedged(list, task, { hedgeMs = HEDGE_MS, totalMs }){
  return new Promise((resolve, reject) => {
    const log = [];
    const ctrls = [];
    let next = 0, running = 0, done = false, hedgeTimer = null;
    const t0 = Date.now();

    const finish = (fn, v) => {
      if(done) return;
      done = true;
      clearTimeout(hedgeTimer); clearTimeout(deadline);
      ctrls.forEach(c => c.abort());
      fn(v);
    };
    const fail = reason => {
      const detalle = log.map(x => `${x.provider}: ${x.ok ? "ok" : (x.status || "?") + " " + x.error} (${Math.round(x.ms / 1000)} s)`).join(" → ");
      const statuses = log.map(x => x.status);
      const status = statuses.length && statuses.every(s => s === 429) ? 429 : 504;
      finish(reject, httpError(status,
        status === 429
          ? "Se alcanzó el límite gratis de la IA por ahora. Espera un minuto e intenta de nuevo."
          : "La IA no respondió a tiempo.",
        { detalle: detalle || reason, tried: log }));
    };
    const launch = () => {
      if(done || next >= list.length) return;
      const p = list[next++];
      const ctrl = new AbortController();
      ctrls.push(ctrl); running++;
      clearTimeout(hedgeTimer);
      if(next < list.length) hedgeTimer = setTimeout(launch, hedgeMs);
      const ts = Date.now();
      Promise.resolve().then(() => task(p, ctrl.signal)).then(
        value => {
          if(done) return;
          log.push({ provider: p.name, model: p.model, ok: true, ms: Date.now() - ts });
          finish(resolve, { value, provider: p.name, model: p.model, ms: Date.now() - t0, tried: log });
        },
        e => {
          if(done) return;
          running--;
          log.push({ provider: p.name, model: p.model, ok: false, status: e.status, error: String(e.message).slice(0, 100), ms: Date.now() - ts });
          console.log("[ia] fallo", JSON.stringify(log[log.length - 1]));
          if(next < list.length) launch();
          else if(running === 0) fail("todos fallaron");
        }
      );
    };
    const deadline = setTimeout(() => fail("tiempo total agotado"), totalMs);
    launch();
  });
}

/* Ejecuta una tarea de IA con carrera entre proveedores.
   validate(json) debe lanzar un Error si la respuesta no sirve (cuenta como fallo del proveedor). */
async function run({ vision, system, user, image, maxTokens, totalMs, validate }){
  const list = available({ vision });
  if(!list.length){
    throw httpError(500, vision
      ? "No hay ningún proveedor de IA con visión configurado (ver .env.example: GROQ_API_KEY o GEMINI_API_KEY)."
      : "No hay ningún proveedor de IA configurado (ver .env.example).");
  }
  const res = await hedged(list, async (p, signal) => {
    const { text, usage } = await ADAPTERS[p.kind](p, { system, user, image, maxTokens }, signal);
    let json;
    try{ json = parseJsonLoose(text); }
    catch(e){ throw httpError(502, "JSON inválido"); }
    if(validate){
      try{ validate(json); }catch(e){ throw httpError(502, "respuesta incompleta: " + e.message); }
    }
    json._usage = usage;
    return json;
  }, { totalMs });
  const meta = { provider: res.provider, model: res.model, ms: res.ms, tried: res.tried };
  console.log("[ia]", JSON.stringify(meta));
  return { json: res.value, meta };
}

/* Prueba mínima de un proveedor (para /api/diagnostico-ia). */
const TINY_PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
async function ping(p, withImage){
  const t0 = Date.now();
  try{
    const { text } = await ADAPTERS[p.kind](
      { ...p, model: withImage ? p.visionModel : p.textModel },
      { system: 'Responde solo con JSON: {"ok":true}', user: "ping", maxTokens: 30,
        image: withImage ? { mime: "image/png", base64: TINY_PNG } : null },
      null);
    return { proveedor: p.name, modelo: withImage ? p.visionModel : p.textModel, imagen: withImage, ok: true, ms: Date.now() - t0, muestra: String(text).slice(0, 40) };
  }catch(e){
    return { proveedor: p.name, modelo: withImage ? p.visionModel : p.textModel, imagen: withImage, ok: false, ms: Date.now() - t0, status: e.status, error: String(e.message).slice(0, 160) };
  }
}

module.exports = { httpError, send, jsonBody, run, available, ping, parseJsonLoose, ORDER, PROVIDERS };
