/* =========================================================
   Derivadas Dojo — banco de contenido
   Cada bloque = una unidad del curso. Dentro de cada uno:
   - lessons:  explicaciones cortas con ejemplos
   - practice: ejercicios para aprender haciendo (con pistas)
   - exam:     mini-examen final del bloque (sin pistas)

   Tipos de ejercicio:
   - "mcq"   -> elegir la opción correcta (siguiente paso,
                fórmula correcta, o verdadero/falso de un paso)
   - "build" -> arrastrar fichas en orden para construir la
                respuesta (incluye fichas distractoras)

   Para agregar más contenido: copia un objeto existente del
   mismo "type" dentro de practice[] o exam[] y cambia los
   valores. No hace falta tocar ningún otro archivo.
   ========================================================= */

const BLOCKS = [

// ======================================================
// BLOQUE 1 — FUNDAMENTOS Y REGLA DE LA POTENCIA
// ======================================================
{
  id: "fundamentos",
  title: "Fundamentos y regla de la potencia",
  summary: "Qué es una derivada, y cómo derivar potencias, constantes y sumas.",
  lessons: [
    {
      title: "¿Qué es la derivada? (con peras y manzanas)",
      html: `
        <p>Olvídate de fórmulas por un segundo. Imagina que vas manejando y cada
        minuto anotas cuántos kilómetros llevas:</p>
        <div class="example">Minuto 1 → 10 km &nbsp;·&nbsp; Minuto 2 → 25 km &nbsp;·&nbsp; Minuto 3 → 45 km</div>
        <p>Entre el minuto 1 y 2 avanzaste 15 km. Entre el 2 y 3, avanzaste 20 km:
        ibas <strong>cada vez más rápido</strong>. A esa idea — "qué tan rápido
        está cambiando algo, justo en este instante" — es a lo único que se
        refiere una derivada. Nada más.</p>
        <div class="analogy">El velocímetro de tu carro hace exactamente eso: no
        te dice cuánto llevas recorrido, te dice qué tan rápido cambias de
        posición <em>en este momento</em>. Eso es una derivada.</div>
        <p>Como escribir "qué tan rápido cambia esta función, justo en este
        punto" cada vez sería agotador, los matemáticos inventaron una forma
        corta de decirlo:</p>
        <div class="rule-visual"><span class="side math"><span class="tok-func">f</span>'(<span class="tok-var">x</span>)</span></div>
        <p>Y se lee pieza por pieza:</p>
        <ul>
          <li><span class="tok-func" style="font-weight:700;">f</span> — el nombre de tu función (tu "receta").</li>
          <li><span class="tok-var" style="font-weight:700;">x</span> — el punto exacto donde quieres medir qué tan rápido cambia.</li>
          <li>la comilla <strong>'</strong> — se lee "la derivada de", como quien dice "el velocímetro de".</li>
        </ul>
        <p>También verás <span class="math"><span class="tok-var">dy/dx</span></span> y <span class="math"><span class="tok-var">y</span>'</span>: son otras dos formas de escribir exactamente lo mismo.</p>
      `
    },
    {
      title: "La regla de la potencia (con peras y manzanas)",
      html: `
        <p>Cuando tu función es una x con un exponente arriba, como x³ (x
        multiplicada tres veces), hay un truco rapidísimo — nunca más
        necesitas hacer el cálculo largo del velocímetro.</p>
        <div class="analogy">Piensa en el exponente como una etiqueta pegada
        arriba de la x. La regla dice: <strong>despega la etiqueta y pégala al
        frente multiplicando</strong>, y a la que quedó arriba, <strong>réstale
        1</strong>.</div>
        <div class="rule-visual">
          <span class="side math"><span class="tok-var">x</span><sup class="tok-exp">n</sup></span>
          <span class="rule-arrow">→</span>
          <span class="side math"><span class="tok-exp">n</span>·<span class="tok-var">x</span><sup class="tok-exp">n−1</sup></span>
        </div>
        <p>El número rosa (el exponente) es el mismo de los dos lados: solo
        cambió de lugar, y al que se quedó arriba le restamos 1.</p>
        <p>Con números reales:</p>
        <div class="example">
          <span class="math"><span class="tok-var">x</span><sup class="tok-exp">5</sup> → <span class="tok-exp">5</span>·<span class="tok-var">x</span><sup class="tok-exp">4</sup></span><br>
          <span class="math"><span class="tok-num">9</span><span class="tok-var">x</span><sup class="tok-exp">4</sup> → <span class="tok-num">36</span><span class="tok-var">x</span><sup class="tok-exp">3</sup></span> (aquí 9×4=36)
        </div>
        <p><strong>Si tu función es solo un número fijo</strong> (como 7, sin
        ninguna x), nunca cambia — su "qué tan rápido cambia" es 0.</p>
        <p><strong>Si hay un número multiplicando por fuera</strong> (como el 9
        de arriba), ese número se queda tranquilo acompañando: no le pasa nada
        especial, solo se multiplica por lo que resulte.</p>
      `
    },
    {
      title: "Sumar y restar piezas",
      html: `
        <p>Si tu función es como una receta con varios ingredientes sumados o
        restados, no hay truco nuevo: derivas cada ingrediente por separado,
        con su mismo signo, y los vuelves a juntar.</p>
        <div class="example">
          <span class="math"><span class="tok-var">f</span>(<span class="tok-var">x</span>) = <span class="tok-num">5</span><span class="tok-var">x</span><sup class="tok-exp">3</sup> <span class="tok-op">−</span> <span class="tok-num">2</span><span class="tok-var">x</span><sup class="tok-exp">2</sup> <span class="tok-op">+</span> <span class="tok-num">7</span><span class="tok-var">x</span> <span class="tok-op">−</span> <span class="tok-num">4</span></span>
        </div>
        <p>Derivas pieza por pieza, y la última pieza (el −4, un número solo)
        desaparece por ser constante:</p>
        <div class="example">
          <span class="math"><span class="tok-var">f</span>'(<span class="tok-var">x</span>) = <span class="tok-num">15</span><span class="tok-var">x</span><sup class="tok-exp">2</sup> <span class="tok-op">−</span> <span class="tok-num">4</span><span class="tok-var">x</span> <span class="tok-op">+</span> <span class="tok-num">7</span></span>
        </div>
      `
    }
  ],

  practice: [
    {
      id:"f-p1", type:"mcq",
      kicker:"Paso a paso",
      func:"f(x) = x^6",
      prompt:"¿Cuál es el siguiente paso para hallar f'(x) con la regla de la potencia?",
      options:[
        {text:"Bajar el 6 como coeficiente y restar 1 al exponente: f'(x) = 6x^5", correct:true},
        {text:"Subir el exponente en 1: f'(x) = x^7", correct:false},
        {text:"Multiplicar x por 6 sin tocar el exponente: f'(x) = 6x^6", correct:false},
        {text:"Restar 1 solo al coeficiente implícito: f'(x) = 5x^6", correct:false},
      ],
      explanation:"d/dx[x^n] = n·x^(n−1). Aquí n = 6: el nuevo coeficiente es 6 y el nuevo exponente es 6−1 = 5. Resultado: f'(x) = 6x^5.",
      hints:["Recuerda la fórmula d/dx[x^n] = n·x^(n−1).","El exponente baja multiplicando al frente, y luego se le resta 1 a sí mismo."]
    },
    {
      id:"f-p2", type:"build",
      kicker:"Arma la respuesta",
      func:"f(x) = 9x^4",
      prompt:"Arrastra las fichas en orden para construir f'(x).",
      tokensCorrect:["36", "x^3"],
      tokensDistractors:["9", "x^4", "4", "13x^3"],
      explanation:"9 × 4 = 36 (coeficiente × exponente), y el exponente baja de 4 a 3. f'(x) = 36x^3.",
      hints:["Multiplica el coeficiente 9 por el exponente 4.","Después, resta 1 al exponente 4."]
    },
    {
      id:"f-p3", type:"mcq",
      kicker:"Verdadero o falso",
      func:"f(x) = x^10 + 7",
      context:["Paso propuesto: f'(x) = 10x^9 + 7"],
      prompt:"¿Este paso es correcto?",
      options:[
        {text:"Sí, es correcto", correct:false},
        {text:"No, hay un error", correct:true},
      ],
      explanation:"La derivada de cualquier constante es 0, no la constante misma. El +7 se convierte en +0. Lo correcto es f'(x) = 10x^9.",
      hints:["Piensa en la gráfica de y = 7: es una recta horizontal.","¿Cuál es la pendiente de una recta horizontal?"]
    },
    {
      id:"f-p4", type:"build",
      kicker:"Arma la respuesta",
      func:"f(x) = 5x^3 − 2x^2 + 7x − 4",
      prompt:"Arrastra las fichas en orden para construir f'(x) completa.",
      tokensCorrect:["15x^2", "−", "4x", "+", "7"],
      tokensDistractors:["5x^2", "2x", "14x", "4"],
      explanation:"Derivas cada término: 5x^3→15x^2, −2x^2→−4x, 7x→7, y −4→0 (desaparece). f'(x) = 15x^2 − 4x + 7.",
      hints:["Deriva cada término por separado y súmalos con su mismo signo.","La constante −4 desaparece: su derivada es 0."]
    },
    {
      id:"f-p5", type:"mcq",
      kicker:"Con exponente negativo",
      func:"f(x) = 4x^(−2)",
      prompt:"¿Cuál es f'(x)?",
      options:[
        {text:"−8x^(−3)", correct:true},
        {text:"8x^(−3)", correct:false},
        {text:"−8x^(−1)", correct:false},
        {text:"−2x^(−3)", correct:false},
      ],
      explanation:"La regla de la potencia funciona igual con exponentes negativos: n = −2, nuevo coeficiente = 4×(−2) = −8, nuevo exponente = −2−1 = −3.",
      hints:["La regla n·x^(n−1) no cambia aunque n sea negativo.","4 × (−2) = −8, y −2 − 1 = −3."]
    }
  ],

  exam:[
    {
      id:"f-e1", type:"mcq",
      func:"f(x) = 7x^5",
      prompt:"¿Cuál es f'(x)?",
      options:[
        {text:"35x^4", correct:true},
        {text:"35x^5", correct:false},
        {text:"7x^4", correct:false},
        {text:"12x^4", correct:false},
      ],
      explanation:"7 × 5 = 35, y el exponente baja a 4. f'(x) = 35x^4."
    },
    {
      id:"f-e2", type:"build",
      func:"f(x) = x^8 − 6x",
      prompt:"Construye f'(x).",
      tokensCorrect:["8x^7", "−", "6"],
      tokensDistractors:["8x^8","6x","7x^7"],
      explanation:"x^8 → 8x^7, y −6x → −6 (porque x^1 baja a x^0 = 1)."
    },
    {
      id:"f-e3", type:"mcq",
      func:"f(x) = 12",
      context:["Afirmación: f'(x) = 12"],
      prompt:"¿Correcto o incorrecto?",
      options:[
        {text:"Correcto", correct:false},
        {text:"Incorrecto", correct:true},
      ],
      explanation:"f(x)=12 es una constante: su derivada es siempre 0, no 12."
    }
  ]
},

// ======================================================
// BLOQUE 2 — PRODUCTO Y COCIENTE
// ======================================================
{
  id: "producto-cociente",
  title: "Producto y cociente",
  summary: "Cómo derivar cuando dos funciones se multiplican o se dividen.",
  lessons:[
    {
      title:"Regla del producto (con peras y manzanas)",
      html:`
        <p>Imagina que vendes manzanas. Tu ingreso total es precio × cantidad
        vendida. Si un día subes el precio Y también vendes más cantidad al
        mismo tiempo, ¿cómo afecta eso a tu ingreso total?</p>
        <div class="analogy">No puedes solo "multiplicar los cambios": hay que
        sumar dos efectos por separado — cuánto cambia tu ingreso
        <strong>solo por el precio</strong>, más cuánto cambia
        <strong>solo por la cantidad</strong>.</div>
        <p>Eso es la regla del producto. Si tu función son dos piezas
        multiplicándose (les llamamos u y v), su derivada es:</p>
        <div class="rule-visual">
          <span class="side math"><span class="tok-var">u</span>'<span class="tok-var">v</span> <span class="tok-op">+</span> <span class="tok-var">uv</span>'</span>
        </div>
        <p>En palabras: "derivada del primero, por el segundo tal cual — más —
        el primero tal cual, por la derivada del segundo". El error más común
        es multiplicar solo las dos derivadas entre sí; eso no es lo mismo y
        te va a dar un resultado equivocado.</p>
      `
    },
    {
      title:"Regla del cociente (con peras y manzanas)",
      html:`
        <p>Ahora imagina velocidad = distancia ÷ tiempo. Si tanto la
        distancia como el tiempo están cambiando a la vez, dividir ya no es
        tan simple como derivar cada uno por separado.</p>
        <div class="analogy">Cuando el de ABAJO (el que divide) también
        crece, tiende a achicar el resultado total — por eso en la fórmula se
        <strong>resta</strong> ese efecto, no se suma. Y como dividir
        "desordena" las unidades, al final todo se divide entre el de abajo
        elevado al cuadrado, para que vuelva a cuadrar.</div>
        <div class="rule-visual">
          <span class="side math"><span class="frac"><span class="num"><span class="tok-var">u</span>′<span class="tok-var">v</span> <span class="tok-op">−</span> <span class="tok-var">u</span><span class="tok-var">v</span>′</span><span class="den"><span class="tok-var">v</span><sup class="tok-exp">2</sup></span></span></span>
        </div>
        <p>Aquí el orden sí importa: siempre u'v primero, restando uv' — si lo
        inviertes, el signo te queda al revés.</p>
      `
    }
  ],
  practice:[
    {
      id:"pc-p1", type:"mcq",
      kicker:"Identifica la fórmula",
      func:"f(x) = (3x+1)(x^2−4)",
      context:["u = 3x+1, u' = 3", "v = x^2−4, v' = 2x"],
      prompt:"¿Cuál es la combinación correcta para armar f'(x)?",
      options:[
        {text:"u'v + uv' = 3(x^2−4) + (3x+1)(2x)", correct:true},
        {text:"u'v' = 3 · 2x", correct:false},
        {text:"uv − u'v' = (3x+1)(x^2−4) − 3(2x)", correct:false},
        {text:"u'v − uv' = 3(x^2−4) − (3x+1)(2x)", correct:false},
      ],
      explanation:"La regla del producto es u'v + uv'. Multiplicar solo las derivadas (u'v') es el error más común: no es así.",
      hints:["Derivada del primero por el segundo normal, MÁS el primero normal por la derivada del segundo.","Nunca multipliques u' por v' directamente."]
    },
    {
      id:"pc-p2", type:"build",
      kicker:"Simplifica",
      func:"f(x) = (3x+1)(x^2−4)",
      context:["f'(x) = 3(x^2−4) + (3x+1)(2x)"],
      prompt:"Expande y simplifica: arma la forma final de f'(x).",
      tokensCorrect:["9x^2", "+", "2x", "−", "12"],
      tokensDistractors:["3x^2","6x","4x","8"],
      explanation:"3(x^2−4) = 3x^2−12. (3x+1)(2x) = 6x^2+2x. Sumando: 3x^2−12+6x^2+2x = 9x^2+2x−12.",
      hints:["Primero expande cada paréntesis por separado.","Luego junta los términos semejantes (los x^2 con x^2, etc.)."]
    },
    {
      id:"pc-p3", type:"mcq",
      kicker:"Antes de simplificar",
      func:"f(x) = (x^2+3) / (x−1)",
      context:["u = x^2+3, u' = 2x", "v = x−1, v' = 1"],
      prompt:"¿Cuál expresión corresponde correctamente a la regla del cociente?",
      options:[
        {text:"[2x(x−1) − (x^2+3)(1)] / (x−1)^2", correct:true},
        {text:"[(x^2+3)(1) − 2x(x−1)] / (x−1)^2", correct:false},
        {text:"[2x(x−1) + (x^2+3)(1)] / (x−1)^2", correct:false},
        {text:"[2x(x−1) − (x^2+3)(1)] / (x−1)", correct:false},
      ],
      explanation:"El orden es u'v − uv' arriba, y v² abajo: [2x(x−1) − (x^2+3)(1)] / (x−1)^2.",
      hints:["Arriba siempre: derivada del de arriba por el de abajo, MENOS el de arriba por la derivada del de abajo.","El denominador se eleva al cuadrado completo."]
    },
    {
      id:"pc-p4", type:"mcq",
      kicker:"Verdadero o falso",
      func:"f(x) = x·(x+2)",
      context:["Paso propuesto: f'(x) = 1 · 1 = 1 (multiplicando solo las derivadas)"],
      prompt:"¿Este razonamiento es correcto?",
      options:[
        {text:"Sí, es correcto", correct:false},
        {text:"No, hay un error", correct:true},
      ],
      explanation:"El producto NO se deriva multiplicando u'·v'. Con la regla correcta: u'=1, v=x+2, u=x, v'=1 → f'(x) = (1)(x+2) + (x)(1) = 2x+2.",
      hints:["¿Aplicaste u'v + uv', o multiplicaste solo las derivadas?","Prueba con un caso simple: f(x)=x·x=x^2, cuya derivada ya sabes que es 2x."]
    }
  ],
  exam:[
    {
      id:"pc-e1", type:"mcq",
      func:"f(x) = (2x−5)(x^2+1)",
      prompt:"¿Cuál es la forma simplificada de f'(x)?",
      options:[
        {text:"6x^2 − 10x + 2", correct:true},
        {text:"2x^2 − 10x", correct:false},
        {text:"6x^2 + 2", correct:false},
        {text:"4x − 10x + 2", correct:false},
      ],
      explanation:"u'=2, v=x^2+1, u=2x−5, v'=2x. f'=2(x^2+1)+(2x−5)(2x) = 2x^2+2+4x^2−10x = 6x^2−10x+2."
    },
    {
      id:"pc-e2", type:"build",
      func:"f(x) = 5x / (x^2+2)",
      prompt:"Construye el numerador simplificado de f'(x), sobre el denominador (x^2+2)^2.",
      tokensCorrect:["−5x^2", "+", "10"],
      tokensDistractors:["5x^2","10x","15"],
      explanation:"u'=5, v=x^2+2, u=5x, v'=2x. Numerador: 5(x^2+2) − 5x(2x) = 5x^2+10−10x^2 = −5x^2+10."
    },
    {
      id:"pc-e3", type:"mcq",
      context:["Para f(x) = u(x)/v(x), un estudiante escribe: f'(x) = (u'v + uv') / v^2"],
      prompt:"¿Ese estudiante aplicó bien la regla del cociente?",
      options:[
        {text:"Sí", correct:false},
        {text:"No, confundió el signo: debe ser u'v − uv'", correct:true},
      ],
      explanation:"La regla del cociente resta, no suma, en el numerador. El signo + corresponde a la regla del producto, no a esta."
    }
  ]
},

// ======================================================
// BLOQUE 3 — REGLA DE LA CADENA
// ======================================================
{
  id:"cadena",
  title:"Regla de la cadena",
  summary:"Derivar funciones compuestas: una función 'dentro' de otra.",
  lessons:[
    {
      title:"Funciones compuestas, como engranajes",
      html:`
        <p>Imagina dos engranajes conectados: uno chiquito pegado a uno
        grande. Cuando el chiquito gira rápido, mueve al grande — pero qué
        tan rápido gira el grande depende de QUÉ TAN RÁPIDO GIRA EL CHIQUITO
        también, no solo de su propio tamaño.</p>
        <div class="analogy">Una función compuesta es así: una función "de
        afuera" conectada a una "de adentro", como (3x+5)⁴. Para saber qué
        tan rápido cambia el resultado final, multiplicas la velocidad de la
        de afuera POR la velocidad de la de adentro. Si lo de adentro casi no
        se mueve, lo de afuera tampoco se mueve mucho.</div>
        <div class="rule-visual">
          <span class="side math">[<span class="tok-func">f</span>(<span class="tok-func">g</span>(<span class="tok-var">x</span>))]' <span class="tok-op">=</span> <span class="tok-func">f</span>'(<span class="tok-func">g</span>(<span class="tok-var">x</span>)) <span class="tok-op">·</span> <span class="tok-func">g</span>'(<span class="tok-var">x</span>)</span>
        </div>
      `
    },
    {
      title:"Aplicándola paso a paso",
      html:`
        <p>Para (3x+5)⁴: el engranaje de afuera es "elevar a la 4" — lo
        derivas con la regla de la potencia dejando (3x+5) intacto adentro.
        El engranaje de adentro es "3x+5" — derívalo aparte (su derivada es
        3) y MULTIPLÍCALO.</p>
        <div class="example">
          <span class="math"><span class="tok-var">f</span>'(<span class="tok-var">x</span>) = <span class="tok-exp">4</span>(<span class="tok-num">3</span><span class="tok-var">x</span><span class="tok-op">+</span><span class="tok-num">5</span>)<sup class="tok-exp">3</sup> <span class="tok-op">·</span> <span class="tok-num">3</span> <span class="tok-op">=</span> <span class="tok-num">12</span>(<span class="tok-num">3</span><span class="tok-var">x</span><span class="tok-op">+</span><span class="tok-num">5</span>)<sup class="tok-exp">3</sup></span>
        </div>
        <p>El error más común de todo el curso: <strong>olvidar multiplicar
        por la derivada de adentro</strong>. Siempre pregúntate: "¿qué hay
        dentro del paréntesis, y ya derivé eso también?"</p>
      `
    }
  ],
  practice:[
    {
      id:"c-p1", type:"mcq",
      kicker:"Identifica el paso",
      func:"f(x) = (3x+5)^4",
      prompt:"¿Cuál es el siguiente paso correcto?",
      options:[
        {text:"4(3x+5)^3 · 3", correct:true},
        {text:"4(3x+5)^3", correct:false},
        {text:"(3x+5)^3 · 3", correct:false},
        {text:"4(3x)^3 · 3", correct:false},
      ],
      explanation:"Derivas la capa externa (potencia 4 → 4(3x+5)^3) y multiplicas por la derivada de adentro (3x+5)' = 3. Sin ese factor 3, el paso está incompleto.",
      hints:["Deriva como si (3x+5) fuera una sola variable, usando la regla de la potencia.","No olvides multiplicar por la derivada de lo que está dentro del paréntesis."]
    },
    {
      id:"c-p2", type:"build",
      kicker:"Simplifica",
      func:"f(x) = (x^2+1)^5",
      prompt:"Arma la forma simplificada de f'(x).",
      tokensCorrect:["10x", "(x^2+1)^4"],
      tokensDistractors:["5x","(x^2+1)^5","2x"],
      explanation:"5(x^2+1)^4 · 2x = 10x(x^2+1)^4. El 5 y el 2 se multiplican entre sí (5×2=10).",
      hints:["Primero: 5(x^2+1)^4 · (derivada de x^2+1).","La derivada de x^2+1 es 2x; multiplica los coeficientes 5 y 2."]
    },
    {
      id:"c-p3", type:"mcq",
      kicker:"Con raíz",
      func:"f(x) = √(4x−1)  =  (4x−1)^(1/2)",
      prompt:"¿Cuál es la forma simplificada de f'(x)?",
      options:[
        {text:"2 / √(4x−1)", correct:true},
        {text:"1 / (2√(4x−1))", correct:false},
        {text:"4 / √(4x−1)", correct:false},
        {text:"(1/2)(4x−1)^(−1/2)", correct:false},
      ],
      explanation:"(1/2)(4x−1)^(−1/2) · 4 = (4/2)(4x−1)^(−1/2) = 2(4x−1)^(−1/2) = 2/√(4x−1). La última opción es un paso intermedio sin simplificar, no la respuesta final.",
      hints:["La derivada de x^(1/2) es (1/2)x^(−1/2); aplícala a (4x−1).","No olvides multiplicar por la derivada de adentro, que es 4, y simplifica 4/2."]
    },
    {
      id:"c-p4", type:"mcq",
      kicker:"Verdadero o falso",
      func:"f(x) = (x^3−2)^6",
      context:["Paso propuesto: f'(x) = 6(x^3−2)^5"],
      prompt:"¿Este paso está completo y correcto?",
      options:[
        {text:"Sí, es correcto", correct:false},
        {text:"No, falta multiplicar por la derivada de adentro", correct:true},
      ],
      explanation:"Falta multiplicar por (x^3−2)' = 3x^2. La respuesta completa es f'(x) = 18x^2(x^3−2)^5.",
      hints:["¿Qué hay dentro del paréntesis, y ya se derivó eso también?","La derivada de x^3−2 es 3x^2."]
    }
  ],
  exam:[
    {
      id:"c-e1", type:"mcq",
      func:"f(x) = (5x−2)^3",
      prompt:"¿Cuál es f'(x)?",
      options:[
        {text:"15(5x−2)^2", correct:true},
        {text:"3(5x−2)^2", correct:false},
        {text:"15(5x−2)^3", correct:false},
        {text:"(5x−2)^2", correct:false},
      ],
      explanation:"3(5x−2)^2 · 5 = 15(5x−2)^2."
    },
    {
      id:"c-e2", type:"build",
      func:"f(x) = (x^2−3x)^4",
      prompt:"Arma la forma simplificada de f'(x).",
      tokensCorrect:["4(2x−3)", "(x^2−3x)^3"],
      tokensDistractors:["4(x−3)","(x^2−3x)^4","2x−3"],
      explanation:"4(x^2−3x)^3 · (2x−3) = 4(2x−3)(x^2−3x)^3."
    },
    {
      id:"c-e3", type:"mcq",
      context:["Un estudiante deriva (7x+1)^2 y obtiene f'(x) = 2(7x+1)"],
      prompt:"¿Qué le faltó?",
      options:[
        {text:"Nada, está completo", correct:false},
        {text:"Multiplicar por la derivada de adentro (7)", correct:true},
      ],
      explanation:"f'(x) = 2(7x+1) · 7 = 14(7x+1). Olvidar el factor de adentro es el error más común en la regla de la cadena."
    }
  ]
},

// ======================================================
// BLOQUE 4 — TRIGONOMÉTRICAS
// ======================================================
{
  id:"trig",
  title:"Derivadas trigonométricas",
  summary:"Las derivadas de seno, coseno y tangente, solas y combinadas con la cadena.",
  lessons:[
    {
      title:"Las tres derivadas base (con peras y manzanas)",
      html:`
        <p>Piensa en una rueda de la fortuna girando. Tu altura sobre el piso
        sube y baja formando una ola — eso es el seno y el coseno: describen
        vueltas y olas, no solo triángulos sueltos.</p>
        <div class="example">
          <span class="math"><span class="tok-func">sen</span> <span class="tok-op">→</span> <span class="tok-func">cos</span></span><br>
          <span class="math"><span class="tok-func">cos</span> <span class="tok-op">→</span> <span class="tok-op">−</span><span class="tok-func">sen</span></span><br>
          <span class="math"><span class="tok-func">tan</span> <span class="tok-op">→</span> <span class="tok-func">sec</span><sup class="tok-exp">2</sup></span>
        </div>
        <div class="analogy">Memorízalas así: seno y coseno se "turnan" entre
        sí (uno se convierte en el otro), y al coseno siempre se le pega un
        signo negativo al convertirse. La tangente siempre se convierte en
        secante al cuadrado.</div>
      `
    },
    {
      title:"Combinadas con engranajes (regla de la cadena)",
      html:`
        <p>Si en vez de una x sola hay algo más complicado adentro del seno
        o coseno, usa el mismo truco de los engranajes del bloque anterior:
        deriva la función trigonométrica dejando lo de adentro intacto, y
        multiplica por la derivada de lo de adentro.</p>
        <div class="example">
          <span class="math"><span class="tok-func">sen</span>(<span class="tok-num">3</span><span class="tok-var">x</span>) <span class="tok-op">→</span> <span class="tok-func">cos</span>(<span class="tok-num">3</span><span class="tok-var">x</span>) <span class="tok-op">·</span> <span class="tok-num">3</span> <span class="tok-op">=</span> <span class="tok-num">3</span><span class="tok-func">cos</span>(<span class="tok-num">3</span><span class="tok-var">x</span>)</span>
        </div>
      `
    }
  ],
  practice:[
    {
      id:"t-p1", type:"mcq",
      func:"f(x) = cos(x)",
      prompt:"¿Cuál es f'(x)?",
      options:[
        {text:"−sen(x)", correct:true},
        {text:"sen(x)", correct:false},
        {text:"cos(x)", correct:false},
        {text:"−cos(x)", correct:false},
      ],
      explanation:"La derivada del coseno lleva signo negativo: d/dx[cos x] = −sen x.",
      hints:["Esta es una de las tres fórmulas base: memorízala con cuidado en el signo."]
    },
    {
      id:"t-p2", type:"build",
      func:"f(x) = sen(3x)",
      prompt:"Arma f'(x).",
      tokensCorrect:["3", "cos(3x)"],
      tokensDistractors:["cos(3x)","sen(3x)","−3"],
      explanation:"d/dx[sen(u)] = cos(u)·u'. Aquí u=3x, u'=3, entonces f'(x) = cos(3x)·3 = 3cos(3x).",
      hints:["Deriva el seno como función externa: se vuelve coseno de lo mismo de adentro.","Multiplica por la derivada de 3x, que es 3."]
    },
    {
      id:"t-p3", type:"build",
      func:"f(x) = cos(x^2)",
      prompt:"Arma f'(x).",
      tokensCorrect:["−2x", "sen(x^2)"],
      tokensDistractors:["2x","−sen(x^2)","cos(x^2)"],
      explanation:"d/dx[cos(u)] = −sen(u)·u'. Aquí u=x^2, u'=2x: f'(x) = −sen(x^2)·2x = −2x·sen(x^2).",
      hints:["El coseno se deriva como −sen(adentro).","No olvides multiplicar por la derivada de x^2, que es 2x."]
    },
    {
      id:"t-p4", type:"mcq",
      context:["Afirmación: d/dx[tan x] = sec x"],
      prompt:"¿Es correcta esta afirmación?",
      options:[
        {text:"Sí", correct:false},
        {text:"No, falta elevarlo al cuadrado", correct:true},
      ],
      explanation:"La derivada correcta es sec²x, no sec x. Es una de las fórmulas que más se confunde.",
      hints:["Revisa la lista de las tres derivadas base de este bloque."]
    }
  ],
  exam:[
    {
      id:"t-e1", type:"mcq",
      func:"f(x) = sen(5x)",
      prompt:"¿Cuál es f'(x)?",
      options:[
        {text:"5cos(5x)", correct:true},
        {text:"cos(5x)", correct:false},
        {text:"−5cos(5x)", correct:false},
        {text:"5sen(5x)", correct:false},
      ],
      explanation:"cos(5x) · 5 = 5cos(5x)."
    },
    {
      id:"t-e2", type:"build",
      func:"f(x) = tan(x^2+1)",
      prompt:"Arma f'(x).",
      tokensCorrect:["2x", "sec^2(x^2+1)"],
      tokensDistractors:["sec(x^2+1)","2x^2","sec^2(x)"],
      explanation:"d/dx[tan(u)] = sec²(u)·u'. Aquí u'=2x: f'(x) = 2x·sec²(x^2+1)."
    },
    {
      id:"t-e3", type:"mcq",
      func:"f(x) = sen(x)",
      prompt:"¿Cuál es f'(x)?",
      options:[
        {text:"cos(x)", correct:true},
        {text:"−cos(x)", correct:false},
        {text:"sen(x)", correct:false},
        {text:"−sen(x)", correct:false},
      ],
      explanation:"d/dx[sen x] = cos x, sin signo negativo (a diferencia del coseno)."
    }
  ]
},

// ======================================================
// BLOQUE 5 — EXPONENCIALES Y LOGARÍTMICAS
// ======================================================
{
  id:"explog",
  title:"Exponenciales y logaritmos",
  summary:"Derivar e^x, a^x y ln(x), solos y combinados con la cadena.",
  lessons:[
    {
      title:"La exponencial (con peras y manzanas)",
      html:`
        <p>Imagina bacterias que se duplican: mientras más bacterias hay, más
        rápido crece la población, porque cada bacteria nueva también se
        puede duplicar. Eso es crecimiento exponencial:
        <strong>crece proporcional a lo que ya tiene</strong>.</p>
        <div class="analogy">Por eso <span class="math"><span class="tok-func">e</span><sup class="tok-exp">x</sup></span> es tan especial: es la única función donde "qué tan rápido cambia" es exactamente igual a ella misma.</div>
        <div class="rule-visual">
          <span class="side math"><span class="tok-func">e</span><sup class="tok-exp">x</sup></span>
          <span class="rule-arrow">→</span>
          <span class="side math"><span class="tok-func">e</span><sup class="tok-exp">x</sup></span>
        </div>
        <p>Si adentro del exponente hay algo más, usa engranajes otra vez:
        multiplica por la derivada de lo de adentro.</p>
      `
    },
    {
      title:"El logaritmo, la pregunta al revés",
      html:`
        <p>ln(x) responde una pregunta distinta: "¿a qué exponente tengo que
        elevar el número e para llegar a x?". Es la pregunta inversa de la
        exponencial.</p>
        <div class="rule-visual">
          <span class="side math"><span class="tok-func">ln</span>(<span class="tok-var">x</span>)</span>
          <span class="rule-arrow">→</span>
          <span class="side math"><span class="frac"><span class="num"><span class="tok-num">1</span></span><span class="den"><span class="tok-var">x</span></span></span></span>
        </div>
        <p>Si adentro hay algo más complicado, otra vez: derivada de
        adentro, sobre lo de adentro.</p>
        <div class="example"><span class="math"><span class="tok-func">ln</span>(<span class="tok-num">5</span><span class="tok-var">x</span>) <span class="tok-op">→</span> <span class="frac"><span class="num"><span class="tok-num">5</span></span><span class="den"><span class="tok-num">5</span><span class="tok-var">x</span></span></span> <span class="tok-op">=</span> <span class="frac"><span class="num"><span class="tok-num">1</span></span><span class="den"><span class="tok-var">x</span></span></span></span> (siempre revisa si se simplifica)</div>
      `
    }
  ],
  practice:[
    {
      id:"e-p1", type:"mcq",
      func:"f(x) = e^(2x)",
      prompt:"¿Cuál es f'(x)?",
      options:[
        {text:"2e^(2x)", correct:true},
        {text:"e^(2x)", correct:false},
        {text:"2xe^(2x)", correct:false},
        {text:"e^2", correct:false},
      ],
      explanation:"d/dx[e^u] = e^u · u'. Aquí u=2x, u'=2: f'(x) = e^(2x) · 2 = 2e^(2x).",
      hints:["e^u se queda igual, solo multiplicas por u'.","La derivada de 2x es 2."]
    },
    {
      id:"e-p2", type:"build",
      func:"f(x) = e^(x^2)",
      prompt:"Arma f'(x).",
      tokensCorrect:["2x", "e^(x^2)"],
      tokensDistractors:["x^2","e^(2x)","e^x"],
      explanation:"u=x^2, u'=2x: f'(x) = e^(x^2) · 2x = 2x·e^(x^2).",
      hints:["e^(x^2) se queda exactamente igual al derivarlo.","Multiplica por la derivada de x^2, que es 2x."]
    },
    {
      id:"e-p3", type:"mcq",
      func:"f(x) = ln(5x)",
      prompt:"¿Cuál es la forma simplificada de f'(x)?",
      options:[
        {text:"1/x", correct:true},
        {text:"5/x", correct:false},
        {text:"1/(5x)", correct:false},
        {text:"ln(5)/x", correct:false},
      ],
      explanation:"d/dx[ln(u)] = u'/u = 5/(5x). Simplificando (5 se cancela con 5), queda 1/x.",
      hints:["u=5x, u'=5. La fórmula es u'/u.","5/(5x) se simplifica: el 5 de arriba y el de abajo se cancelan."]
    },
    {
      id:"e-p4", type:"build",
      func:"f(x) = ln(x^2+1)",
      prompt:"Arma f'(x).",
      tokensCorrect:["2x", "/", "(x^2+1)"],
      tokensDistractors:["x^2+1","2x+1","1/x"],
      explanation:"u=x^2+1, u'=2x. d/dx[ln(u)] = u'/u = 2x/(x^2+1). Aquí ya no se simplifica más.",
      hints:["La fórmula es derivada de adentro, sobre lo de adentro.","u' = 2x, y u se queda igual en el denominador."]
    }
  ],
  exam:[
    {
      id:"e-e1", type:"mcq",
      func:"f(x) = e^(−x)",
      prompt:"¿Cuál es f'(x)?",
      options:[
        {text:"−e^(−x)", correct:true},
        {text:"e^(−x)", correct:false},
        {text:"−xe^(−x)", correct:false},
        {text:"e^x", correct:false},
      ],
      explanation:"u=−x, u'=−1: f'(x) = e^(−x)·(−1) = −e^(−x)."
    },
    {
      id:"e-e2", type:"build",
      func:"f(x) = ln(3x^2)",
      prompt:"Arma la forma SIMPLIFICADA de f'(x).",
      tokensCorrect:["2", "/", "x"],
      tokensDistractors:["6x","3x","1/x"],
      explanation:"u'=6x, u=3x^2. f'(x)=6x/(3x^2) = 2/x después de simplificar."
    },
    {
      id:"e-e3", type:"mcq",
      context:["Afirmación: d/dx[ln x] = x"],
      prompt:"¿Es correcta esta afirmación?",
      options:[
        {text:"Sí", correct:false},
        {text:"No, la derivada de ln x es 1/x", correct:true},
      ],
      explanation:"d/dx[ln x] = 1/x. Confundir esta fórmula es un error muy común en exámenes."
    }
  ]
},

// ======================================================
// BLOQUE 6 — IMPLÍCITAS Y DERIVADAS DE ORDEN SUPERIOR
// ======================================================
{
  id:"implicitas",
  title:"Implícitas y orden superior",
  summary:"Derivar cuando y no está despejada, y derivar más de una vez.",
  lessons:[
    {
      title:"Derivación implícita (con peras y manzanas)",
      html:`
        <p>A veces x y y están enredadas en la misma ecuación, sin que y esté
        despejada (como en x²+y²=25). Aun así, y sigue siendo "una función
        escondida" que depende de x — solo que no la ves escrita como
        y=algo.</p>
        <div class="analogy">Como y está "disfrazada" de función, cada vez
        que la derivas tienes que multiplicarla por su propia velocidad,
        dy/dx — igual que con los engranajes de la regla de la cadena.</div>
        <div class="example"><span class="math"><span class="tok-var">y</span><sup class="tok-exp">2</sup> <span class="tok-op">→</span> <span class="tok-num">2</span><span class="tok-var">y</span> <span class="tok-op">·</span> <span class="tok-var">dy/dx</span></span> (no simplemente 2y)</div>
        <p>Al final, despejas dy/dx como cualquier incógnita en una
        ecuación.</p>
      `
    },
    {
      title:"Derivadas de orden superior: la aceleración",
      html:`
        <p>Si derivas una vez, obtienes la velocidad de cambio. Si derivas
        ESA derivada otra vez, obtienes qué tan rápido cambia la velocidad
        — es decir, la aceleración.</p>
        <div class="analogy">Piensa en un carro: su posición te dice dónde
        está; la primera derivada (velocidad) te dice qué tan rápido se
        mueve; la segunda derivada (aceleración) te dice qué tan rápido está
        acelerando o frenando.</div>
        <div class="example">
          <span class="math"><span class="tok-var">f</span>(<span class="tok-var">x</span>)=<span class="tok-var">x</span><sup class="tok-exp">4</sup><span class="tok-op">−</span><span class="tok-num">3</span><span class="tok-var">x</span><sup class="tok-exp">2</sup></span><br>
          <span class="math"><span class="tok-var">f</span>'(<span class="tok-var">x</span>)=<span class="tok-num">4</span><span class="tok-var">x</span><sup class="tok-exp">3</sup><span class="tok-op">−</span><span class="tok-num">6</span><span class="tok-var">x</span></span> (velocidad)<br>
          <span class="math"><span class="tok-var">f</span>''(<span class="tok-var">x</span>)=<span class="tok-num">12</span><span class="tok-var">x</span><sup class="tok-exp">2</sup><span class="tok-op">−</span><span class="tok-num">6</span></span> (aceleración)
        </div>
      `
    }
  ],
  practice:[
    {
      id:"i-p1", type:"mcq",
      func:"x^2 + y^2 = 25",
      prompt:"Al derivar ambos lados respecto a x, ¿cómo se deriva el término y²?",
      options:[
        {text:"2y · dy/dx", correct:true},
        {text:"2y", correct:false},
        {text:"y^2", correct:false},
        {text:"2 · dy/dx", correct:false},
      ],
      explanation:"y es función de x, así que y² se deriva con la regla de la cadena: 2y · dy/dx. Olvidar el dy/dx es el error más común de este tema.",
      hints:["Trata a y como si fuera 'u' en la regla de la cadena.","Todo término con y, al derivarlo, se multiplica por dy/dx."]
    },
    {
      id:"i-p2", type:"build",
      func:"x^2 + y^2 = 25",
      context:["Derivando ambos lados: 2x + 2y·dy/dx = 0"],
      prompt:"Despeja dy/dx: arma la respuesta final.",
      tokensCorrect:["−x", "/", "y"],
      tokensDistractors:["x/y","−y/x","2x"],
      explanation:"2y·dy/dx = −2x → dy/dx = −2x/2y = −x/y.",
      hints:["Primero mueve 2x al otro lado de la ecuación.","Luego divide ambos lados entre 2y, y simplifica el 2."]
    },
    {
      id:"i-p3", type:"mcq",
      func:"f(x) = x^4 − 3x^2",
      context:["f'(x) = 4x^3 − 6x"],
      prompt:"¿Cuál es f''(x)?",
      options:[
        {text:"12x^2 − 6", correct:true},
        {text:"12x^2", correct:false},
        {text:"4x^2 − 6", correct:false},
        {text:"12x^3 − 6x", correct:false},
      ],
      explanation:"Derivas f'(x) otra vez con las mismas reglas: 4x^3→12x^2, y −6x→−6.",
      hints:["f''(x) es simplemente derivar f'(x) una vez más.","Aplica la regla de la potencia a cada término de f'(x)."]
    },
    {
      id:"i-p4", type:"mcq",
      func:"f(x) = x^3",
      context:["Afirmación: f''(x) = 3x^2"],
      prompt:"¿Es correcta esta afirmación?",
      options:[
        {text:"Sí", correct:false},
        {text:"No, eso es f'(x), no f''(x)", correct:true},
      ],
      explanation:"f'(x)=3x^2 es la primera derivada. f''(x) es derivar otra vez: f''(x) = 6x.",
      hints:["¿Cuántas veces se derivó f(x) para llegar a ese resultado?","Si 3x^2 ya es f'(x), falta derivar una vez más para obtener f''(x)."]
    }
  ],
  exam:[
    {
      id:"i-e1", type:"mcq",
      func:"x·y = 10",
      prompt:"Al derivar x·y con la regla del producto, ¿qué obtienes?",
      options:[
        {text:"x·dy/dx + y", correct:true},
        {text:"y·dy/dx", correct:false},
        {text:"x + y", correct:false},
        {text:"dy/dx", correct:false},
      ],
      explanation:"x·y es un producto de dos funciones de x: aplicas u'v+uv' con u=x (u'=1) y v=y (v'=dy/dx): 1·y + x·dy/dx."
    },
    {
      id:"i-e2", type:"build",
      func:"f(x) = 2x^5",
      prompt:"Arma f''(x).",
      tokensCorrect:["40", "x^3"],
      tokensDistractors:["10x^4","40x^4","20x^3"],
      explanation:"f'(x)=10x^4. Derivando otra vez: f''(x) = 40x^3."
    },
    {
      id:"i-e3", type:"mcq",
      context:["x·y = 10", "Un estudiante deriva ambos lados y llega a: x·dy/dx + y = 0"],
      prompt:"Para llegar ahí, del lado derecho tuvo que derivar la constante 10 y obtuvo 0. ¿Eso está bien?",
      options:[
        {text:"Sí, la derivada de una constante es 0", correct:true},
        {text:"No, debería ser 10", correct:false},
      ],
      explanation:"10 es una constante, así que su derivada es 0. Esa parte del estudiante está bien; el resto de la ecuación ya usa correctamente la regla del producto en x·y."
    }
  ]
}

];
