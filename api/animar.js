/* POST /api/animar
   Crea la ANIMACIÓN paso a paso de UNA variante (la que ya resolvió /api/variantes).
   Se pide solo cuando el alumno toca "Ver animación" -> la generación de variantes sigue rápida.
   Body: { enunciado, pasos?:[], resultado? }
   Respuesta: { ok:true, frames:[{ t, e, n }] } | { ok:false, error }
   Formato de cada cuadro = el de js/anim.js (ver su encabezado): t = título, e = expresión en
   piezas separadas por espacios (con id:, * y !), n = nota. */

const { send, httpError, jsonBody, run } = require("../lib/ai");
const { guard } = require("../lib/pro");

const SYSTEM = `Eres un profesor de cálculo que diseña ANIMACIONES paso a paso de una derivada.
Recibes un problema, su solución de referencia y su resultado. Devuelves de 4 a 7 "cuadros":
cada cuadro es UNA línea matemática que se transforma en la siguiente (los términos se deslizan,
se resaltan, se tachan), como en un pizarrón.

Cada cuadro: { "t": "título corto (ej. 1. Una prima por término)", "e": "expresión", "n": "nota breve, máx. 20 palabras" }

FORMATO DE "e" (MUY IMPORTANTE):
- Son PIEZAS separadas por UN espacio. Dentro de una pieza NUNCA hay espacios
  (escribe 3x^2cos(x), no "3x^2 cos(x)"). Los signos "=", "+", "−" van como piezas sueltas.
- Cada término lleva un id de 1 a 3 letras minúsculas y dos puntos: a:, b:, c:... y conserva el MISMO
  id en todos los cuadros, para que se deslice a su nuevo lugar aunque cambie su texto.
- El lado izquierdo ("f(x)", "f'(x)", "dy/dx") es la pieza fn: -> fn:f'(x)  (id fijo "fn").
- Prefijo * (antes del id) = resaltar lo que CAMBIÓ en este cuadro: *a:12x^2
- Prefijo ! = tachar lo que se cancela o no aporta (ceros, unos): !c:0
- Fracciones SIEMPRE como (numerador)/(denominador) sin espacios; raíces sqrt(...); exponentes con ^.
  Derivar respecto a una variable: d/dy[ ... ] pegado, sin espacios, en una sola pieza.
- Primer cuadro: el problema tal cual (t = "Problema"). Último cuadro: el resultado final simplificado.
- Cada cuadro cambia poco respecto al anterior (un solo paso lógico). Matemática 100% correcta.

Ejemplo (suma de términos):
{"frames":[
 {"t":"Problema","e":"fn:f(x) = a:4x^3 − b:2x^2 + c:5x − d:9","n":"Veamos cómo se transforma, un paso a la vez."},
 {"t":"1. Una prima por término","e":"fn:f'(x) = *a:(4x^3)' − *b:(2x^2)' + *c:(5x)' − *d:(9)'","n":"Cada término se deriva por separado; los signos se quedan."},
 {"t":"2. Baja el exponente","e":"fn:f'(x) = *a:4·3x^2 − *b:2·2x^1 + *c:5·1x^0 − *d:0","n":"El exponente baja a multiplicar y se reduce en 1; el 9 es constante y da 0."},
 {"t":"3. Multiplica","e":"fn:f'(x) = *a:12x^2 − *b:4x + *c:5 − d:0","n":"4·3 = 12, 2·2 = 4, x^1 = x y x^0 = 1."},
 {"t":"4. Tacha lo que no aporta","e":"fn:f'(x) = a:12x^2 − b:4x + c:5 !− !d:0","n":"Restar 0 no cambia nada."},
 {"t":"5. Resultado","e":"fn:f'(x) = a:12x^2 − b:4x + c:5","n":"Esa es la derivada."}]}

Ejemplo (cociente):
{"frames":[
 {"t":"Problema","e":"fn:f(x) = a:(x+3)/(x−2)","n":"Un cociente: se usa la regla del cociente."},
 {"t":"1. Fórmula del cociente","e":"fn:f'(x) = *a:(u'v−uv')/(v^2) con u' = 1 ; v' = 1","n":"Numerador u'v − uv' sobre v al cuadrado."},
 {"t":"2. Sustituye","e":"fn:f'(x) = *a:(1(x−2)−(x+3)(1))/((x−2)^2)","n":"u = x+3 y v = x−2."},
 {"t":"3. Simplifica","e":"fn:f'(x) = *a:(−5)/((x−2)^2)","n":"Las x se cancelan: −2 − 3 = −5."}]}

Responde ÚNICAMENTE con JSON válido: { "frames": [ ... ] }`;

const clip = (s, n) => String(s == null ? "" : s).trim().slice(0, n);

function validate(j){
  if(!j || !Array.isArray(j.frames)) throw new Error("sin frames");
  const ok = j.frames.filter(f => f && typeof f.e === "string" && f.e.trim() && typeof f.t === "string");
  if(ok.length < 3) throw new Error("pocos cuadros");
  j.frames = ok.slice(0, 8).map(f => ({ t: clip(f.t, 80), e: clip(f.e, 300), n: clip(f.n, 200) }));
}

module.exports = async (req, res) => {
  if(req.method !== "POST") return send(res, 405, { ok: false, error: "Método no permitido" });
  try{
    guard(req);
    const data = jsonBody(req);
    const enunciado = clip(data.enunciado, 400);
    if(enunciado.length < 3) throw httpError(400, "Falta el enunciado.");
    const pasos = (Array.isArray(data.pasos) ? data.pasos : []).slice(0, 8).map(p => clip(p, 240));
    const resultado = clip(data.resultado, 300);

    const { json, meta } = await run({
      vision: false, system: SYSTEM,
      user: `Problema: ${enunciado}\nSolución de referencia: ${pasos.join(" | ") || "(ninguna)"}\nResultado: ${resultado || "(calcúlalo)"}\n\nCrea la animación.`,
      maxTokens: 2500, totalMs: 28000, validate
    });
    send(res, 200, { ok: true, frames: json.frames, debug: process.env.AI_DEBUG === "1" ? meta : { ms: meta.ms } });
  }catch(e){
    send(res, e.status || 500, { ok: false, error: e.message, detalle: (e.extra && e.extra.detalle) || "" });
  }
};
