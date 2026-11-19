/* POST /api/variantes
   Paso 2 del Escáner: recibe el TEXTO del problema (el que leyó /api/leer,
   corregido o no por el alumno, o escrito a mano) y devuelve N variantes:
   mismo tema y técnica, dificultad parecida, otros números, cada una con
   solución paso a paso. NO usa imagen -> es mucho más rápido y lo puede
   resolver cualquier proveedor de IA (ver lib/ai.js).
   Body: { texto, count }

   NOTA: sigue siendo de acceso LIBRE a propósito. Para volverla Pro más
   adelante, validar aquí el comprobante de pago antes de llamar a la IA
   (ver lib/mp.js -> assertTestSeller / verify-payment). */

const { send, httpError, jsonBody, run } = require("../lib/ai");
const { guard } = require("../lib/pro");

const SYSTEM = `Eres un profesor de cálculo diferencial claro y paciente, de bachillerato mexicano.
Recibes el texto de UN problema de derivadas. Haz esto:

1. Identifica el tema ("regla de la potencia", "producto y cociente", "regla de la cadena",
   "trigonométricas", "exponenciales y logarítmicas", "implícitas", "orden superior") y la
   dificultad (1 = básico, 2 = intermedio, 3 = avanzado).
2. Genera exactamente N variantes NUEVAS y DISTINTAS entre sí: mismo tema, misma técnica y
   dificultad parecida, con números y/o funciones distintos (no copies el original). Deben
   resolverse con los mismos pasos.
3. Para cada variante da la solución paso a paso en español sencillo: entre 3 y 5 pasos, cada
   uno de una sola línea (máx. ~18 palabras), y el resultado final ya simplificado.
   REVISA que cada derivada esté correcta antes de responder.

Si el problema original tiene fracciones o raíces, las variantes también deben tenerlas, y los
pasos y el resultado deben mostrarlas igual (como fracciones, no divididas con una sola diagonal).

LENGUAJE DE LOS PASOS: explica como a un niño de 5 años. Palabras de todos los días, frases cortas, una idea por paso,
sin jerga sin explicar ("la parte de arriba", "la parte de abajo", "lo de adentro de la raíz"). Empieza cada paso con un
verbo simple: "Miramos", "Derivamos", "Ponemos", "Quitamos", "Juntamos". Máximo ~18 palabras por paso.

VARIANTES LIMPIAS Y LEGIBLES EN CELULAR (reglas duras):
- Mismo tema y técnica, pero NUNCA más enredadas que el original: nada de fracciones dentro de fracciones
  ni de fracciones dentro de raíces (ej. NO sqrt(12x−(3x−1)/x) como denominador). Máximo UNA fracción por nivel
  y la raíz solo sobre expresiones polinomiales (sqrt(3x^2−5), sqrt(5x−1)).
- Cada paso cabe en una línea corta y lleva UNA sola idea; usa nombres u, v, u', v' en vez de volver a escribir todo
  (ej. "u = sqrt(3x^2−5) ; u' = (3x)/(sqrt(3x^2−5))"). No pegues expresiones de más de ~90 caracteres en un paso.
- El resultado final va simplificado y SIN fracciones complejas: UNA sola fracción (numerador)/(denominador),
  con la raíz o el exponente fraccionario en el denominador, ej. (15x^2−6x+25)/(2(5x−1)^(3/2)sqrt(3x^2−5)).

NOTACIÓN OBLIGATORIA (la pantalla dibuja las fórmulas bonitas a partir de este texto):
- Fracciones: SIEMPRE (numerador)/(denominador), con paréntesis en ambos lados aunque sean simples:
  (2x)/(3), (x+1)/(x-1), (sqrt(6y-5))/(4-3y). Nunca escribas "a/b/c" ni "x+1/x-1".
- Raíces: SIEMPRE sqrt(...) con paréntesis: sqrt(6y-5). Raíz cúbica: (...)^(1/3).
- Exponentes con ^: x^2, (3x+1)^4, e^(2x). Multiplicación sin asterisco: 3x, 2(x+1).
- Derivar respecto a una variable: d/dy[ expresión ] o d/dx[ expresión ]; Leibniz: dy/dx.
- Funciones: sen(x), cos(x), tan(x), ln(x). Sin LaTeX, sin $, sin \\frac.
Responde ÚNICAMENTE con JSON válido, con esta forma exacta:
{
  "tema": "nombre corto",
  "nivel": 1,
  "variantes": [
    { "enunciado": "Deriva: f(x) = ...", "pasos": ["paso 1...", "paso 2..."], "resultado": "f'(x) = ..." }
  ]
}`;

function validate(j){
  if(!Array.isArray(j.variantes) || !j.variantes.length) throw new Error("sin variantes");
  j.variantes.forEach(v => {
    if(!v || !String(v.enunciado || "").trim() || !Array.isArray(v.pasos) || !v.pasos.length) throw new Error("variante incompleta");
  });
}

module.exports = async (req, res) => {
  if(req.method !== "POST") return send(res, 405, { ok: false, error: "Método no permitido" });
  try{
    guard(req);
    const data = jsonBody(req);
    const count = Math.min(6, Math.max(2, parseInt(data.count, 10) || 4));
    const texto = String(data.texto || "").trim().slice(0, 500);
    if(texto.length < 3) throw httpError(400, "Escribe o toma una foto del problema primero.");

    const { json, meta } = await run({
      vision: false, system: SYSTEM,
      user: `Problema: ${texto}\n\nGenera exactamente ${count} variantes.`,
      maxTokens: 3000, totalMs: 28000, validate
    });

    send(res, 200, {
      ok: true,
      debug: process.env.AI_DEBUG === "1" ? meta : { ms: meta.ms },
      transcripcion: texto,
      tema: String(json.tema || ""),
      nivel: Number(json.nivel) || 1,
      variantes: json.variantes.slice(0, count).map(v => ({
        enunciado: String(v.enunciado),
        pasos: v.pasos.map(String),
        resultado: String(v.resultado || "")
      }))
    });
  }catch(e){
    send(res, e.status || 500, { ok: false, error: e.message, detalle: (e.extra && e.extra.detalle) || "", pro: !!(e.extra && e.extra.pro) });
  }
};
