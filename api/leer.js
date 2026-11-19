/* POST /api/leer
   Paso 1 del Escáner: recibe la foto y devuelve SOLO el texto del problema
   (salida muy corta -> rápido). Es el único paso que usa visión.
   Body: { image: dataURL|base64, mime }
   Respuesta: { ok:true, texto } | { ok:false, motivo } | { ok:false, error, detalle } */

const { send, httpError, jsonBody, run } = require("../lib/ai");

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // tras decodificar (Groq acepta hasta ~4 MB en base64)
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const SYSTEM = `Eres un OCR experto en matemáticas. Te muestran la foto de UN problema de cálculo
(derivadas), impreso o escrito a mano. Transcribe el problema tal cual está: la función o expresión
y lo que piden (f'(x), dy/dx, derivada implícita, segunda derivada, evaluar en un punto, etc.).
Escribe las fórmulas en texto plano legible (x^2, sqrt(x), sen(x), e^(2x), ln(x), (x+1)/(x-1)).
No resuelvas nada ni agregues explicaciones.

Responde ÚNICAMENTE con JSON válido:
Si hay un problema legible: { "ok": true, "texto": "Deriva: f(x) = ..." }
Si no (borroso, otro tema, vacío): { "ok": false, "motivo": "una frase corta y amable" }`;

module.exports = async (req, res) => {
  if(req.method !== "POST") return send(res, 405, { ok: false, error: "Método no permitido" });
  try{
    const { image, mime } = jsonBody(req);
    if(!image || typeof image !== "string") throw httpError(400, "Falta la imagen.");
    if(!mime || !ALLOWED_MIME.has(mime)) throw httpError(400, "Formato de imagen no soportado.");
    const base64 = image.includes(",") ? image.split(",").pop() : image;
    if(base64.length * 0.75 > MAX_IMAGE_BYTES) throw httpError(413, "La foto pesa demasiado. Acércate un poco más o usa mejor luz.");

    const { json, meta } = await run({
      vision: true, system: SYSTEM, user: "Transcribe el problema de la foto.",
      image: { mime, base64 }, maxTokens: 400, totalMs: 28000,
      validate: j => { if(j.ok !== false && !String(j.texto || "").trim()) throw new Error("sin texto"); }
    });

    if(json.ok === false){
      return send(res, 200, { ok: false, motivo: String(json.motivo || "No se reconoció un problema de derivadas en la foto.") });
    }
    send(res, 200, { ok: true, texto: String(json.texto).trim().slice(0, 500), debug: meta });
  }catch(e){
    send(res, e.status || 500, { ok: false, error: e.message, detalle: (e.extra && e.extra.detalle) || "" });
  }
};
