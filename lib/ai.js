/* =========================================================
   Utilidades compartidas para hablar con la API de Google
   Gemini. Solo se usa en el servidor (carpeta api/). La API
   key NUNCA debe llegar al navegador.

   Por qué Gemini y no otra IA: tiene un nivel gratis real
   (sin tarjeta) con límites por minuto/día. Si se llega al
   límite, Google responde con error 429 y vuelve a funcionar
   solo, gratis, en la siguiente ventana (no hay que pagar ni
   hacer nada). Ver README, sección "Escáner de problemas".

   VERSIÓN OPTIMIZADA (velocidad):
   - Apaga/minimiza el "thinking" del modelo (antes consumía
     miles de tokens ocultos y era la causa más probable de
     las respuestas de varios minutos). Variable GEMINI_THINKING.
   - Timeout real (GEMINI_TIMEOUT_MS, 55 s por defecto): si la
     IA se cuelga, el alumno recibe un error claro en vez de
     esperar 3-5 minutos.
   - Un reintento automático si Google responde 500/503.
   - Si el modelo no acepta la config de thinking, reintenta
     sin ella (así nunca se rompe por ese parámetro).
   - Mide tiempos y tokens (se ven en los logs de Vercel y en
     la consola del navegador) para saber dónde se va el tiempo.
   ========================================================= */

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Tiempo máximo TOTAL (incluye reintentos) esperando a Gemini.
const TIMEOUT_MS = parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 55000;
// "off" (por defecto) = thinking mínimo/apagado. "default" = lo que decida Google.
const THINKING = (process.env.GEMINI_THINKING || "off").toLowerCase();

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

/* Config para minimizar el razonamiento interno del modelo.
   - Gemini 2.5:  thinkingBudget = 0 (apagado)
   - Gemini 3.x+: thinkingLevel = "minimal"
   Si el modelo no lo soporta, askWithImage reintenta sin esto. */
function thinkingConfig(){
  if(THINKING === "default") return null;
  if(/gemini-2\.5/.test(MODEL)) return { thinkingBudget: 0 };
  if(/gemini-([3-9]|\d{2})/.test(MODEL)) return { thinkingLevel: "minimal" };
  return null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Un intento contra Gemini con límite de tiempo. */
async function callGemini(payload, timeoutMs){
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try{
    const r = await fetch(`${API}?key=${encodeURIComponent(apiKey())}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

/* Llama a generateContent con una imagen + texto y pide SOLO JSON de vuelta.
   system: instrucciones. imageBase64/imageMime: la foto. userText: lo que
   se le pide puntualmente. maxTokens: límite de la respuesta.
   Devuelve el objeto parseado; además trae `_meta` con tiempos y tokens. */
async function askWithImage({ system, imageBase64, imageMime, userText, maxTokens = 6000 }){
  const t0 = Date.now();
  const deadline = t0 + TIMEOUT_MS;

  const generationConfig = {
    maxOutputTokens: maxTokens,
    responseMimeType: "application/json"
  };
  let think = thinkingConfig();
  if(think) generationConfig.thinkingConfig = think;

  const payload = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{
      role: "user",
      parts: [
        { inline_data: { mime_type: imageMime, data: imageBase64 } },
        { text: userText }
      ]
    }],
    generationConfig
  };

  let attempts = 0;
  let thinkingDropped = false;
  let r, out;

  while(true){
    attempts++;
    const left = deadline - Date.now();
    if(left < 2000) throw httpError(504, "La IA tardó demasiado en responder. Intenta de nuevo.");
    ({ r, out } = await callGemini(payload, left));
    if(r.ok) break;

    const apiMsg = (out.error && out.error.message) || "";

    // El modelo no acepta la config de thinking -> reintentar sin ella.
    if(r.status === 400 && payload.generationConfig.thinkingConfig && /think/i.test(apiMsg)){
      delete payload.generationConfig.thinkingConfig;
      thinkingDropped = true;
      continue;
    }
    // Error temporal de Google -> un solo reintento rápido.
    if((r.status === 500 || r.status === 503) && attempts < 3 && deadline - Date.now() > 8000){
      await sleep(1200);
      continue;
    }

    const status = r.status;
    const msg = apiMsg ||
      (status === 429 ? "Se alcanzó el límite gratis por ahora. Espera un minuto y vuelve a intentar." : "Error al hablar con la IA.");
    throw httpError(status, msg);
  }

  const u = out.usageMetadata || {};
  const meta = {
    model: MODEL,
    ms: Date.now() - t0,
    attempts,
    thinking: payload.generationConfig.thinkingConfig || (thinkingDropped ? "no soportado" : "default"),
    promptTokens: u.promptTokenCount || 0,
    outputTokens: u.candidatesTokenCount || 0,
    thoughtsTokens: u.thoughtsTokenCount || 0
  };
  // Aparece en Vercel -> Logs. Si "thoughtsTokens" es enorme, ahí estaba el problema.
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

module.exports = { MODEL, httpError, send, apiKey, jsonBody, askWithImage };
