/* =========================================================
   Utilidades compartidas para hablar con la API de Anthropic
   (Claude). Solo se usa en el servidor (carpeta api/). La API
   key NUNCA debe llegar al navegador.
   ========================================================= */

const API = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

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
  const k = process.env.ANTHROPIC_API_KEY;
  if(!k) throw httpError(500, "Falta la variable de entorno ANTHROPIC_API_KEY (ver README).");
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

/* Llama a /v1/messages con una imagen + texto y pide SOLO JSON de vuelta.
   system: instrucciones. imageBase64/imageMime: la foto. userText: lo que
   se le pide puntualmente. maxTokens: límite de la respuesta. */
async function askWithImage({ system, imageBase64, imageMime, userText, maxTokens = 4000 }){
  const payload = {
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: imageMime, data: imageBase64 } },
        { type: "text", text: userText }
      ]
    }]
  };

  const r = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey(),
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(payload)
  });

  const out = await r.json().catch(()=> ({}));
  if(!r.ok) throw httpError(r.status, (out.error && out.error.message) || "Error al hablar con la IA.");

  const text = (out.content || []).filter(b=> b.type === "text").map(b=> b.text).join("\n").trim();
  const clean = text.replace(/^```json\s*|\s*```$/g, "").trim();

  let parsed;
  try{ parsed = JSON.parse(clean); }
  catch(e){ throw httpError(502, "No se pudo interpretar la respuesta de la IA. Intenta de nuevo."); }
  return parsed;
}

module.exports = { MODEL, httpError, send, apiKey, jsonBody, askWithImage };
