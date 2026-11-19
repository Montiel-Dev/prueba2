/* =========================================================
   Derivadas Dojo — materias del mapa de inicio
   Cada materia es una burbuja. Las "ramas" son las 5 burbujas
   principales alrededor de Matemáticas; los "extras" aparecen
   en el anillo exterior al abrir una rama.

   Para habilitar un curso nuevo:
   1) pon available:true en la materia,
   2) agrega su caso en subjectPct() (progreso real) y en
      MapScreen.openCourse() (js/map.js) para que abra su contenido.
   Requisitos con "min": son BLOQUEANTES. La materia no se puede abrir
   hasta que la materia requisito alcance ese % de avance
   (ej. Cálculo integral exige Cálculo diferencial al 100%; Trigonometría
   exige Geometría al 50%). Los requisitos sin "min" son solo
   recomendados (por eso Cálculo diferencial, el único curso con
   contenido hoy, siempre se puede abrir).
   rel: qué tan relacionada está cada rama con ésta
        (a = muy, m = relacionada, b = poco).
   ========================================================= */

const SUBJECTS = {
  // ---------- ramas ----------
  calc:{
    id:"calc", label:"Cálculo diferencial", kind:"branch", ang:-90, available:true,
    desc:"Derivadas paso a paso: regla de la potencia, producto y cociente, cadena, trigonométricas, exponenciales e implícitas.",
    requisites:[
      {id:"alg",  text:"Factorizar y manejar exponentes"},
      {id:"trig", text:"Razones trigonométricas básicas"},
      {title:"Funciones", text:"Evaluar y graficar funciones sencillas"}
    ],
    rel:{int:"a", alg:"a", trig:"m", geo:"b"},
    extras:[["gan","m"],["fis","b"]]
  },
  int:{
    id:"int", label:"Cálculo integral", kind:"branch", ang:-18, available:false,
    desc:"Integrales y áreas bajo la curva: el camino inverso a la derivada.",
    requisites:[
      {id:"calc", min:100, text:"Reglas de derivación"},
      {id:"alg",  min:50, text:"Manipular expresiones algebraicas"},
      {id:"trig", min:50, text:"Identidades trigonométricas básicas"}
    ],
    rel:{calc:"a", alg:"m", trig:"m", geo:"b"},
    extras:[["ser","m"],["fis","b"]]
  },
  geo:{
    id:"geo", label:"Geometría", kind:"branch", ang:54, available:false,
    desc:"Figuras, ángulos, áreas y volúmenes.",
    requisites:[
      {id:"ari", min:50, text:"Operaciones y proporciones"},
      {id:"alg", min:50, text:"Despejar ecuaciones simples"}
    ],
    rel:{trig:"a", alg:"m", calc:"b", int:"b"},
    extras:[["gan","a"],["fis","b"]]
  },
  trig:{
    id:"trig", label:"Trigonometría", kind:"branch", ang:126, available:false,
    desc:"Razones trigonométricas, identidades y el círculo unitario.",
    requisites:[
      {id:"geo", min:50, text:"Triángulos y ángulos"},
      {id:"alg", min:50, text:"Resolver ecuaciones simples"}
    ],
    rel:{geo:"a", calc:"m", alg:"m", int:"m"},
    extras:[["gan","m"],["fis","b"]]
  },
  alg:{
    id:"alg", label:"Álgebra", kind:"branch", ang:198, available:false,
    desc:"Expresiones, ecuaciones y factorización, practicando con ejercicios guiados.",
    requisites:[
      {id:"ari", min:50, text:"Fracciones, potencias y signos"}
    ],
    rel:{calc:"a", trig:"m", geo:"m", int:"m"},
    extras:[["ari","a","mid"],["alin","m"],["est","b"]]   // "mid": Aritmética va sobre la línea Matemáticas–Álgebra
  },

  // ---------- extras (anillo exterior) ----------
  ari:{
    id:"ari", label:"Aritmética", kind:"extra", available:false,
    desc:"Operaciones básicas, fracciones y proporciones.",
    requisites:[]
  },
  alin:{
    id:"alin", label:"Álgebra lineal", kind:"extra", available:false,
    desc:"Vectores, matrices y sistemas de ecuaciones.",
    requisites:[
      {id:"alg", min:50, text:"Sistemas de ecuaciones"},
      {id:"gan", min:50, text:"Vectores en el plano"}
    ]
  },
  est:{
    id:"est", label:"Estadística", kind:"extra", available:false,
    desc:"Datos, promedios y probabilidad.",
    requisites:[
      {id:"ari", min:50, text:"Porcentajes y proporciones"},
      {id:"alg", min:50, text:"Despejar y evaluar fórmulas"}
    ]
  },
  gan:{
    id:"gan", label:"Geometría analítica", kind:"extra", available:false,
    desc:"Rectas, cónicas y geometría con coordenadas.",
    requisites:[
      {id:"alg", min:50, text:"Ecuaciones de primer y segundo grado"},
      {id:"geo", min:50, text:"Figuras y distancias"}
    ]
  },
  ser:{
    id:"ser", label:"Series", kind:"extra", available:false,
    desc:"Sucesiones, series y convergencia.",
    requisites:[
      {id:"calc", min:100, text:"Límites y derivadas"},
      {id:"alg",  min:50, text:"Sumas y patrones algebraicos"}
    ]
  },
  fis:{
    id:"fis", label:"Física", kind:"extra", available:false,
    desc:"Movimiento, fuerzas y energía.",
    requisites:[
      {id:"alg",  min:50, text:"Despejar variables"},
      {id:"trig", min:50, text:"Descomponer vectores"}
    ]
  }
};

const BRANCH_IDS = ["calc","int","geo","trig","alg"];

// Texto de cada nivel de relación
const REL_LEVELS = {
  a:{ label:"Muy relacionada",  size:112 },
  m:{ label:"Relacionada",      size:104 },
  b:{ label:"Poco relacionada", size:96  }
};

// Progreso real (0-100). Hoy solo Cálculo diferencial tiene contenido.
function subjectPct(id){
  if(id === "calc" && typeof Engine !== "undefined" && Engine.state) return Engine.overallPercent();
  return 0;
}

// % de Matemáticas (burbuja central) = promedio del % de cada burbuja que la orbita
function totalPct(){
  return Math.round(BRANCH_IDS.reduce((n,id)=> n + subjectPct(id), 0) / BRANCH_IDS.length);
}


// ---------- Desbloqueo por requisitos ----------
// Requisitos bloqueantes que aún no se cumplen: [{id,label,min,pct}]
function missingReqs(id){
  const s = SUBJECTS[id];
  if(!s) return [];
  return s.requisites
    .filter(r => r.id && r.min)
    .map(r => ({ id:r.id, label:SUBJECTS[r.id].label, min:r.min, pct:subjectPct(r.id) }))
    .filter(r => r.pct < r.min);
}
function isUnlocked(id){ return missingReqs(id).length === 0; }
