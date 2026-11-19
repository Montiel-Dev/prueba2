/* =========================================================
   Utilidades compartidas para hablar con la API de Google
   Gemini. Solo se usa en el servidor (carpeta api/). La API
   key NUNCA debe llegar al navegador.

   Por qué Gemini y no otra IA: tiene un nivel gratis real
   (sin tarjeta) con límites por minuto/día. Si se llega al
   límite, Google responde con error 429 y vuelve a funcionar
   solo, gratis, en la siguiente ventana (no hay que pagar ni
   hacer nada). Ver README, sección "Escáner de problemas".
   ========================================================= */

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

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

/* Llama a generateContent con una imagen + texto y pide SOLO JSON de vuelta.
   system: instrucciones. imageBase64/imageMime: la foto. userText: lo que
   se le pide puntualmente. maxTokens: límite de la respuesta. */
async function askWithImage({ system, imageBase64, imageMime, userText, maxTokens = 4000 }){
  const payload = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{
      role: "user",
      parts: [
        { inline_data: { mime_type: imageMime, data: imageBase64 } },
        { text: userText }
      ]
    }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      responseMimeType: "application/json"
    }
  };

  const r = await fetch(`${API}?key=${encodeURIComponent(apiKey())}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const out = await r.json().catch(() => ({}));
  if(!r.ok){
    const status = r.status === 429 ? 429 : r.status;
    const msg = (out.error && out.error.message) ||
      (status === 429 ? "Se alcanzó el límite gratis por ahora. Espera un minuto y vuelve a intentar." : "Error al hablar con la IA.");
    throw httpError(status, msg);
  }

  const cand = (out.candidates || [])[0];
  const finish = cand && cand.finishReason;
  if(finish === "SAFETY" || finish === "RECITATION"){
    throw httpError(502, "La IA no pudo procesar esta foto. Intenta con otra.");
  }

  const text = ((cand && cand.content && cand.content.parts) || [])
    .map(p => p.text || "").join("\n").trim();
  const clean = text.replace(/^```json\s*|\s*```$/g, "").trim();

  if(!clean) throw httpError(502, "La IA no devolvió nada. Intenta de nuevo.");

  let parsed;
  try{ parsed = JSON.parse(clean); }
  catch(e){ throw httpError(502, "No se pudo interpretar la respuesta de la IA. Intenta de nuevo."); }
  return parsed;
}

module.exports = { MODEL, httpError, send, apiKey, jsonBody, askWithImage };
