/* =========================================================
   ASTRO-matiks — nebulosas de la racha
   La nebulosa que flota en el mapa cambia según los días
   seguidos de estudio. Son dibujos propios (SVG), inspirados
   en cada objeto, no fotografías.
   ========================================================= */

const Nebulae = {
  // [días mínimos, clave, nombre]
  TIERS:[
    [1,   "pilares",  "Pilares de la Creación"],
    [3,   "ojo",      "Ojo de Dios"],
    [7,   "orion",    "Nebulosa de Orión"],
    [14,  "helice",   "Nebulosa de la Hélice"],
    [30,  "ngc6302",  "NGC 6302"],
    [60,  "mariposa", "Mariposa"],
    [100, "reloj",    "Reloj de Arena"]
  ],

  forDays(n){
    let t = this.TIERS[0];
    this.TIERS.forEach(x => { if(n >= x[0]) t = x; });
    const i = this.TIERS.indexOf(t), next = this.TIERS[i + 1];
    return { key:t[1], name:t[2], next: next ? { days:next[0], name:next[2] } : null };
  },

  _stars(seed, n){
    let s = seed;
    const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    let out = "";
    for(let i = 0; i < n; i++){
      out += `<circle cx="${(10 + r()*180).toFixed(1)}" cy="${(10 + r()*180).toFixed(1)}" r="${(0.6 + r()*1.1).toFixed(2)}" fill="#fff" opacity="${(0.4 + r()*0.6).toFixed(2)}"/>`;
    }
    return out;
  },

  // Filtro de "gas": ruido que deforma los bordes
  _gas(id, freq, scale, blur){
    return `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="4" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="${blur}"/></filter>`;
  },

  svg(key){
    const body = (this.art[key] || this.art.pilares).call(this);
    return `<svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" focusable="false">${body}</svg>`;
  },

  art:{
    // Columnas de gas con las puntas encendidas
    pilares(){
      return `<defs>
        <radialGradient id="pHaze" cx="50%" cy="38%" r="60%"><stop offset="0" stop-color="#3FE0C0" stop-opacity=".6"/><stop offset=".6" stop-color="#2A6BD0" stop-opacity=".25"/><stop offset="1" stop-color="#2A6BD0" stop-opacity="0"/></radialGradient>
        <linearGradient id="pCol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC46B"/><stop offset=".35" stop-color="#C7692E"/><stop offset="1" stop-color="#2B1A22"/></linearGradient>
        <radialGradient id="pTip"><stop offset="0" stop-color="#FFF3C8"/><stop offset="1" stop-color="#FFB04A" stop-opacity="0"/></radialGradient>
        ${this._gas("pF", 0.035, 9, 0.9)}${this._gas("pH", 0.02, 18, 6)}
      </defs>
      <circle cx="100" cy="92" r="92" fill="url(#pHaze)" filter="url(#pH)"/>
      ${this._stars(5, 16)}
      <g filter="url(#pF)" fill="url(#pCol)">
        <path d="M50 192 L52 118 C52 100 58 88 66 74 C70 66 76 67 78 76 C82 92 86 106 86 122 L92 192Z"/>
        <path d="M88 192 L92 90 C92 68 100 48 108 32 C111 26 116 27 117 35 C120 54 128 78 128 102 L136 192Z"/>
        <path d="M134 192 L138 132 C138 120 144 110 150 100 C153 95 157 97 158 103 C160 114 166 124 166 136 L172 192Z"/>
      </g>
      <circle cx="110" cy="38" r="15" fill="url(#pTip)"/><circle cx="68" cy="80" r="11" fill="url(#pTip)"/><circle cx="152" cy="106" r="10" fill="url(#pTip)"/>`;
    },

    // Anillos concéntricos: pupila azul, iris dorado, párpado rojo
    ojo(){
      return `<defs>
        <radialGradient id="oG"><stop offset="0" stop-color="#fff"/><stop offset=".05" stop-color="#BFEFFF"/><stop offset=".12" stop-color="#3B7BFF" stop-opacity=".95"/>
          <stop offset=".34" stop-color="#2FD0FF" stop-opacity=".7"/><stop offset=".5" stop-color="#58D6B0" stop-opacity=".45"/>
          <stop offset=".6" stop-color="#FFD24A" stop-opacity=".9"/><stop offset=".76" stop-color="#FF7A2A" stop-opacity=".85"/>
          <stop offset=".9" stop-color="#E02A4A" stop-opacity=".45"/><stop offset="1" stop-color="#E02A4A" stop-opacity="0"/></radialGradient>
        ${this._gas("oF", 0.03, 8, 1.2)}
      </defs>
      ${this._stars(9, 14)}
      <g filter="url(#oF)"><circle cx="100" cy="100" r="88" fill="url(#oG)"/></g>
      <circle cx="100" cy="100" r="9" fill="#0B1030" opacity=".55"/><circle cx="100" cy="100" r="3.2" fill="#fff"/>`;
    },

    // Nube rosada con la lámina oscura y las cuatro estrellas del centro
    orion(){
      return `<defs>
        <radialGradient id="rC"><stop offset="0" stop-color="#FFF6D8"/><stop offset=".3" stop-color="#FFB25A" stop-opacity=".9"/><stop offset="1" stop-color="#FF5FA8" stop-opacity="0"/></radialGradient>
        ${this._gas("rF", 0.025, 22, 3)}${this._gas("rD", 0.04, 10, 1)}
      </defs>
      ${this._stars(13, 12)}
      <g filter="url(#rF)">
        <ellipse cx="62" cy="96" rx="52" ry="34" fill="#6E7BFF" opacity=".6" transform="rotate(-22 62 96)"/>
        <ellipse cx="140" cy="92" rx="56" ry="30" fill="#FF5FA8" opacity=".7" transform="rotate(18 140 92)"/>
        <ellipse cx="100" cy="128" rx="60" ry="30" fill="#C23A9A" opacity=".55"/>
        <ellipse cx="100" cy="82" rx="42" ry="26" fill="#FF8A5A" opacity=".7"/>
        <circle cx="100" cy="98" r="42" fill="url(#rC)"/>
      </g>
      <path d="M40 120 C70 110 82 126 104 112 C126 98 150 112 170 100" stroke="#1A0B25" stroke-width="9" fill="none" stroke-linecap="round" opacity=".75" filter="url(#rD)"/>
      <g fill="#fff"><circle cx="97" cy="96" r="2.8"/><circle cx="104" cy="99" r="2.3"/><circle cx="100" cy="104" r="2"/><circle cx="95" cy="103" r="1.7"/></g>`;
    },

    // Dos anillos cruzados que forman la espiral
    helice(){
      return `<defs>
        <linearGradient id="hA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF4FB8"/><stop offset=".5" stop-color="#FFB05A"/><stop offset="1" stop-color="#FF4FB8"/></linearGradient>
        <linearGradient id="hB" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3FD8FF"/><stop offset=".5" stop-color="#8A6BFF"/><stop offset="1" stop-color="#3FD8FF"/></linearGradient>
        <radialGradient id="hC"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#7FE6FF" stop-opacity="0"/></radialGradient>
        ${this._gas("hF", 0.04, 7, 1.6)}
      </defs>
      ${this._stars(17, 14)}
      <g filter="url(#hF)" fill="none" stroke-linecap="round">
        <ellipse cx="100" cy="100" rx="80" ry="30" stroke="url(#hA)" stroke-width="11" opacity=".85" transform="rotate(-38 100 100)"/>
        <ellipse cx="100" cy="100" rx="80" ry="30" stroke="url(#hB)" stroke-width="11" opacity=".85" transform="rotate(38 100 100)"/>
        <ellipse cx="100" cy="100" rx="52" ry="52" stroke="#5FC8FF" stroke-width="5" opacity=".35"/>
      </g>
      <circle cx="100" cy="100" r="14" fill="url(#hC)"/><circle cx="100" cy="100" r="2.6" fill="#fff"/>`;
    },

    // Dos lóbulos opuestos con un toro de polvo oscuro en medio
    ngc6302(){
      return `<defs>
        <linearGradient id="nL" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#FFB0E0"/><stop offset=".45" stop-color="#9A6BFF"/><stop offset="1" stop-color="#3B5BFF" stop-opacity=".2"/></linearGradient>
        <linearGradient id="nR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFB0E0"/><stop offset=".45" stop-color="#9A6BFF"/><stop offset="1" stop-color="#3B5BFF" stop-opacity=".2"/></linearGradient>
        <radialGradient id="nC"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#FFD9A0" stop-opacity=".9"/><stop offset="1" stop-color="#FF8AB0" stop-opacity="0"/></radialGradient>
        ${this._gas("nF", 0.03, 12, 1.8)}
      </defs>
      ${this._stars(21, 14)}
      <g transform="rotate(-24 100 100)">
        <g filter="url(#nF)">
          <path d="M94 100 C74 44 22 36 14 82 C8 120 56 150 94 108Z" fill="url(#nL)"/>
          <path d="M106 100 C126 44 178 36 186 82 C192 120 144 150 106 108Z" fill="url(#nR)"/>
          <path d="M94 98 C72 70 40 70 30 90" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/>
          <path d="M106 98 C128 70 160 70 170 90" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/>
        </g>
        <ellipse cx="100" cy="102" rx="9" ry="40" fill="#160B1C" opacity=".85" filter="url(#nF)"/>
        <circle cx="100" cy="100" r="16" fill="url(#nC)"/><circle cx="100" cy="100" r="3" fill="#fff"/>
      </g>`;
    },

    // Una mariposa de verdad: alas con venas, manchas y antenas
    mariposa(){
      const wing = `<path d="M98 98 C70 26 18 16 12 58 C8 90 50 108 98 102Z" fill="url(#bU)"/>
        <path d="M98 106 C58 112 28 134 38 168 C48 194 92 162 98 114Z" fill="url(#bL)"/>
        <path d="M96 100 C70 70 40 56 20 60 M96 102 C68 92 40 90 18 84 M98 110 C70 126 54 146 44 168" stroke="#4A0F3A" stroke-opacity=".55" stroke-width="1.4" fill="none"/>
        <circle cx="48" cy="64" r="8" fill="#7FE6FF" opacity=".85"/><circle cx="48" cy="64" r="3.5" fill="#1B1040"/>
        <circle cx="56" cy="148" r="5.5" fill="#FFE3A0" opacity=".9"/>`;
      return `<defs>
        <linearGradient id="bU" x1="1" y1="0.6" x2="0" y2="0.2"><stop offset="0" stop-color="#FFD24A"/><stop offset=".55" stop-color="#FF7A2A"/><stop offset="1" stop-color="#D02A8A"/></linearGradient>
        <linearGradient id="bL" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB04A"/><stop offset="1" stop-color="#8A3BD0"/></linearGradient>
        ${this._gas("bF", 0.05, 5, 0.8)}
      </defs>
      ${this._stars(25, 12)}
      <g filter="url(#bF)">${wing}<g transform="translate(200 0) scale(-1 1)">${wing}</g></g>
      <ellipse cx="100" cy="106" rx="3.6" ry="34" fill="#1B0B22"/>
      <path d="M99 74 C94 58 86 50 78 46 M101 74 C106 58 114 50 122 46" stroke="#FFE3A0" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    },

    // Dos conos unidos por una cintura con el anillo brillante
    reloj(){
      const shell = "M50 22 L150 22 C150 60 114 84 108 100 C114 116 150 140 150 178 L50 178 C50 140 86 116 92 100 C86 84 50 60 50 22Z";
      return `<defs>
        <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3FE6A0"/><stop offset=".42" stop-color="#4A7BFF"/><stop offset=".5" stop-color="#FF4A7A"/><stop offset=".58" stop-color="#4A7BFF"/><stop offset="1" stop-color="#3FE6A0"/></linearGradient>
        <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3FE6A0" stop-opacity=".12"/><stop offset=".5" stop-color="#FF4A7A" stop-opacity=".4"/><stop offset="1" stop-color="#3FE6A0" stop-opacity=".12"/></linearGradient>
        <radialGradient id="gR"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#FF8AA8" stop-opacity=".9"/><stop offset="1" stop-color="#FF4A7A" stop-opacity="0"/></radialGradient>
        ${this._gas("gE", 0.04, 6, 1.4)}
      </defs>
      ${this._stars(29, 14)}
      <g filter="url(#gE)">
        <path d="${shell}" fill="url(#gF)"/>
        <path d="${shell}" fill="none" stroke="url(#gS)" stroke-width="6" stroke-linejoin="round"/>
        <path d="M66 40 L134 40 C130 62 108 80 102 100 C108 120 130 138 134 160 L66 160 C70 138 92 120 98 100 C92 80 70 62 66 40Z" fill="none" stroke="url(#gS)" stroke-width="2.5" opacity=".6"/>
      </g>
      <ellipse cx="100" cy="100" rx="26" ry="8" fill="url(#gR)"/><circle cx="100" cy="100" r="3" fill="#fff"/>`;
    }
  }
};
