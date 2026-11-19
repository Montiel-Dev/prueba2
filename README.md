# Derivadas Dojo

Una app tipo "Duolingo de derivadas" para practicar cálculo diferencial
aprendiendo **haciendo**: pasos guiados, construcción de respuestas con
fichas, y explicación completa cada vez que te equivocas.

No necesita internet, servidor, ni instalar nada (excepto, opcionalmente,
la extensión Live Server de VS Code). Todo tu progreso se guarda en tu
propio navegador.

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
  para medir si ya lo dominas solo. Te da 0 a 3 estrellas según tu
  porcentaje de aciertos.

- **Repaso de errores**: todo lo que fallas en la práctica se guarda en una
  cola de repaso (visible en la barra lateral). Puedes repasar solo esos
  ejercicios hasta dominarlos; al acertar, salen de la cola.

- **Progreso persistente**: puntos, racha de días, estrellas por bloque y
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
├─ index.html          estructura de la página
├─ css/styles.css       todo el diseño visual
├─ js/data.js            banco de lecciones y ejercicios (edita aquí)
├─ js/guided.js          problemas guiados paso a paso + fórmulas (edita aquí)
├─ js/engine.js          progreso, puntos, racha, cola de repaso
├─ js/math.js            fórmulas: fracciones apiladas, raíces, colores
├─ js/dragdrop.js        constructor de fichas (arrastrar / tocar)
├─ js/ui.js              pantallas e interacción
└─ js/main.js            arranque de la app
├─ arcade.html           Arcade: práctica infinita con vidas + examen cronometrado
├─ js/pay.js             Dojo Pro: botón y retorno del pago simulado
├─ api/                  funciones de servidor (Vercel): crear y verificar pago
├─ lib/mp.js             helpers de Mercado Pago + candado de "solo cuentas de prueba"
├─ vercel.json          configuración de publicación
└─ favicon.svg
```

## Publicar en Vercel (gratis)

Es un sitio estático: no hay build ni servidor.

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
