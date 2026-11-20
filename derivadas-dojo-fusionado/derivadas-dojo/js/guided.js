/* =========================================================
   Derivadas Dojo — problemas guiados (paso a paso)
   Se carga DESPUÉS de data.js y math.js. Aquí agregas:
   - formulas: hoja de fórmulas de cada bloque (visible en práctica y examen)
   - lecciones de "ejemplo resuelto"
   - problemas guiados (type:"guided"): varios pasos, cada uno es
     opción múltiple (S) o construcción con fichas (T).
   - El mini-examen ahora es 100% guiado (sin pistas, CON fórmulas).

   Helpers:
   S(etiqueta, enunciado, correcta, [incorrectas], porQué, pista)
   T(etiqueta, enunciado, [fichas en orden], [distractoras], porQué, pista)
   G(id, kicker, func, [pasos], explicaciónFinal)
   Ojo: no uses "/" como ficha; usa fracciones dentro de una ficha.
   ========================================================= */

const S = (label, prompt, right, wrongs, why, hint) => ({
  label, prompt, why, hint, res: right,
  options: [{ text:right, correct:true }, ...wrongs.map(t => ({ text:t, correct:false }))]
});
const T = (label, prompt, tokens, distract, why, hint) => ({
  label, prompt, tokens, distract, why, hint, res: tokens.join(" ")
});
const G = (id, kicker, func, steps, explanation) =>
  ({ id, type:"guided", kicker, func, steps, explanation });
const F = (n, f) => ({ n, f });

const addTo = (i, formulas, lesson, practice, exam) => {
  const b = BLOCKS[i];
  b.formulas = formulas;
  b.lessons.push(lesson);
  b.practice = practice.concat(b.practice);   // guiados primero; los clásicos quedan como refuerzo
  b.exam = exam;                              // examen nuevo: guiado y con fórmulas
};
const L = (title, intro, ex, steps) => ({ title, html:
  `<p>${intro}</p><div class="example">${ex}</div><ol>${steps.map(x=>`<li>${x}</li>`).join("")}</ol>
   <div class="analogy">Así se hace en papel: escribe cada paso, uno debajo del otro. Los problemas guiados de la práctica te piden exactamente eso.</div>` });

// =================== 1. FUNDAMENTOS ===================
addTo(0,
[F("Potencia","d/dx x^n = n·x^(n−1)"), F("Constante","d/dx c = 0"), F("Coeficiente","d/dx (c·f) = c·f'"), F("Suma/resta","d/dx (f ± g) = f' ± g'")],
L("Ejemplo resuelto: cómo se desarrolla un problema",
  "Antes de practicar, mira el método completo con un ejemplo:",
  m("f(x) = 4x^3 − 2x^2 + 5x − 9"),
  ["<b>Separa</b> en términos: " + m("4x^3") + ", " + m("−2x^2") + ", " + m("5x") + ", " + m("−9") + ".",
   "<b>Deriva cada uno</b>: " + m("12x^2") + ", " + m("−4x") + ", " + m("5") + ", " + m("0") + ".",
   "<b>Junta</b>: " + m("f'(x) = 12x^2 − 4x + 5") + "."]),
[
 G("f-g1","Derivar término a término","f(x) = 5x^3 − 4x + 7",[
  S("Término 1:","Deriva 5x^3: multiplica por el exponente y réstale 1 al exponente.","15x^2",["5x^2","15x^3"],"5·3 = 15 y el exponente baja de 3 a 2.","El 3 baja a multiplicar."),
  S("Término 2:","Deriva −4x (recuerda: x = x^1).","−4",["−4x","0"],"x^1 → 1·x^0 = 1, así que −4·1 = −4. La recta −4x sube −4 por cada paso.","x^0 vale 1."),
  S("Término 3:","Deriva la constante 7.","0",["7","1"],"Un número solo nunca cambia, su rapidez de cambio es 0."),
  T("Resultado:","Arma f'(x) juntando los resultados.",["15x^2","−","4"],["+","7","x"],"Unes los tres resultados; el 0 de la constante desaparece.")
 ],"Regla: cada término se deriva por separado y el resultado se junta con los mismos signos."),
 G("f-g2","Reescribir antes de derivar","f(x) = 2√x + 1/x",[
  S("Reescribe:","Pasa a potencias: √x = x^(1/2) y 1/x = x^(−1).","2x^(1/2) + x^(−1)",["2x^2 + x","2x^(−1/2) + x^(−1)"],"La raíz es exponente 1/2 y lo que está abajo pasa con exponente negativo.","Raíz = exponente 1/2."),
  S("Término 1:","Deriva 2x^(1/2).","x^(−1/2)",["2x^(−1/2)","x^(1/2)"],"2·(1/2) = 1 y el exponente 1/2 − 1 = −1/2."),
  S("Término 2:","Deriva x^(−1).","−x^(−2)",["x^(−2)","−x^0"],"Baja el −1 (queda −1) y −1−1 = −2."),
  T("Resultado:","Arma f'(x).",["x^(−1/2)","−","x^(−2)"],["+","2","x^(1/2)"],"Unes ambos términos.")
 ],"Si ves raíces o variables abajo, primero conviértelas en potencias; luego es la regla de siempre."),
 G("f-g3","Pendiente en un punto","f(x) = x^2 − 6x + 5",[
  S("Deriva:","Calcula f'(x).","2x − 6",["x − 6","2x^2 − 6"],"x^2 → 2x y −6x → −6; el 5 desaparece."),
  S("Evalúa:","Sustituye x = 4 en f'(x).","2",["−2","10"],"f'(4) = 2(4) − 6 = 8 − 6 = 2.","Cambia x por 4 en 2x − 6."),
  S("Interpreta:","¿Qué significa f'(4) = 2?","En x = 4 la curva sube 2 por cada 1 que avanza a la derecha",["La función vale 2 en x = 4","La curva termina en x = 2"],"La derivada en un punto es la pendiente de la recta tangente ahí.")
 ],"Derivar da la fórmula de la pendiente; evaluarla da la pendiente en un punto concreto."),
 G("f-g4","Expandir primero","f(x) = (2x+1)^2",[
  S("Expande:","Aún no tenemos regla para derivar un paréntesis elevado: desarrolla (2x+1)^2.","4x^2 + 4x + 1",["4x^2 + 1","2x^2 + 1"],"(a+b)^2 = a^2 + 2ab + b^2 → 4x^2 + 4x + 1.","Recuerda el término del medio."),
  S("Término 1:","Deriva 4x^2.","8x",["4x","8x^2"],"4·2 = 8 y el exponente baja a 1."),
  S("Término 2:","Deriva 4x y 1.","4 y 0",["4x y 1","4 y 1"],"4x → 4 y la constante → 0."),
  T("Resultado:","Arma f'(x).",["8x","+","4"],["−","0","1"],"Sumas 8x + 4 + 0.")
 ],"Más adelante la regla de la cadena hará esto en un solo paso.")
],
[
 G("f-x1","Examen · términos","f(x) = 3x^4 − 2x^3 + x",[
  S("Término 1:","Deriva 3x^4.","12x^3",["12x^4","3x^3"],"3·4 = 12, exponente 3."),
  S("Término 2:","Deriva −2x^3.","−6x^2",["−6x^3","−2x^2"],"−2·3 = −6, exponente 2."),
  S("Término 3:","Deriva x.","1",["x","0"],"x^1 → 1."),
  T("Resultado:","Arma f'(x).",["12x^3","−","6x^2","+","1"],["x","4","0"],"Unes los tres términos.")
 ],"Término a término con la regla de la potencia."),
 G("f-x2","Examen · exponentes negativos","f(x) = 1/x^2 + x",[
  S("Reescribe:","Convierte 1/x^2 en potencia.","x^(−2) + x",["x^2 + x","x^(1/2) + x"],"Lo de abajo sube con exponente negativo."),
  S("Término 1:","Deriva x^(−2).","−2x^(−3)",["2x^(−3)","−2x^(−1)"],"Baja −2 y −2−1 = −3."),
  T("Resultado:","Arma f'(x) (la derivada de x es 1).",["−2x^(−3)","+","1"],["2x^(−3)","−","x"],"Unes −2x^(−3) con 1.")
 ],"Reescribir primero evita casi todos los errores."),
 G("f-x3","Examen · tangente horizontal","f(x) = x^3 − 3x",[
  S("Deriva:","Calcula f'(x).","3x^2 − 3",["3x^2","x^2 − 3"],"x^3 → 3x^2 y −3x → −3."),
  S("Evalúa:","Calcula f'(2).","9",["3","12"],"3(4) − 3 = 9."),
  S("Tangente horizontal:","Una tangente horizontal tiene pendiente 0. Resuelve 3x^2 − 3 = 0.","x = 1 ; x = −1",["x = 0","x = 3"],"3x^2 = 3 → x^2 = 1 → x = ±1.")
 ],"Pendiente 0 = tangente horizontal: iguala f' a cero y despeja.")
]);

// =================== 2. PRODUCTO Y COCIENTE ===================
addTo(1,
[F("Producto","(uv)' = u'v + uv'"), F("Cociente","(u/v)' = (u'v − uv')/v^2"), F("Recuerda","Identifica u, v, u', v' antes de sustituir")],
L("Ejemplo resuelto: producto en 4 pasos","Siempre el mismo orden: identificar, derivar, sustituir, simplificar.",
  m("f(x) = (x+1)(x+2)"),
  ["<b>Identifica</b>: " + m("u = x+1") + " ; " + m("v = x+2") + ".", "<b>Deriva</b>: " + m("u' = 1") + " ; " + m("v' = 1") + ".",
   "<b>Sustituye</b> en " + m("u'v + uv'") + ": " + m("1(x+2) + (x+1)(1)") + ".", "<b>Simplifica</b>: " + m("2x + 3") + "."]),
[
 G("p-g1","Producto","f(x) = (2x+3)(x^2−1)",[
  S("Identifica:","¿Quiénes son u y v?","u = 2x+3 ; v = x^2−1",["u = 2x+3 ; v = 2x","u = x^2−1 ; v = 3"],"Son los dos factores que se multiplican."),
  S("Deriva:","Calcula u' y v'.","u' = 2 ; v' = 2x",["u' = 2x+3 ; v' = x^2","u' = 3 ; v' = 2x"],"(2x+3)' = 2 y (x^2−1)' = 2x.","Deriva cada factor por separado."),
  T("Sustituye:","Arma u'v + uv'.",["2","(x^2−1)","+","(2x+3)","(2x)"],["−","2x","3"],"u'v = 2(x²−1) y uv' = (2x+3)(2x)."),
  S("Simplifica:","Desarrolla y junta términos.","6x^2 + 6x − 2",["6x^2 + 6x + 2","4x^2 + 6x − 2"],"2x²−2 + 4x²+6x = 6x²+6x−2.")
 ],"No derives multiplicando u'·v'; la regla suma dos productos."),
 G("p-g2","Cociente","f(x) = (x+2)/(x−1)",[
  S("Identifica y deriva:","Con u = x+2 y v = x−1, ¿cuánto valen u' y v'?","u' = 1 ; v' = 1",["u' = 2 ; v' = −1","u' = x ; v' = 1"],"Ambas son rectas de pendiente 1."),
  T("Numerador:","Arma u'v − uv'.",["(1)(x−1)","−","(x+2)(1)"],["+","(x+2)(x−1)"],"El orden importa: u'v primero, restando uv'.","Primero u'v."),
  S("Denominador:","¿Qué va abajo?","(x−1)^2",["x−1","x^2−1"],"Abajo siempre va v al cuadrado."),
  S("Simplifica:","Numerador: x−1−x−2 = −3. Resultado:","−3/(x−1)^2",["3/(x−1)^2","−3/(x−1)"],"x−1−(x+2) = −3; el denominador sigue al cuadrado.")
 ],"En el cociente el signo menos y el orden son lo más delicado."),
 G("p-g3","Producto con potencia","f(x) = x^3(2x−5)",[
  S("Deriva:","Con u = x^3 y v = 2x−5:","u' = 3x^2 ; v' = 2",["u' = x^2 ; v' = 2","u' = 3x^2 ; v' = −5"],"x^3 → 3x^2 y 2x−5 → 2."),
  T("Sustituye:","Arma u'v + uv'.",["3x^2","(2x−5)","+","x^3","(2)"],["−","x^2"],"u'v = 3x²(2x−5) y uv' = x³·2."),
  S("Simplifica:","Desarrolla: 6x³ − 15x² + 2x³.","8x^3 − 15x^2",["6x^3 − 15x^2","8x^3 + 15x^2"],"Suma los x³: 6+2 = 8."),
  S("Factoriza:","Saca factor común.","x^2(8x − 15)",["x^2(8x + 15)","x^3(8x − 15)"],"Factor común x²: 8x³ = x²·8x y −15x² = x²·(−15).")
 ],"Producto → sustituir → desarrollar → (opcional) factorizar."),
 G("p-g4","Cociente con simplificación","f(x) = x^2/(x^2+1)",[
  S("Deriva:","u = x² y v = x²+1.","u' = 2x ; v' = 2x",["u' = x ; v' = 1","u' = 2x ; v' = x"],"Ambas derivan a 2x."),
  T("Numerador:","Arma u'v − uv'.",["2x","(x^2+1)","−","x^2","(2x)"],["+","x"],"u'v − uv'."),
  S("Simplifica numerador:","Desarrolla 2x³+2x−2x³.","2x",["4x^3 + 2x","0"],"Los 2x³ se cancelan."),
  S("Resultado:","Pon el denominador v².","2x/(x^2+1)^2",["2x/(x^2+1)","2x/x^4"],"Abajo (x²+1)², no se simplifica.")
 ],"Los términos de mayor grado a veces se cancelan: simplifica siempre.")
],
[
 G("p-x1","Examen · producto","f(x) = (x^2+3)(x−2)",[
  S("Deriva:","Calcula u' y v'.","u' = 2x ; v' = 1",["u' = x^2+3 ; v' = x−2","u' = 2x ; v' = 0"],"(x²+3)' = 2x y (x−2)' = 1."),
  T("Sustituye:","Arma u'v + uv'.",["2x","(x−2)","+","(x^2+3)","(1)"],["−","x"],"u'v + uv'."),
  S("Simplifica:","Desarrolla y junta.","3x^2 − 4x + 3",["3x^2 + 4x + 3","2x^2 − 4x + 3"],"2x²−4x + x²+3 = 3x²−4x+3.")
 ],"Identificar → derivar → sustituir → simplificar."),
 G("p-x2","Examen · cociente","f(x) = 3x/(x+4)",[
  S("Deriva:","u = 3x ; v = x+4.","u' = 3 ; v' = 1",["u' = 3x ; v' = 1","u' = 3 ; v' = 4"],"3x → 3 y x+4 → 1."),
  T("Numerador:","Arma u'v − uv'.",["3(x+4)","−","3x(1)"],["+","x"],"u'v − uv'."),
  S("Simplifica numerador:","3x+12−3x =","12",["6x+12","12x"],"Las x se cancelan."),
  S("Resultado:","Ponle v².","12/(x+4)^2",["12/(x+4)","−12/(x+4)^2"],"Numerador 12, denominador (x+4)².")
 ],"Cociente: u'v − uv' sobre v²."),
 G("p-x3","Examen · pendiente en un punto","f(x) = x^2(x+1), x = 1",[
  S("Arma f'(x):","Con u = x² y v = x+1.","2x(x+1) + x^2(1)",["2x(1)","2x(x+1) − x^2(1)"],"u'v + uv'."),
  S("Simplifica:","Desarrolla.","3x^2 + 2x",["2x^2 + 2x","3x^2 + x"],"2x²+2x + x² = 3x²+2x."),
  S("Evalúa:","Calcula f'(1).","5",["3","6"],"3+2 = 5.")
 ],"Pendiente = f' evaluada en el punto.")
]);

// =================== 3. REGLA DE LA CADENA ===================
addTo(2,
[F("Cadena","d/dx f(g(x)) = f'(g(x))·g'(x)"), F("Potencia","d/dx u^n = n·u^(n−1)·u'"), F("Raíz","d/dx √u = u'/(2√u)"), F("Método","exterior · interior")],
L("Ejemplo resuelto: de afuera hacia adentro","Primero derivas la 'capa' de afuera (dejando lo de adentro igual) y luego multiplicas por la derivada de adentro.",
  m("f(x) = (2x+1)^3"),
  ["<b>Interior</b>: " + m("u = 2x+1") + ", " + m("u' = 2") + ".", "<b>Exterior</b>: " + m("3u^2") + ".", "<b>Multiplica</b>: " + m("3(2x+1)^2 · 2") + ".", "<b>Simplifica</b>: " + m("6(2x+1)^2") + "."]),
[
 G("c-g1","Cadena con potencia","f(x) = (3x+2)^5",[
  S("Interior:","¿Quién es u?","u = 3x+2",["u = 5","u = (3x+2)^5"],"Es lo que está dentro del paréntesis."),
  S("Exterior:","Deriva u^5 respecto de u.","5u^4",["u^5","5u^5"],"Baja el 5 y exponente 4."),
  S("Interior':","Calcula u'.","3",["3x","5"],"(3x+2)' = 3."),
  T("Une:","Exterior (con u sustituida) por u'.",["5","(3x+2)^4","·","3"],["(3x+2)^5","4","+"],"5(3x+2)⁴ por 3."),
  S("Simplifica:","","15(3x+2)^4",["15(3x+2)^5","8(3x+2)^4"],"5·3 = 15; el exponente es 4.")
 ],"Nunca olvides multiplicar por la derivada del interior."),
 G("c-g2","Cadena con raíz","f(x) = √(4x−1)",[
  S("Interior:","¿Quién es u?","u = 4x−1",["u = √(4x−1)","u = 4"],"Es lo que está bajo la raíz."),
  S("Exterior:","Deriva √u.","1/(2√u)",["1/√u","2√u"],"√u = u^(1/2) → (1/2)u^(−1/2)."),
  S("Interior':","Calcula u'.","4",["4x","−1"],"(4x−1)' = 4."),
  S("Une:","Exterior por u'.","4/(2√(4x−1))",["1/(2√(4x−1))","4/√(4x−1)"],"4 · 1/(2√(4x−1))."),
  S("Simplifica:","","2/√(4x−1)",["4/(4x−1)","1/√(4x−1)"],"4/2 = 2.")
 ],"√u' = u'/(2√u): memoriza esta forma."),
 G("c-g3","Cadena con polinomio","f(x) = (x^2−3x)^4",[
  S("Interior:","u y u'.","u = x^2−3x ; u' = 2x−3",["u = x^2−3x ; u' = 2x","u = 4 ; u' = x^2"],"Derivas lo de adentro completo."),
  S("Exterior:","Deriva u^4.","4u^3",["u^3","4u^4"],"Baja 4, exponente 3."),
  T("Une:","Arma el resultado final.",["4","(x^2−3x)^3","(2x−3)"],["(x^2−3x)^4","2x","3"],"4(x²−3x)³ por (2x−3).")
 ],"Si el interior tiene varios términos, derívalo todo y mételo entre paréntesis."),
 G("c-g4","Cociente + cadena (nivel examen)","f(x) = √(2x−3)/√(3x−1)",[
  S("Identifica:","Es un cociente: ¿quiénes son u y v?","u = √(2x−3) ; v = √(3x−1)",["u = 2x−3 ; v = 3x−1","u = √(2x−3) ; v = 3x−1"],"Arriba y abajo son raíces."),
  S("Deriva u (cadena):","u' = (2x−3)'/(2√(2x−3)).","u' = 1/√(2x−3)",["u' = 2/√(2x−3)","u' = 1/(2√(2x−3))"],"2/(2√…) = 1/√…","Interior 2x−3 → 2."),
  S("Deriva v (cadena):","v' = (3x−1)'/(2√(3x−1)).","v' = 3/(2√(3x−1))",["v' = 3/√(3x−1)","v' = 1/(2√(3x−1))"],"Interior 3x−1 → 3."),
  S("Sustituye:","Arma u'v − uv'.","(1/√(2x−3))(√(3x−1)) − (√(2x−3))(3/(2√(3x−1)))",["(1/√(2x−3))(3/(2√(3x−1)))","(1/√(2x−3))(√(3x−1)) + (√(2x−3))(3/(2√(3x−1)))"],"u'v − uv': el signo es menos."),
  S("Denominador:","v^2 =","3x−1",["√(3x−1)","(3x−1)^2"],"(√a)² = a."),
 ],"f'(x) = [u'v − uv'] / (3x−1). Con estos pasos ya sabes armar derivadas anidadas; simplificar es opcional.")
],
[
 G("c-x1","Examen · potencia","f(x) = (5x−2)^3",[
  S("Interior:","u y u'.","u = 5x−2 ; u' = 5",["u = 5x ; u' = 5","u = 5x−2 ; u' = −2"],"Interior y su derivada."),
  T("Une:","Exterior por u'.",["3","(5x−2)^2","·","5"],["(5x−2)^3","2"],"3u²·u'."),
  S("Simplifica:","","15(5x−2)^2",["15(5x−2)^3","3(5x−2)^2"],"3·5 = 15.")
 ],"Exterior · interior."),
 G("c-x2","Examen · raíz","f(x) = √(x^2+1)",[
  S("Interior:","u y u'.","u = x^2+1 ; u' = 2x",["u = x^2 ; u' = 2x","u = x^2+1 ; u' = x"],"Interior completo."),
  S("Une:","Usa u'/(2√u).","2x/(2√(x^2+1))",["2x/√(x^2+1)","1/(2√(x^2+1))"],"u' arriba, 2√u abajo."),
  S("Simplifica:","","x/√(x^2+1)",["2x/√(x^2+1)","x/(x^2+1)"],"2x/2 = x.")
 ],"Usa la fórmula de la raíz de la hoja."),
 G("c-x3","Examen · producto + cadena","f(x) = x(2x+1)^3",[
  S("Deriva v con cadena:","v = (2x+1)^3.","v' = 6(2x+1)^2",["v' = 3(2x+1)^2","v' = 6(2x+1)^3"],"3(2x+1)²·2."),
  T("Producto:","Arma u'v + uv' (u = x).",["1","(2x+1)^3","+","x","·","6(2x+1)^2"],["−","3(2x+1)^2"],"u' = 1."),
  S("Factoriza:","Saca (2x+1)².","(2x+1)^2(8x+1)",["(2x+1)^2(4x+1)","(2x+1)^3(8x+1)"],"(2x+1)+6x = 8x+1.")
 ],"Cuando se combinan reglas, desarma el problema en piezas.")
]);

// =================== 4. TRIGONOMÉTRICAS ===================
addTo(3,
[F("Seno","d/dx sen x = cos x"), F("Coseno","d/dx cos x = −sen x"), F("Tangente","d/dx tan x = sec^2 x"), F("Con cadena","d/dx sen(u) = cos(u)·u'"), F("Con cadena","d/dx cos(u) = −sen(u)·u'")],
L("Ejemplo resuelto: trigonométrica con interior","La derivada de la trigonométrica 'de afuera' y luego u'.",
  m("f(x) = sen(2x)"),
  ["<b>Interior</b>: " + m("u = 2x") + ", " + m("u' = 2") + ".", "<b>Exterior</b>: " + m("cos(2x)") + ".", "<b>Multiplica</b>: " + m("2cos(2x)") + "."]),
[
 G("t-g1","Suma de trigonométricas","f(x) = 3sen x + 2cos x",[
  S("Término 1:","Deriva 3sen x.","3cos x",["−3cos x","3sen x"],"sen → cos."),
  S("Término 2:","Deriva 2cos x.","−2sen x",["2sen x","−2cos x"],"cos → −sen."),
  T("Resultado:","Arma f'(x).",["3cos x","−","2sen x"],["+","3sen x","2cos x"],"3cos x + (−2sen x).")
 ],"Cuidado con el signo de la derivada del coseno."),
 G("t-g2","Seno con interior","f(x) = sen(5x)",[
  S("Interior:","u y u'.","u = 5x ; u' = 5",["u = sen(5x) ; u' = 5","u = 5x ; u' = x"],"Lo que está dentro del seno."),
  S("Exterior:","Deriva sen(u) dejando u igual.","cos(5x)",["−cos(5x)","sen(5x)"],"sen → cos."),
  T("Une:","Exterior · u'.",["cos(5x)","·","5"],["sen(5x)","−"],"Es 5cos(5x).")
 ],"Interior no cambia dentro de la función; solo se multiplica al final."),
 G("t-g3","Coseno con interior","f(x) = cos(x^2)",[
  S("Interior:","u y u'.","u = x^2 ; u' = 2x",["u = cos x ; u' = 2x","u = x^2 ; u' = x"],"Es lo de adentro."),
  S("Exterior:","Deriva cos(u).","−sen(x^2)",["sen(x^2)","−cos(x^2)"],"cos → −sen."),
  S("Une:","Multiplica por u'.","−2x sen(x^2)",["2x sen(x^2)","−sen(2x)"],"−sen(x²)·2x.")
 ],"El signo negativo del coseno se queda."),
 G("t-g4","Producto con trigonométrica","f(x) = x^2 sen x",[
  S("Deriva:","u = x² ; v = sen x.","u' = 2x ; v' = cos x",["u' = 2x ; v' = −cos x","u' = x^2 ; v' = cos x"],"(sen x)' = cos x."),
  T("Sustituye:","Arma u'v + uv'.",["2x","sen x","+","x^2","cos x"],["−","−cos x"],"u'v + uv'.")
 ],"f'(x) = 2x sen x + x² cos x. Aquí ya no hay más que simplificar."),
 G("t-g5","Tangente con interior","f(x) = tan(2x)",[
  S("Interior:","u y u'.","u = 2x ; u' = 2",["u = tan x ; u' = 2","u = 2x ; u' = x"],"Interior."),
  S("Exterior:","Deriva tan(u).","sec^2(2x)",["sec(2x)","−sec^2(2x)"],"tan → sec²."),
  S("Une:","Multiplica por u'.","2sec^2(2x)",["sec^2(2x)","2sec(2x)"],"sec²(2x)·2.")
 ],"Fórmula de la hoja + u'.")
],
[
 G("t-x1","Examen · suma","f(x) = 4cos x − sen x",[
  S("Término 1:","Deriva 4cos x.","−4sen x",["4sen x","−4cos x"],"cos → −sen."),
  S("Término 2:","Deriva −sen x.","−cos x",["cos x","sen x"],"sen → cos, con el − delante."),
  T("Resultado:","Arma f'(x).",["−4sen x","−","cos x"],["+","4sen x"],"Unes.")
 ],"Sólo signos y fórmulas básicas."),
 G("t-x2","Examen · cadena","f(x) = sen(3x+1)",[
  S("Interior:","u y u'.","u = 3x+1 ; u' = 3",["u = 3x ; u' = 3","u = 3x+1 ; u' = 1"],"Derivas todo el interior."),
  T("Une:","Exterior · u'.",["cos(3x+1)","·","3"],["sen(3x+1)","−"],"cos(u)·u'."),
  S("Orden final:","","3cos(3x+1)",["−3cos(3x+1)","cos(3x+1)"],"Escribimos el 3 adelante.")
 ],"Exterior · interior."),
 G("t-x3","Examen · producto","f(x) = x cos x",[
  S("Deriva:","u = x ; v = cos x.","u' = 1 ; v' = −sen x",["u' = 1 ; v' = sen x","u' = x ; v' = −sen x"],"cos → −sen."),
  T("Sustituye:","u'v + uv'.",["1","cos x","+","x","(−sen x)"],["−","sen x"],"1·cos x + x(−sen x)."),
  S("Simplifica:","","cos x − x sen x",["cos x + x sen x","−x sen x"],"x(−sen x) = −x sen x.")
 ],"Producto con signo negativo incluido.")
]);

// =================== 5. EXPONENCIALES Y LOGARITMOS ===================
addTo(4,
[F("e^x","d/dx e^x = e^x"), F("e^u","d/dx e^u = e^u·u'"), F("ln x","d/dx ln x = 1/x"), F("ln u","d/dx ln u = u'/u"), F("a^x","d/dx a^x = a^x·ln a")],
L("Ejemplo resuelto: ln con interior","Con ln, la derivada es 'u' entre u'.",
  m("f(x) = ln(2x+1)"),
  ["<b>Interior</b>: " + m("u = 2x+1") + ", " + m("u' = 2") + ".", "<b>Fórmula</b>: " + m("u'/u") + ".", "<b>Resultado</b>: " + m("2/(2x+1)") + "."]),
[
 G("e-g1","e con interior","f(x) = e^(3x)",[
  S("Interior:","u y u'.","u = 3x ; u' = 3",["u = e^(3x) ; u' = 3","u = 3x ; u' = x"],"Es el exponente."),
  T("Une:","e^u · u'.",["e^(3x)","·","3"],["e^x","−"],"e^u no cambia."),
  S("Orden final:","","3e^(3x)",["e^(3x)","3xe^(3x)"],"El 3 adelante.")
 ],"e^u se queda igual y se multiplica por u'."),
 G("e-g2","ln con interior","f(x) = ln(5x)",[
  S("Interior:","u y u'.","u = 5x ; u' = 5",["u = ln(5x) ; u' = 5","u = 5 ; u' = x"],"Lo que está dentro del ln."),
  S("Fórmula:","Aplica u'/u.","5/(5x)",["1/(5x)","5x/5"],"u' arriba, u abajo."),
  S("Simplifica:","","1/x",["5/x","1/(5x)"],"El 5 se cancela.")
 ],"Curiosidad: ln(5x) tiene la misma derivada que ln x."),
 G("e-g3","ln de un polinomio","f(x) = ln(x^2+1)",[
  S("Interior:","u y u'.","u = x^2+1 ; u' = 2x",["u = x^2 ; u' = 2x","u = x^2+1 ; u' = x"],"Interior completo."),
  S("Fórmula:","Aplica u'/u.","2x/(x^2+1)",["1/(x^2+1)","2x/x^2"],"u' arriba, u abajo."),
  S("¿Cancelar?","¿Puedes tachar x^2 con el 2x?","No: x^2 es un sumando, no un factor",["Sí: tacho x^2 y queda 2x","Sí: queda 2/1"],"Sólo se cancelan factores, no sumandos.")
 ],"Error clásico: cancelar términos sumados."),
 G("e-g4","Producto con e^x","f(x) = x e^x",[
  S("Deriva:","u = x ; v = e^x.","u' = 1 ; v' = e^x",["u' = 1 ; v' = x e^(x−1)","u' = x ; v' = e^x"],"e^x es su propia derivada."),
  T("Sustituye:","u'v + uv'.",["1","e^x","+","x","e^x"],["−","e^(x^2)"],"1·e^x + x·e^x."),
  S("Factoriza:","","e^x(1 + x)",["e^x(1 − x)","x e^x"],"Factor común e^x.")
 ],"e^x aparece en ambos términos: factorízalo."),
 G("e-g5","Base distinta de e","f(x) = 3^x",[
  S("Fórmula:","¿Cuál aplica?","d/dx a^x = a^x·ln a",["d/dx a^x = x·a^(x−1)","d/dx a^x = a^x"],"La variable va en el exponente."),
  S("Resultado:","Con a = 3.","3^x ln 3",["x·3^(x−1)","3^x"],"3^x por ln 3."),
  S("¿Por qué no x·3^(x−1)?","","Porque la variable está en el exponente, no en la base",["Porque 3 es impar","Porque x es positivo"],"La regla de la potencia es para base variable.")
 ],"Base variable → potencia. Exponente variable → exponencial.")
],
[
 G("e-x1","Examen · e^u","f(x) = e^(x^2)",[
  S("Interior:","u y u'.","u = x^2 ; u' = 2x",["u = e^x ; u' = 2x","u = x^2 ; u' = x"],"Exponente."),
  T("Une:","e^u · u'.",["e^(x^2)","·","2x"],["e^(2x)","−"],"e^u se queda."),
  S("Orden final:","","2x e^(x^2)",["e^(2x)","x^2 e^(x^2)"],"2x adelante.")
 ],"e^u·u'."),
 G("e-x2","Examen · ln y evaluación","f(x) = ln(3x+1)",[
  S("Interior:","u y u'.","u = 3x+1 ; u' = 3",["u = 3x ; u' = 3","u = 3x+1 ; u' = 1"],"Interior completo."),
  S("Fórmula:","u'/u.","3/(3x+1)",["1/(3x+1)","3/(3x)"],"u' sobre u."),
  S("Evalúa:","f'(0).","3",["1","0"],"3/(0+1) = 3.")
 ],"Evalúa tras derivar."),
 G("e-x3","Examen · producto con ln","f(x) = x ln x",[
  S("Deriva:","u = x ; v = ln x.","u' = 1 ; v' = 1/x",["u' = 1 ; v' = x","u' = x ; v' = 1/x"],"(ln x)' = 1/x."),
  T("Sustituye:","u'v + uv'.",["1","ln x","+","x","(1/x)"],["−","x ln x"],"1·ln x + x·(1/x)."),
  S("Simplifica:","","ln x + 1",["ln x + x","ln x"],"x·(1/x) = 1.")
 ],"Producto con ln.")
]);

// =================== 6. IMPLÍCITAS Y ORDEN SUPERIOR ===================
addTo(5,
[F("Implícita","d/dx y^n = n·y^(n−1)·dy/dx"), F("Método","1) deriva todo  2) junta dy/dx  3) despeja"), F("Orden superior","f'' = derivada de f'")],
L("Ejemplo resuelto: implícita en 3 pasos","Cuando y no está despejada, cada y se deriva y se le pega dy/dx.",
  m("x^2 + y^2 = 25"),
  ["<b>Deriva</b> ambos lados: " + m("2x + 2y·dy/dx = 0") + ".", "<b>Aísla</b>: " + m("2y·dy/dx = −2x") + ".", "<b>Despeja</b>: " + m("dy/dx = −x/y") + "."]),
[
 G("i-g1","Implícita básica","x^2 + y^2 = 25",[
  S("Deriva x²:","","2x",["x","2x^2"],"Regla de la potencia."),
  S("Deriva y²:","","2y·dy/dx",["2y","y^2·dy/dx"],"y es función de x: cadena."),
  S("Ecuación:","Junta.","2x + 2y·dy/dx = 0",["2x + 2y = 0","2x + 2y·dy/dx = 25"],"Constante deriva a 0."),
  S("Despeja:","","dy/dx = −x/y",["dy/dx = x/y","dy/dx = −y/x"],"2y·dy/dx = −2x.")
 ],"El truco: toda y trae dy/dx."),
 G("i-g2","Implícita con producto","x^2 + 3xy = 10",[
  S("Deriva x²:","","2x",["x","2x^2"],"Potencia."),
  S("Deriva 3xy:","Producto x·y.","3y + 3x·dy/dx",["3y","3x·dy/dx"],"u'v + uv' con v = y."),
  S("Ecuación:","","2x + 3y + 3x·dy/dx = 0",["2x + 3y = 0","2x + 3y·dy/dx = 0"],"Suma todo."),
  S("Despeja:","","dy/dx = −(2x + 3y)/(3x)",["dy/dx = (2x + 3y)/(3x)","dy/dx = −(2x + 3y)/3"],"3x·dy/dx = −2x−3y.")
 ],"Producto + implícita: dos reglas a la vez."),
 G("i-g3","Implícita con potencia","y^3 = x^2 + 1",[
  S("Deriva y³:","","3y^2·dy/dx",["3y^2","y^3·dy/dx"],"Cadena."),
  S("Deriva x²+1:","","2x",["x","2x + 1"],"El 1 se va."),
  S("Despeja:","","dy/dx = 2x/(3y^2)",["dy/dx = 3y^2/(2x)","dy/dx = 2x·3y^2"],"Divide entre 3y².")
 ],"Lado izquierdo y derecho se derivan igual."),
 G("i-g4","Derivadas sucesivas","f(x) = x^4 − 3x^2 + 2x",[
  S("Primera:","f'(x) =","4x^3 − 6x + 2",["4x^3 − 3x + 2","x^3 − 6x"],"Término a término."),
  S("Segunda:","f''(x) =","12x^2 − 6",["12x^2 − 6x","4x^3 − 6"],"Deriva f'."),
  S("Tercera:","f'''(x) =","24x",["24","12x"],"12x² → 24x.")
 ],"Deriva el resultado anterior cada vez."),
 G("i-g5","Patrón con e^(2x)","f(x) = e^(2x)",[
  S("Primera:","","2e^(2x)",["e^(2x)","2xe^(2x)"],"e^u·u'."),
  S("Segunda:","","4e^(2x)",["2e^(2x)","4xe^(2x)"],"2·2."),
  S("Patrón:","f^(n)(x) =","2^n e^(2x)",["2n e^(2x)","n e^(2x)"],"Cada derivada multiplica por 2.")
 ],"Detectar patrones es una habilidad de examen.")
],
[
 G("i-x1","Examen · implícita","x^2 − y^2 = 16, punto (5, 3)",[
  S("Deriva:","","2x − 2y·dy/dx = 0",["2x − 2y = 0","2x + 2y·dy/dx = 0"],"Cadena en y²."),
  S("Despeja:","","dy/dx = x/y",["dy/dx = −x/y","dy/dx = y/x"],"2y·dy/dx = 2x."),
  S("Evalúa:","En (5, 3).","5/3",["3/5","−5/3"],"x/y = 5/3.")
 ],"Deriva, despeja, evalúa."),
 G("i-x2","Examen · producto implícito","xy = 6, punto (2, 3)",[
  S("Deriva:","","y + x·dy/dx = 0",["y + x = 0","y·dy/dx + x = 0"],"Producto xy."),
  S("Despeja:","","dy/dx = −y/x",["dy/dx = y/x","dy/dx = −x/y"],"x·dy/dx = −y."),
  S("Evalúa:","En (2, 3).","−3/2",["3/2","−2/3"],"−y/x = −3/2.")
 ],"Producto en implícita."),
 G("i-x3","Examen · segunda derivada","f(x) = x^3 + 5x^2",[
  S("Primera:","","3x^2 + 10x",["3x^2 + 5x","x^2 + 10x"],"Potencia."),
  S("Segunda:","","6x + 10",["6x + 10x","3x + 10"],"Derivas f'."),
  S("Evalúa:","f''(1).","16",["10","6"],"6+10 = 16.")
 ],"Deriva dos veces y evalúa.")
]);
