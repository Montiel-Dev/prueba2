/* =========================================================
   Utilidades compartidas para hablar con la API de Google
   Gemini. Solo se usa en el servidor (carpeta api/). La API
   key NUNCA debe llegar al navegador.

   Por qué Gemini y no otra IA: tiene un nivel gratis real
   (sin tarjeta) con límites por minuto/día. Si se llega al
   límite, Google responde con error 429 y vuelve a funcionar
   solo, gratis, en la siguiente ventana (no hay que pagar ni
   hacer nada). Ver README, sección "Escáner de problemas".

   VERSIÓN OPTIMIZADA v2 (velocidad y resistencia a lentitud):
   - MODELO DE RESPALDO: si el modelo principal tarda más de
     GEMINI_FIRST_TIMEOUT_MS (30 s), responde 429 o falla con
     5xx, se prueba automáticamente GEMINI_FALLBACK_MODEL
     (por defecto gemini-2.5-flash). Las cuotas gratis son POR
     MODELO, así que el respaldo suele funcionar aunque el
     principal esté saturado o lento.
   - Thinking apagado/mínimo (GEMINI_THINKING=off).
   - Timeout total (GEMINI_TIMEOUT_MS, 55 s) con error claro.
   - Si el modelo no acepta la config de thinking, reintenta
     sin ella.
   - Mide tiempos y tokens (Vercel -> Logs y consola del
     navegador). También se registran los FALLOS.
   ========================================================= */

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL === undefined
  ? "gemini-2.5-flash"
  : process.env.GEMINI_FALLBACK_MODEL; // "" = sin respaldo

const TIMEOUT_MS = parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 55000;
const FIRST_TIMEOUT_MS = parseInt(process.env.GEMINI_FIRST_TIMEOUT_MS, 10) || 30000;
const THINKING = (process.env.GEMINI_THINKING || "off").toLowerCase();

const apiUrl = model => `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

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

function apiKey(){
  const k = process.env.GEMINI_API_KEY;
  if(!k) throw httpError(500, "Falta la variable de entorno GEMINI_API_KEY (ver README).");
  return k;
}

// Siempre devuelve un objeto ya parseado (Vercel suele parsear JSON solo,
// pero si llega como string lo intentamos parsear nosotros).
function jsonBody(req){
  let data = req.body;
  if(typeof data === "string"){
    try{ data = JSON.parse(data || "{}"); }
    catch(e){ throw httpError(400, "JSON inválido."); }
  }
  return data || {};
}

/* Config para minimizar el razonamiento interno según la familia del modelo.
   - Gemini 2.5:  thinkingBudget = 0 (apagado)
   - Gemini 3.x+: thinkingLevel = "minimal"
   Si el modelo no lo soporta, callModel reintenta sin esto. */
function thinkingConfigFor(model){
  if(THINKING === "default") return null;
  if(/gemini-2\.5/.test(model)) return { thinkingBudget: 0 };
  if(/gemini-([3-9]|\d{2})/.test(model)) return { thinkingLevel: "minimal" };
  return null;
}

/* Un intento contra UN modelo, con límite de tiempo (AbortController). */
async function rawCall(model, payload, timeoutMs){
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try{
    const r = await fetch(apiUrl(model), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey() },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });
    const out = await r.json().catch(() => ({}));
    return { r, out };
  }catch(e){
    if(e && e.name === "AbortError"){
      throw httpError(504, "La IA tardó demasiado en responder. Intenta de nuevo (con otra foto, más cerca y con buena luz, o con menos variantes).");
    }
    if(e && e.status) throw e;
    throw httpError(502, "No se pudo conectar con la IA. Intenta de nuevo.");
  }finally{
    clearTimeout(timer);
  }
}

/* Llama a UN modelo; si rechaza la config de thinking, reintenta sin ella.
   Devuelve { out, thinking, droppedThinking } o lanza httpError. */
async function callModel(model, buildPayload, timeoutMs){
  const t0 = Date.now();
  let think = thinkingConfigFor(model);
  let dropped = false;
  while(true){
    const left = timeoutMs - (Date.now() - t0);
    if(left < 1500) throw httpError(504, "La IA tardó demasiado en responder. Intenta de nuevo.");
    const { r, out } = await rawCall(model, buildPayload(think), left);
    if(r.ok) return { out, thinking: think || (dropped ? "no soportado" : "default") };

    const apiMsg = (out.error && out.error.message) || "";
    if(r.status === 400 && think && /think/i.test(apiMsg)){
      think = null; dropped = true; continue;
    }
    throw httpError(r.status,
      apiMsg || (r.status === 429
        ? "Se alcanzó el límite gratis por ahora. Espera un minuto y vuelve a intentar."
        : "Error al hablar con la IA."));
  }
}

// ¿Vale la pena probar el modelo de respaldo con este error?
const canFallback = e => [429, 500, 502, 503, 504].includes(e && e.status);

function buildImagePayload({ system, imageBase64, imageMime, userText, maxTokens }){
  return think => {
    const generationConfig = { maxOutputTokens: maxTokens, responseMimeType: "application/json" };
    if(think) generationConfig.thinkingConfig = think;
    return {
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [
        { inline_data: { mime_type: imageMime, data: imageBase64 } },
        { text: userText }
      ]}],
      generationConfig
    };
  };
}

/* Llama a Gemini con una imagen + texto y pide SOLO JSON de vuelta.
   Devuelve el objeto parseado; además trae `_meta` con tiempos y tokens. */
async function askWithImage({ system, imageBase64, imageMime, userText, maxTokens = 6000 }){
  const t0 = Date.now();
  const deadline = t0 + TIMEOUT_MS;
  const build = buildImagePayload({ system, imageBase64, imageMime, userText, maxTokens });

  const models = [MODEL];
  if(FALLBACK_MODEL && FALLBACK_MODEL !== MODEL) models.push(FALLBACK_MODEL);

  const tried = [];
  let result = null, usedModel = null;

  for(let i = 0; i < models.length; i++){
    const model = models[i];
    const left = deadline - Date.now();
    const isLast = i === models.length - 1;
    const budget = isLast ? left : Math.min(FIRST_TIMEOUT_MS, left);
    const ts = Date.now();
    try{
      result = await callModel(model, build, budget);
      usedModel = model;
      tried.push({ model, ok: true, ms: Date.now() - ts });
      break;
    }catch(e){
      tried.push({ model, ok: false, status: e.status, ms: Date.now() - ts, error: String(e.message).slice(0, 160) });
      console.log("[gemini] fallo", JSON.stringify(tried[tried.length - 1]));
      if(isLast || !canFallback(e)){
        console.log("[gemini] sin respuesta", JSON.stringify({ totalMs: Date.now() - t0, tried }));
        throw e;
      }
    }
  }

  const out = result.out;
  const u = out.usageMetadata || {};
  const meta = {
    model: usedModel,
    fallbackUsed: usedModel !== MODEL,
    ms: Date.now() - t0,
    thinking: result.thinking,
    promptTokens: u.promptTokenCount || 0,
    outputTokens: u.candidatesTokenCount || 0,
    thoughtsTokens: u.thoughtsTokenCount || 0,
    tried
  };
  console.log("[gemini]", JSON.stringify(meta));

  const cand = (out.candidates || [])[0];
  const finish = cand && cand.finishReason;
  if(finish === "SAFETY" || finish === "RECITATION"){
    throw httpError(502, "La IA no pudo procesar esta foto. Intenta con otra.");
  }
  if(finish === "MAX_TOKENS"){
    throw httpError(502, "La respuesta salió demasiado larga y se cortó. Intenta con menos variantes.");
  }

  const text = ((cand && cand.content && cand.content.parts) || [])
    .filter(p => !p.thought)
    .map(p => p.text || "").join("\n").trim();
  const clean = text.replace(/^```json\s*|\s*```$/g, "").trim();

  if(!clean) throw httpError(502, "La IA no devolvió nada. Intenta de nuevo.");

  let parsed;
  try{ parsed = JSON.parse(clean); }
  catch(e){ throw httpError(502, "No se pudo interpretar la respuesta de la IA. Intenta de nuevo."); }
  if(parsed && typeof parsed === "object") parsed._meta = meta;
  return parsed;
}

/* Prueba mínima de un modelo (para /api/diagnostico-ia). Con o sin imagen. */
const TINY_PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
async function ping(model, withImage, timeoutMs = 25000){
  const t0 = Date.now();
  const build = think => {
    const generationConfig = { maxOutputTokens: 50 };
    if(think) generationConfig.thinkingConfig = think;
    const parts = [];
    if(withImage) parts.push({ inline_data: { mime_type: "image/png", data: TINY_PNG } });
    parts.push({ text: "Responde solo con la palabra: ok" });
    return { contents: [{ role: "user", parts }], generationConfig };
  };
  try{
    const { out, thinking } = await callModel(model, build, timeoutMs);
    const u = out.usageMetadata || {};
    return { model, imagen: withImage, ok: true, ms: Date.now() - t0, thinking, thoughtsTokens: u.thoughtsTokenCount || 0 };
  }catch(e){
    return { model, imagen: withImage, ok: false, ms: Date.now() - t0, status: e.status, error: String(e.message).slice(0, 200) };
  }
}

module.exports = { MODEL, FALLBACK_MODEL, httpError, send, apiKey, jsonBody, askWithImage, ping };
