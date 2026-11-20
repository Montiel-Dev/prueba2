/* POST /api/leer
   Paso 1 del Escáner: recibe la foto y devuelve SOLO el texto del problema
   (salida muy corta -> rápido). Es el único paso que usa visión.
   Body: { image: dataURL|base64, mime }
   Respuesta: { ok:true, texto } | { ok:false, motivo } | { ok:false, error, detalle } */

const { send, httpError, jsonBody, run } = require("../lib/ai");
const { guard } = require("../lib/pro");

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // tras decodificar (Groq acepta hasta ~4 MB en base64)
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const SYSTEM = `Eres un OCR experto en matemáticas. Te muestran la foto de UN problema de cálculo
(derivadas), impreso o escrito a mano. Transcribe el problema tal cual está: la función o expresión
y lo que piden (f'(x), dy/dx, derivada implícita, segunda derivada, evaluar en un punto, etc.).
Transcribe EXACTAMENTE lo que ves: no lo simplifiques, no lo corrijas, no inventes términos.
Si ves una fracción (una expresión arriba y otra abajo de una raya), es una fracción: escríbela como
(numerador)/(denominador). Si ves un "d/dy" o "d/dx" junto al problema, es el operador "derivar
respecto a y/x": escríbelo como d/dy[ ... ] envolviendo lo que se deriva.
Ejemplo: raíz de (6y-5) sobre (4-3y), con d/dy al lado -> "Deriva: d/dy[(sqrt(6y-5))/(4-3y)]".
No resuelvas nada ni agregues explicaciones.

NOTACIÓN OBLIGATORIA (la pantalla dibuja las fórmulas bonitas a partir de este texto):
- Fracciones: SIEMPRE (numerador)/(denominador), con paréntesis en ambos lados aunque sean simples:
  (2x)/(3), (x+1)/(x-1), (sqrt(6y-5))/(4-3y). Nunca escribas "a/b/c" ni "x+1/x-1".
- Raíces: SIEMPRE sqrt(...) con paréntesis: sqrt(6y-5). Raíz cúbica: (...)^(1/3).
- Exponentes con ^: x^2, (3x+1)^4, e^(2x). Multiplicación sin asterisco: 3x, 2(x+1).
- Derivar respecto a una variable: d/dy[ expresión ] o d/dx[ expresión ]; Leibniz: dy/dx.
- Funciones: sen(x), cos(x), tan(x), ln(x). Sin LaTeX, sin $, sin \\frac.

Responde ÚNICAMENTE con JSON válido:
Si hay un problema legible: { "ok": true, "texto": "Deriva: f(x) = ..." }
Si no (borroso, otro tema, vacío): { "ok": false, "motivo": "una frase corta y amable" }`;

module.exports = async (req, res) => {
  if(req.method !== "POST") return send(res, 405, { ok: false, error: "Método no permitido" });
  try{
    guard(req);
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
    send(res, 200, { ok: true, texto: String(json.texto).trim().slice(0, 500), debug: process.env.AI_DEBUG === "1" ? meta : { ms: meta.ms } });
  }catch(e){
    send(res, e.status || 500, { ok: false, error: e.message, detalle: (e.extra && e.extra.detalle) || "", pro: !!(e.extra && e.extra.pro) });
  }
};
