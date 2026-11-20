/* POST /api/variantes
   Recibe la foto de un problema de derivadas y devuelve N "variantes":
   el mismo tipo de problema (misma técnica, dificultad parecida) pero
   con números/funciones distintos, cada una con solución paso a paso.
   Usa la API de Anthropic (Claude) — necesita la variable de entorno
   ANTHROPIC_API_KEY (ver README y .env.example).

   NOTA: esta ruta todavía es de acceso LIBRE a propósito (no se pidió
   hacerla Pro todavía). Para volverla parte de Dojo Pro más adelante,
   el lugar natural es aquí: antes de llamar a la IA, exigir algo que
   pruebe que Pay.isPro() es cierto en el cliente (hoy ese estado solo
   vive en localStorage del navegador, así que primero habría que
   mandar el comprobante de pago y validarlo igual que en
   lib/mp.js -> assertTestSeller / verify-payment). */

const { send, httpError, jsonBody, askWithImage } = require("../lib/ai");

const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // tras decodificar el base64
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const SYSTEM = `Eres un profesor de cálculo diferencial muy claro y paciente, de bachillerato
mexicano. Te muestran la foto de UN problema de derivadas (impreso o escrito a mano, resuelto
o sin resolver). Haz esto, en orden:

1. Lee la foto y transcribe el problema tal cual está (la función o expresión a derivar, y qué
   piden exactamente: f'(x), dy/dx, derivada implícita, segunda derivada, evaluar en un punto, etc.).
   Si la foto no trae un problema de derivadas legible, responde el JSON de error de abajo.
2. Identifica el tema (por ejemplo: "regla de la potencia", "producto y cociente", "regla de la
   cadena", "trigonométricas", "exponenciales y logarítmicas", "implícitas", "orden superior") y
   el nivel de dificultad (1 = básico, 2 = intermedio, 3 = avanzado), según el problema original.
3. Genera exactamente N variantes NUEVAS y DISTINTAS entre sí: mismo tema, misma técnica y
   misma dificultad aproximada que el original, pero con números y/o funciones distintos (nunca
   copies el problema original ni repitas una variante). Deben resolverse con los mismos pasos.
4. Para cada variante da la solución completa, paso a paso, en español sencillo (cada elemento
   de "pasos" es UN paso, breve y claro, como se lo explicarías a un estudiante), y el resultado
   final ya simplificado.

Responde ÚNICAMENTE con JSON válido (nada de texto antes, después, ni \`\`\`), con esta forma exacta.

Si SÍ reconoces un problema de derivadas en la foto:
{
  "ok": true,
  "transcripcion": "f(x) = ... (o como esté planteado)",
  "tema": "nombre corto del tema",
  "nivel": 1,
  "variantes": [
    { "enunciado": "Deriva: f(x) = ...", "pasos": ["paso 1...", "paso 2..."], "resultado": "f'(x) = ..." }
  ]
}

Si NO reconoces un problema de derivadas (foto borrosa, de otro tema, vacía, etc.):
{ "ok": false, "motivo": "una frase corta y amable explicando qué pasó" }`;

module.exports = async (req, res) => {
  if(req.method !== "POST") return send(res, 405, { ok:false, error: "Método no permitido" });
  try{
    const data = jsonBody(req);
    const { image, mime } = data;
    const count = Math.min(6, Math.max(2, parseInt(data.count, 10) || 4));

    if(!image || typeof image !== "string") throw httpError(400, "Falta la imagen.");
    if(!mime || !ALLOWED_MIME.has(mime)) throw httpError(400, "Formato de imagen no soportado.");

    const base64 = image.includes(",") ? image.split(",").pop() : image;
    const approxBytes = base64.length * 0.75;
    if(approxBytes > MAX_IMAGE_BYTES){
      throw httpError(413, "La foto pesa demasiado. Intenta de nuevo (acércate un poco más o con mejor luz).");
    }

    const parsed = await askWithImage({
      system: SYSTEM,
      imageBase64: base64,
      imageMime: mime,
      userText: `Genera exactamente ${count} variantes.`
    });

    if(parsed.ok === false){
      return send(res, 200, { ok:false, motivo: parsed.motivo || "No se reconoció un problema de derivadas en la foto." });
    }
    if(!parsed.ok || !Array.isArray(parsed.variantes) || !parsed.variantes.length){
      throw httpError(502, "La IA no devolvió variantes válidas. Intenta de nuevo.");
    }

    send(res, 200, {
      ok: true,
      transcripcion: String(parsed.transcripcion || ""),
      tema: String(parsed.tema || ""),
      nivel: Number(parsed.nivel) || 1,
      variantes: parsed.variantes.slice(0, count).map(v => ({
        enunciado: String(v.enunciado || ""),
        pasos: Array.isArray(v.pasos) ? v.pasos.map(String) : [],
        resultado: String(v.resultado || "")
      }))
    });
  }catch(e){
    send(res, e.status || 500, { ok:false, error: e.message });
  }
};
