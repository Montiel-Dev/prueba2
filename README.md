# Versión fusionada (v6 + Constelación)

Esta versión junta dos proyectos que venían de la misma base:
- **prueba2 (v6)**: IA multi-proveedor del Escáner (Groq/Gemini/Mistral/OpenRouter/Anthropic), pase Pro firmado,
  cabeceras de seguridad (CSP), datos del recibo escapados, matemáticas bonitas en el Escáner, pruebas (`node --test`).
- **constelación**: pantalla principal con burbujas/nebulosas de racha, "Mi constelación" por bloque (estrellas = lecciones,
  práctica y examen), barra del curso, inicio de sesión local, y selección de institución **por asignatura**.

Todo el backend (`api/`, `lib/`, `tests/`, `vercel.json`) viene de prueba2; todo el frontend visual del mapa/constelación viene
de constelación. Las variables de entorno son las de la tabla de v6 (ver `.env.example`).

---

# v6 — qué cambió y cómo publicarla

**Variables en Vercel → Settings → Environment Variables (después, Redeploy):**

| Variable | Valor | Para qué |
|---|---|---|
| `GROQ_API_KEY` y/o `GEMINI_API_KEY` | tu key | La IA del Escáner (pon al menos una; mejor dos) |
| `PRO_SECRET` | texto largo aleatorio (≥ 16 caracteres) | "Sello" del pase Pro |
| `PRO_FREE_TEST` | `1` | SOLO pruebas: el pase se entrega gratis. Quítala para exigir pago verificado |
| `PRO_REQUIRED` | `1` | El Escáner exige Pro. Sin ella, el Escáner es gratis para todos |
| `DIAG_KEY` | texto ≥ 8 caracteres | Abre `/api/diagnostico-ia?clave=TU_DIAG_KEY` (sin ella está desactivado) |

**Arreglos de v6 sobre v5:** modelos de Groq vigentes (los anteriores fueron retirados), errores que dicen la causa real
(key inválida / modelo retirado / IA saturada / lenta), `/api/diagnostico-ia` protegido, límite de peticiones también en
`/api/pro-activar`, cabeceras de seguridad (CSP, X-Frame-Options…), datos del recibo escapados, el checkout espera el pase antes
de mostrar "Continuar", fotos PNG transparentes con fondo blanco y compresión más rápida, protección contra doble clic.

**Limitaciones conocidas (dilas en el hackatón):** el pase es compartible (no hay cuentas); el límite de peticiones es "mejor
esfuerzo" por instancia; un mismo pago aprobado puede canjearse más de una vez (no hay base de datos de pagos usados); y los
beneficios del Arcade Pro (vidas infinitas, mini-examen) siguen decidiéndose en el navegador. Con `PRO_FREE_TEST=1` el pago es
decorativo. Pruebas: `node --test` (22 pruebas).

---

# Derivadas Dojo

Una app tipo "Duolingo de derivadas" para practicar cálculo diferencial
aprendiendo **haciendo**: pasos guiados, construcción de respuestas con
fichas, y explicación completa cada vez que te equivocas.

Todo tu progreso se guarda en tu propio navegador. Para estudiar no necesitas
servidor ni instalar nada (excepto, opcionalmente, la extensión Live Server de VS Code).
Solo el pago en modo `"mercadopago"` necesita servidor (Vercel); el checkout simulado propio
(modo `"local"`, el predeterminado) funciona sin él.

## Cómo ejecutarla

**Opción más simple:** doble clic en `index.html`. Se abre en tu navegador
y ya funciona.

**Opción recomendada en VS Code:**
1. Abre esta carpeta en VS Code (`Archivo → Abrir carpeta…`).
2. Instala la extensión **Live Server** (de Ritwick Dey) desde el panel de
   extensiones, si no la tienes.
3. Clic derecho sobre `index.html` → **"Open with Live Server"**.
4. Se abre en tu navegador y se recarga sola cada vez que edites un archivo.

## Qué incluye

- **6 bloques**, en el orden típico de un curso de cálculo diferencial:
  1. Fundamentos y regla de la potencia
  2. Producto y cociente
  3. Regla de la cadena
  4. Trigonométricas
  5. Exponenciales y logarítmicas
  6. Implícitas y derivadas de orden superior

  Tú eliges en qué bloque entrar y en qué orden — puedes saltar directo al
  tema que estés viendo en tu clase.

- **Lecciones cortas** con la teoría y ejemplos antes de cada bloque.

- **Práctica guiada**: ejercicios de dos tipos —
  - *Opción múltiple paso a paso*: "¿cuál es el siguiente paso?", o evaluar
    si un paso ya resuelto es correcto o no (verdadero/falso razonado).
  - *Construcción con fichas*: arrastras (o tocas) piezas para armar tú
    mismo la derivada, con fichas distractoras de errores comunes
    mezcladas.

  Cada ejercicio tiene **pistas progresivas** (botón "Pista") y, al
  responder, una **explicación completa** de por qué la respuesta es
  correcta o dónde estuvo el error — nunca solo "incorrecto".

- **Mini-examen por bloque**: mismos tipos de ejercicio pero sin pistas,
  para medir si ya lo dominas solo. Guarda tu mejor porcentaje.

- **Repaso de errores**: todo lo que fallas en la práctica se guarda en una
  cola de repaso (visible en la barra lateral). Puedes repasar solo esos
  ejercicios hasta dominarlos; al acertar, salen de la cola.

- **Progreso persistente**: puntos, racha de días, porcentajes por sección y
  cola de repaso se guardan en `localStorage` de tu navegador, así que
  siguen ahí la próxima vez que abras la app (en el mismo navegador y
  computadora).

## Cómo agregar más ejercicios o temas

Todo el contenido vive en **`js/data.js`**, dentro del arreglo `BLOCKS`.
No necesitas tocar ningún otro archivo para agregar preguntas.

Cada ejercicio es un objeto con uno de estos dos formatos:

```js
// Opción múltiple (también sirve para verdadero/falso de un paso)
{
  id:"mi-id-unico", type:"mcq",
  func:"f(x) = x^3",                 // opcional: la función en pantalla
  context:["dato adicional opcional"], // opcional: pasos ya dados
  prompt:"¿Cuál es el siguiente paso?",
  options:[
    {text:"3x^2", correct:true},
    {text:"x^2", correct:false},
  ],
  explanation:"Por qué es correcta/incorrecta la respuesta.",
  hints:["pista 1","pista 2"]         // opcional
}

// Construcción con fichas (drag & drop)
{
  id:"mi-id-unico-2", type:"build",
  func:"f(x) = 4x^3",
  prompt:"Arrastra las fichas en orden para construir f'(x).",
  tokensCorrect:["12", "x^2"],        // en el orden correcto
  tokensDistractors:["4","x^3","3"],  // fichas de más, para confundir
  explanation:"Explicación del resultado.",
  hints:["pista 1"]
}
```

Agrega objetos nuevos dentro de `practice: [...]` (con pistas) o
`exam: [...]` (sin pistas) de cualquier bloque, o crea un bloque nuevo
copiando la estructura completa de uno existente.

## Estructura del proyecto

```
derivadas-dojo/
├─ index.html           estructura de la página (abre en el mapa de materias)
├─ css/styles.css       diseño de la app y del curso
├─ css/map.css          estilo espacial del mapa de burbujas
├─ css/arcade.css       estilo de las páginas del Arcade y del checkout
├─ js/data.js           banco de lecciones y ejercicios (edita aquí)
├─ js/guided.js         problemas guiados paso a paso + fórmulas (edita aquí)
├─ js/engine.js         progreso, puntos, racha, cola de repaso y porcentajes
├─ js/math.js           fórmulas: fracciones apiladas, raíces, colores
├─ js/dragdrop.js       constructor de fichas (arrastrar / tocar)
├─ js/subjects.js       materias del mapa, requisitos y relaciones (edita aquí)
├─ js/map.js            pantalla de inicio: mapa de burbujas, zoom y recuadro
├─ js/anim.js           animaciones paso a paso del desarrollo (edita ANIM_LESSONS)
├─ js/plans.js          planes de estudio por institución (edita aquí)
├─ js/pay.js            Dojo Pro: pago simulado (checkout propio o Mercado Pago)
├─ js/arcade-core.js    núcleo del Arcade: estado, vidas, generador, candado Pro
├─ js/ui.js             pantallas e interacción del curso
├─ js/main.js           arranque de la app
├─ arcade.html          hub del Arcade
├─ vidas.html           Modo Vidas (ejercicios al azar)
├─ examen.html          Mini-examen cronometrado (Pro)
├─ checkout.html        checkout simulado
├─ camara.html          Escáner de problemas: foto -> variantes con IA (gratis por ahora)
├─ js/camara.js         captura/compresión de la foto, llamada a /api/variantes y sus pantallas
├─ api/                 funciones de servidor (Vercel): crear/verificar pago y generar variantes
├─ lib/mp.js            helpers de Mercado Pago + candado de "solo cuentas de prueba"
├─ lib/ai.js            capa de IA multi-proveedor (Escáner de problemas)
├─ vercel.json          configuración de publicación
└─ favicon.svg
```

## Cómo encaja todo

1. La app **abre en el mapa de materias** (burbujas tipo planetas). Arriba a la derecha hay un acceso al **Arcade**
   y, si ya pagaste, la insignia **PRO**.
2. La primera vez pregunta tu **institución** (plan de estudios) encima del mapa.
3. Al entrar a **Cálculo diferencial** ves el curso: unidades de tu plan, porcentajes por bloque, animaciones paso a paso,
   la tarjeta del Arcade y la de **Dojo Pro**.
4. El **Arcade** (Modo Vidas gratis; Pro = vidas infinitas + Mini-examen) y el **pago simulado** comparten el mismo
   `Pay.isPro()`: al pagar se desbloquea todo en todas las pantallas.

## Publicar en Vercel (gratis)

Es un sitio estático (sin build). La carpeta `api/` solo se usa en el modo de pago `"mercadopago"`.

1. Sube esta carpeta a un repositorio de GitHub.
2. En vercel.com → **Add New → Project** → importa el repo. No cambies nada
   (Framework Preset: *Other*, sin Build Command, sin Output Directory).
3. **Deploy**. En 20 segundos tienes una URL `.vercel.app`.
4. Para tu dominio: **Settings → Domains → Add**, escríbelo y copia los DNS
   que Vercel te indica en el panel de tu registrador.

Con la CLI: `npm i -g vercel` y luego `vercel --prod` dentro de la carpeta.

## Problemas guiados (nuevo)

`js/guided.js` define el tipo `guided`: un problema con varios pasos (identificar
u y v → derivar → sustituir → simplificar). Cada paso es opción múltiple (`S`) o
fichas (`T`); si fallas un paso, explica por qué y te deja reintentar. Un problema
cuenta como dominado solo si sale sin errores; si no, pasa a la cola de repaso.

- Cada bloque tiene una **hoja de fórmulas** (`formulas`), visible en práctica **y examen**.
- El **mini-examen** es 100 % guiado, sin pistas pero con fórmulas.
- Cada bloque tiene una lección extra de **ejemplo resuelto**.
- Los ejercicios antiguos de un solo paso quedan al final de la práctica como refuerzo.

## Pantalla de inicio: mapa de materias (nuevo)

La app abre en un mapa: una burbuja central (Matemáticas) y 5 ramas
(Cálculo diferencial, Cálculo integral, Geometría, Trigonometría, Álgebra).

- **Primer clic** en una burbuja: zoom + recuadro translúcido con sus requisitos.
  Al abrir una rama, las demás se colorean según qué tan relacionadas están
  (verde = muy, azul = relacionada, gris = poco) y aparecen materias extra.
- **Segundo clic** en la misma burbuja (o botón "Entrar al curso"): abre el curso.
- **Esc**, clic en el fondo o la × vuelven a la vista general.
- El anillo de cada burbuja es el % completado (hoy solo Cálculo diferencial
  tiene progreso real; el resto marca 0 % y "Próximamente").
- En la barra lateral del curso, "← Mapa de materias" regresa al mapa.

Para activar un curso nuevo: en `js/subjects.js` pon `available:true`, calcula su
progreso en `subjectPct()` y conéctalo en `MapScreen.openCourse()` (`js/map.js`).

## Porcentajes y animaciones (nuevo)

- **Sin estrellas.** Cada bloque muestra el % de tres secciones: Lecciones (vistas), Práctica
  (ejercicios dominados) y Mini-examen (mejor resultado). Bloque = 20 % lecciones + 40 % práctica
  + 40 % examen; el % total de la materia es el promedio de los bloques (`Engine.overallPercent()`;
  los pesos están en `Engine.WEIGHTS`).
- **Animación del desarrollo** (`js/anim.js`): botón "Ver animado" en las lecciones de *Ejemplo resuelto*
  y, en cada problema guiado, "Ver un ejemplo parecido, animado": un caso extra con otros números y la misma técnica (`ANIM_EXTRA`); la expresión se transforma en su sitio y los términos se mueven, cambian de signo o se tachan. Reproducir/pausa, anterior/siguiente
  y velocidad; muestra cada paso sin saltarse ninguno.

## Dojo Pro — pago simulado con Mercado Pago

Checkout Pro real de Mercado Pago, pero 100 % de prueba: no se mueve dinero.
Esta parte **sí necesita servidor**, así que funciona en Vercel o con `vercel dev`
(no abriendo `index.html` con doble clic).

### Configuración (una sola vez)

1. Entra a Mercado Pago Developers → **Tus integraciones** → crea una aplicación
   (Checkout Pro).
2. En esa aplicación → **Cuentas de prueba** → crea **dos** cuentas del mismo país
   (México): un **Vendedor** y un **Comprador**.
3. Entra (ventana de incógnito) a Mercado Pago con el usuario **Vendedor** de prueba,
   crea una aplicación ahí y copia su **Access Token** (credenciales de producción
   *de esa cuenta de prueba*).
4. Pégalo como variable de entorno `MP_ACCESS_TOKEN`:
   - Local: copia `.env.example` a `.env.local` y pégalo ahí; corre `vercel dev`.
   - Vercel: Settings → Environment Variables → `MP_ACCESS_TOKEN`.
5. (Opcional) `PUBLIC_URL` con la URL pública del sitio.

### Cómo probar

1. Pulsa **Pagar $49 MXN con Mercado Pago** en la pantalla principal.
2. En el checkout inicia sesión como el usuario **Comprador** de prueba (incógnito),
   o paga con tarjeta de prueba, por ejemplo Mastercard `5474 9254 3267 0366`,
   CVV `123`, vence `11/30`, titular **APRO** (aprobado), documento `123456789`.
   Titular `OTHE` = rechazado, `CONT` = pendiente.
3. Al volver, el servidor verifica el pago con Mercado Pago y aparece tu insignia **PRO**.

### Seguridad

- El token vive solo en el servidor (`api/` + variables de entorno), nunca en el navegador.
- `lib/mp.js` consulta `/users/me` y **se niega a operar** si el token no es de un usuario
  de prueba.
- El estado "Pro" se guarda en `localStorage` (como todo el progreso), así que es una demo,
  no una protección real contra alguien que edite su navegador.


## Arcade (Modo Vidas gratis · Pro = vidas infinitas + Mini-examen)

Funciona **sin servidor ni cuentas**: abre `index.html` (o usa Live Server) y listo.

| Archivo | Qué es |
|---|---|
| `arcade.html` | Hub. Sin pagar muestra los 2 módulos bloqueados 🔒 y el botón de pago. Pagado, los desbloquea. |
| `vidas.html` | **Modo Vidas**: ejercicios ilimitados al azar (14 tipos, 3 niveles que suben con tu racha), 5 vidas estilo Duolingo, 1 se recupera cada 5 min o se compra con 40 ◆. |
| `examen.html` | **Mini-examen** cronometrado: modos Rápido (5/5 min), Estándar (10/10), Largo (20/22). Sin feedback hasta entregar, marcar preguntas, confirmación al entregar, auto-entrega al acabar el tiempo, reanuda si recargas, nota + estrellas + corrección. |
| `checkout.html` | **Checkout simulado**: tarjeta con vista previa en vivo, validación (Luhn, vencimiento, CVV, correo), pasos de procesamiento, comprobante y confeti. |
| `js/arcade-core.js` | Estado, vidas, generador de ejercicios y candado Pro compartidos. |

**Gratis:** Modo Vidas con 5 vidas (se recuperan solas o con puntos). **Pro (pago simulado):** vidas infinitas y acceso al Mini-examen.
`examen.html` redirige al hub si no hay Pro; `vidas.html` es libre.

### Probar el pago

El resultado depende del **titular**, igual que las tarjetas de prueba de Mercado Pago
(también hay botones que rellenan todo solos):

| Titular | Resultado |
|---|---|
| `APRO` (o cualquier otro nombre) | Aprobado → desbloquea Vidas y Examen |
| `OTHE` | Rechazado |
| `FUND` | Fondos insuficientes |
| `SECU` / `EXPI` | CVV inválido / tarjeta vencida |
| `CONT` | Pendiente → botón "Simular aprobación del banco" |

Tarjeta de prueba: `5474 9254 3267 0366`, vence `11/30`, CVV `123`.
Nunca se guarda el número completo ni el CVV (solo marca y últimos 4 dígitos).

### Configuración

- `js/arcade-core.js` → `CFG`: `LIFE_MAX`, `REGEN_MS` (pon `20000` para probar rápido), `REFILL_COST`, `MODES`.
- `js/pay.js` → `MODE: "local"` (checkout simulado propio, por defecto) o `"mercadopago"`
  (Checkout Pro real en modo prueba; necesita Vercel + `MP_ACCESS_TOKEN`, ver sección de arriba).
- Para reiniciar y volver a probar el pago: en la consola del navegador
  `localStorage.removeItem("derivadas-dojo-pro-v1")`.
- Agregar un tipo de ejercicio: añade `{level, name, fn(){ return {q, ok, bad:[3 errores], why} }}` a `GENS`.

## Escáner de problemas (cámara + IA) — v3 multi-proveedor

`camara.html` (tarjeta "📷 Escáner de problemas" en la pantalla principal). El alumno toma o sube una foto
(o **escribe el problema a mano**) y la app genera variantes del mismo tema y dificultad, con solución paso a paso.

### Cómo funciona ahora (y por qué ya no se cuelga)

El error `504 en 30 s → 504 en 25 s` pasaba porque todo dependía de **una sola llamada pesada a Gemini**
(leer foto + inventar variantes + escribir soluciones) y el "respaldo" era otro modelo **del mismo proveedor**.
Ahora son **dos pasos pequeños** y **varios proveedores**:

1. `api/leer.js` — foto → **texto** del problema (salida cortísima, es el único paso con visión).
2. El alumno ve el texto en una caja y lo **puede corregir** (exponentes, signos…).
3. `api/variantes.js` — texto → N variantes (**sin imagen**, mucho más rápido).

Cada paso se ejecuta con **carrera escalonada entre proveedores** (`lib/ai.js`): se lanza el primero; si no contesta
en 9 s o falla, se lanza el siguiente **sin cancelar al primero**; gana el primero que devuelva un JSON válido.
Proveedores soportados (solo se usan los que tengan API key): **Groq** (gratis, muy rápido, visión), **Gemini**,
**Mistral**, **OpenRouter** y **Anthropic (Claude)**.
Si la foto no se puede leer con ninguno, la app **no se bloquea**: deja escribir el problema y sigue.

### Configuración

1. Consigue al menos una key (mejor 2: si una está lenta o en límite, usa la otra):
   - **Groq** (recomendada, gratis sin tarjeta): console.groq.com/keys → `GROQ_API_KEY`
   - **Gemini** (gratis): aistudio.google.com/apikey → `GEMINI_API_KEY`
   - Opcionales: `MISTRAL_API_KEY`, `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY` (la mejor para letra manuscrita, de pago).
2. Local: cópialas en `.env.local` (ver `.env.example`) y corre `vercel dev`.
   Vercel: Settings → Environment Variables, y después **Redeploy**.
3. Abre `https://TU-SITIO.vercel.app/api/diagnostico-ia`: prueba cada proveedor con texto y con imagen y muestra
   cuánto tarda y si funciona. Los nombres de modelo se pueden cambiar con variables (`GROQ_VISION_MODEL`, etc.)
   si Google/Groq retiran alguno ("modelo no encontrado").

Necesita servidor (Vercel o `vercel dev`); no funciona abriendo `index.html` con doble clic.
Sigue siendo **gratis para todos a propósito**; `api/variantes.js` trae la nota de dónde validar el pago si se vuelve Pro.

### Archivos

| Archivo | Qué es |
|---|---|
| `camara.html` / `js/camara.js` | Pantallas: foto → lectura → texto editable → variantes. Respaldo por texto si falla la visión. |
| `api/leer.js` | Foto → texto del problema (visión). |
| `api/variantes.js` | Texto → variantes con solución (sin imagen). |
| `api/diagnostico-ia.js` | Mide cada proveedor configurado. |
| `lib/ai.js` | Adaptadores (Groq/Gemini/Mistral/OpenRouter/Anthropic), carrera escalonada y JSON tolerante. |

## Planes de estudio por institución

Al abrir la app por primera vez pregunta la institución (COBAEM, DGETI, TecNM, UAEM u "Otra / explorar") y,
si hace falta, el estado y el nivel. Con eso reordena el menú en las **unidades de tu plan**, en su orden oficial.
Se puede cambiar después desde "Cambiar institución" en la pantalla principal. La elección vive en `localStorage` (`dojo-plan-v1`).

Todo está en `js/plans.js`; los bloques de `data.js` no se tocaron:

- `PLANS`: cada plan es una lista de unidades `{title, topics, blocks}`. `blocks` apunta a bloques existentes;
  si está vacío, la unidad se muestra con sus temas y la etiqueta **pronto**. `extra:true` marca refuerzo fuera del programa.
- `INSTITUTIONS`: preguntas de seguimiento y qué plan resuelve cada combinación (`verified:false` muestra el aviso de "programa base").

| Plan | Fuente | Estado |
|---|---|---|
| `tecnm` | Temario Cálculo Diferencial TecNM (ISIC-2010-224) | Verificado |
| `mccems` | Progresiones de Pensamiento Matemático III, MCCEMS 2023 (SEP) | Programa nacional; usado por COBAEM, DGETI y UAEM bachillerato |

Pendiente: cargar el programa específico de cada COBAEM (Edomex/Morelos) y de la UAEM; basta con añadir un plan en `PLANS`
y apuntarlo en `resolve()` de la institución. Para dar contenido a una unidad "pronto", crea el bloque en `data.js` y pon su id en `blocks`.
