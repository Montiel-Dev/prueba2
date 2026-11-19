/* =========================================================
   Derivadas Dojo — animaciones del desarrollo (sin efectos ni audio)
   UNA sola expresión que se transforma en su sitio: los términos se
   mueven (por ejemplo, cruzan el "="), cambian de signo, se tachan y
   se cancelan, el exponente baja y se reduce, la fracción se simplifica.
   Se usa en: lecciones "Ejemplo resuelto" y en el "ejemplo parecido"
   de cada problema guiado.

   Cada paso = [título, expresión, nota]. La expresión son piezas
   separadas por espacios. Prefijos de una pieza:
     id:   misma pieza entre pasos (se desplaza aunque cambie su texto)
     *     resaltar (lo que cambió)      !   tachar (se cancela)
   Ej.: "*a:12x^2 − b:4x" . Sin id, se empareja por texto idéntico.
   ========================================================= */
const A = (t, e, n) => ({ t, e, n });
const ANIM_LESSONS = {};
const ANIM_EXTRA = {};
const rowsToFrames = (first, rows) => [first].concat(rows.map(r => A(r[0], r[1], r[2])));
const LS = (title, e0, rows) => { ANIM_LESSONS[title] = rowsToFrames(A("Problema", e0, "Veamos cómo se transforma, un paso a la vez."), rows); };
const EX = (id, e0, rows) => { ANIM_EXTRA[id] = rowsToFrames(A("Ejemplo extra (otro caso)", e0, "Es otro caso con la misma técnica que tu ejercicio. Míralo paso a paso y luego resuelve el tuyo."), rows); };

// Regla de la cadena: mismos 5 pasos para cualquier exterior/interior
const CH = (ext, u, extD, du, sub, fin) => [
  ["1. Llama u a lo de adentro", `fn:f(x) = *a:${ext} con u = ${u}`, "u es lo que está dentro; ahora la función es sencilla."],
  ["2. Deriva el exterior", `fn:f'(x) = *a:${extD} · *b:u' con u = ${u}`, "Se deriva la capa de afuera dejando u igual; falta multiplicar por u'."],
  ["3. Deriva el interior", `fn:f'(x) = a:${extD} · *b:${du} con u = ${u}`, "u' es la derivada de lo de adentro."],
  ["4. Devuelve u", `fn:f'(x) = *a:${sub} · b:${du}`, "Cambias u por su valor y se va la aclaración."],
  ["5. Simplifica", `fn:f'(x) = *a:${fin}`, "Todo queda en una sola expresión."]];

// ---------- lecciones "Ejemplo resuelto" ----------
LS("Ejemplo resuelto: cómo se desarrolla un problema","fn:f(x) = a:4x^3 − b:2x^2 + c:5x − d:9",[
 ["1. Una prima por término","fn:f'(x) = *a:(4x^3)' − *b:(2x^2)' + *c:(5x)' − *d:(9)'","Cada término se deriva por separado; los signos se quedan."],
 ["2. Baja el exponente","fn:f'(x) = *a:4·3x^2 − *b:2·2x^1 + *c:5·1x^0 − *d:0","El exponente baja a multiplicar y se reduce en 1; el 9 es constante y da 0."],
 ["3. Multiplica","fn:f'(x) = *a:12x^2 − *b:4x + *c:5 − d:0","4·3 = 12, 2·2 = 4, x^1 = x y x^0 = 1."],
 ["4. Tacha lo que no aporta","fn:f'(x) = a:12x^2 − b:4x + c:5 !− !d:0","Restar 0 no cambia nada."],
 ["5. Resultado","fn:f'(x) = a:12x^2 − b:4x + c:5","Esa es la derivada."]]);
LS("Ejemplo resuelto: producto en 4 pasos","fn:f(x) = a:(x+1)(x+2)",[
 ["1. Nombra los factores","fn:f(x) = *a:u·v ; u = x+1 ; v = x+2","Los dos factores que se multiplican."],
 ["2. Fórmula y derivadas","fn:f'(x) = *a:u'v + *b:uv' ; u' = 1 ; v' = 1","Se suman dos productos; cada factor se deriva por separado."],
 ["3. Sustituye","fn:f'(x) = *a:1(x+2) + *b:(x+1)(1)","Cambias u, v, u' y v' por sus valores."],
 ["4. Quita el 1","fn:f'(x) = *a:x+2 + *b:x+1","Multiplicar por 1 no cambia nada."],
 ["5. Junta","fn:f'(x) = *a:2x+3","x + x = 2x y 2 + 1 = 3."]]);
LS("Ejemplo resuelto: de afuera hacia adentro","fn:f(x) = a:(2x+1)^3",CH("u^3","2x+1","3u^2","2","3(2x+1)^2","6(2x+1)^2"));
LS("Ejemplo resuelto: trigonométrica con interior","fn:f(x) = a:sen(2x)",CH("sen(u)","2x","cos(u)","2","cos(2x)","2cos(2x)"));
LS("Ejemplo resuelto: ln con interior","fn:f(x) = a:ln(2x+1)",CH("ln(u)","2x+1","1/u","2","1/(2x+1)","2/(2x+1)"));
LS("Ejemplo resuelto: implícita en 3 pasos","a:x^2 + b:y^2 = c:25",[
 ["1. Deriva ambos lados","*a:(x^2)' + *b:(y^2)' = *c:(25)'","Se aplica la derivada a cada término."],
 ["2. Deriva cada término","*a:2x + *b:2y·dy/dx = *c:0","y depende de x: se le pega dy/dx."],
 ["3. Pasa 2x al otro lado","b:2y·dy/dx = *a:−2x","Al cruzar el igual, cambia de signo."],
 ["4. Divide entre 2y","*b:dy/dx = a:−2x/(2y)","Lo que multiplica a dy/dx pasa dividiendo."],
 ["5. Simplifica","b:dy/dx = *a:−x/y","Se cancela el 2."]]);

// ---------- ejemplos extra (uno por problema guiado) ----------
EX("f-g1","fn:f(x) = a:2x^4 − b:3x + c:5",[
 ["1. Una prima por término","fn:f'(x) = *a:(2x^4)' − *b:(3x)' + *c:(5)'","Cada término por separado."],
 ["2. Baja el exponente","fn:f'(x) = *a:2·4x^3 − *b:3·1 + *c:0","x es x^1; la constante da 0."],
 ["3. Multiplica","fn:f'(x) = *a:8x^3 − b:3 + c:0","2·4 = 8."],
 ["4. Tacha el 0","fn:f'(x) = a:8x^3 − b:3 !+ !c:0","Sumar 0 no cambia nada."],
 ["5. Resultado","fn:f'(x) = a:8x^3 − b:3","Esa es la derivada."]]);
EX("f-g2","fn:f(x) = a:3√x + b:2/x",[
 ["1. Reescribe como potencias","fn:f(x) = *a:3x^(1/2) + *b:2x^(−1)","√x = x^(1/2) y 1/x = x^(−1)."],
 ["2. Baja el exponente","fn:f'(x) = *a:3·(1/2)x^(−1/2) + *b:2·(−1)x^(−2)","Exponente al frente y se reduce en 1."],
 ["3. Multiplica","fn:f'(x) = *a:(3/2)x^(−1/2) + *b:−2x^(−2)","3·1/2 = 3/2 y 2·(−1) = −2."]]);
EX("f-g3","fn:f(x) = a:x^2 − b:4x + c:1, en x = 3",[
 ["1. Deriva","fn:f'(x) = *a:2x − *b:4 + *c:0","x² → 2x, 4x → 4 y el 1 → 0."],
 ["2. Tacha el 0","fn:f'(x) = a:2x − b:4 !+ !c:0","Sumar 0 no cambia nada."],
 ["3. Evalúa en x = 3","fn:f'(3) = *a:2(3) − b:4","Cambias x por 3."],
 ["4. Multiplica","fn:f'(3) = *a:6 − b:4","2·3 = 6."],
 ["5. Resta","fn:f'(3) = *a:2","6 − 4 = 2: la curva sube 2 por cada 1 a la derecha."]]);
EX("f-g4","fn:f(x) = a:(3x+1)^2",[
 ["1. Expande","fn:f(x) = *a:9x^2 + *b:6x + *c:1","(3x+1)² = 9x² + 2·3x·1 + 1."],
 ["2. Deriva","fn:f'(x) = *a:18x + *b:6 + *c:0","9x² → 18x, 6x → 6 y 1 → 0."],
 ["3. Tacha el 0","fn:f'(x) = a:18x + b:6 !+ !c:0","Sumar 0 no cambia nada."],
 ["4. Resultado","fn:f'(x) = a:18x + b:6","Esa es la derivada."]]);
EX("p-g1","fn:f(x) = a:(3x+1)(x^2+2)",[
 ["1. Fórmula y derivadas","fn:f'(x) = *a:u'v + *b:uv' con u' = 3 ; v' = 2x","u = 3x+1 y v = x²+2."],
 ["2. Sustituye","fn:f'(x) = *a:3(x^2+2) + *b:(3x+1)(2x)","Cambias u, v, u' y v'."],
 ["3. Desarrolla","fn:f'(x) = *a:3x^2+6 + *b:6x^2+2x","Multiplicas cada paréntesis."],
 ["4. Junta","fn:f'(x) = *a:9x^2+2x+6","3x² + 6x² = 9x²."]]);
EX("p-g2","fn:f(x) = a:(x+3)/(x−2)",[
 ["1. Fórmula del cociente","fn:f'(x) = *a:(u'v−uv')/v^2 con u' = 1 ; v' = 1","Numerador u'v − uv' sobre v²."],
 ["2. Sustituye","fn:f'(x) = *a:(1(x−2)−(x+3)(1))/(x−2)^2","u = x+3 y v = x−2."],
 ["3. Quita el 1","fn:f'(x) = *a:(x−2−x−3)/(x−2)^2","Multiplicar por 1 no cambia nada."],
 ["4. Simplifica","fn:f'(x) = *a:−5/(x−2)^2","Las x se cancelan: −2 − 3 = −5."]]);
EX("p-g3","fn:f(x) = a:x^2(3x−4)",[
 ["1. Fórmula y derivadas","fn:f'(x) = *a:u'v + *b:uv' con u' = 2x ; v' = 3","u = x² y v = 3x−4."],
 ["2. Sustituye","fn:f'(x) = *a:2x(3x−4) + *b:x^2(3)","Cambias u, v, u' y v'."],
 ["3. Desarrolla","fn:f'(x) = *a:6x^2−8x + *b:3x^2","Multiplicas."],
 ["4. Junta","fn:f'(x) = *a:9x^2−8x","6x² + 3x² = 9x²."]]);
EX("p-g4","fn:f(x) = a:x/(x^2+1)",[
 ["1. Fórmula del cociente","fn:f'(x) = *a:(u'v−uv')/v^2 con u' = 1 ; v' = 2x","u = x y v = x²+1."],
 ["2. Sustituye","fn:f'(x) = *a:(1(x^2+1)−x(2x))/(x^2+1)^2","Cambias u, v, u' y v'."],
 ["3. Desarrolla","fn:f'(x) = *a:(x^2+1−2x^2)/(x^2+1)^2","x(2x) = 2x²."],
 ["4. Simplifica","fn:f'(x) = *a:(1−x^2)/(x^2+1)^2","x² − 2x² = −x²."]]);
EX("c-g1","fn:f(x) = a:(2x+5)^4",CH("u^4","2x+5","4u^3","2","4(2x+5)^3","8(2x+5)^3"));
EX("c-g2","fn:f(x) = a:√(3x+1)",CH("√u","3x+1","1/(2√u)","3","1/(2√(3x+1))","3/(2√(3x+1))"));
EX("c-g3","fn:f(x) = a:(x^2+2x)^3",CH("u^3","x^2+2x","3u^2","(2x+2)","3(x^2+2x)^2","3(x^2+2x)^2(2x+2)"));
EX("c-g4","fn:f(x) = a:√(x+1)/x",[
 ["1. Fórmula del cociente","fn:f'(x) = *a:(u'v−uv')/x^2 con u = √(x+1) ; v = x","u arriba y v = x abajo."],
 ["2. Deriva u (cadena) y v","fn:f'(x) = a:(u'v−uv')/x^2 con u' = *1/(2√(x+1)) ; v' = *1","(x+1)' = 1 sobre 2√(x+1)."],
 ["3. Sustituye","fn:f'(x) = *a:(x/(2√(x+1))−√(x+1))/x^2","u'v = x/(2√(x+1)) y uv' = √(x+1)."]]);
EX("t-g1","fn:f(x) = a:4sen(x) − b:5cos(x)",[
 ["1. Deriva cada término","fn:f'(x) = *a:4cos(x) − *b:5(−sen(x))","(sen x)' = cos x y (cos x)' = −sen x."],
 ["2. Arregla los signos","fn:f'(x) = a:4cos(x) + *b:5sen(x)","Menos por menos da más."]]);
EX("t-g2","fn:f(x) = a:sen(3x)",CH("sen(u)","3x","cos(u)","3","cos(3x)","3cos(3x)"));
EX("t-g3","fn:f(x) = a:cos(x^3)",CH("cos(u)","x^3","−sen(u)","3x^2","−sen(x^3)","−3x^2sen(x^3)"));
EX("t-g4","fn:f(x) = a:x^3cos(x)",[
 ["1. Fórmula y derivadas","fn:f'(x) = *a:u'v + *b:uv' con u' = 3x^2 ; v' = −sen(x)","u = x³ y v = cos x."],
 ["2. Sustituye","fn:f'(x) = *a:3x^2cos(x) + *b:x^3(−sen(x))","Cambias u, v, u' y v'."],
 ["3. Arregla el signo","fn:f'(x) = a:3x^2cos(x) − *b:x^3sen(x)","+ (−) = −."]]);
EX("t-g5","fn:f(x) = a:tan(4x)",CH("tan(u)","4x","sec^2(u)","4","sec^2(4x)","4sec^2(4x)"));
EX("e-g1","fn:f(x) = a:e^(5x)",CH("e^u","5x","e^u","5","e^(5x)","5e^(5x)"));
EX("e-g2","fn:f(x) = a:ln(3x)",CH("ln(u)","3x","1/u","3","1/(3x)","1/x"));
EX("e-g3","fn:f(x) = a:ln(x^2+4)",CH("ln(u)","x^2+4","1/u","2x","1/(x^2+4)","2x/(x^2+4)"));
EX("e-g4","fn:f(x) = a:x^2e^x",[
 ["1. Fórmula y derivadas","fn:f'(x) = *a:u'v + *b:uv' con u' = 2x ; v' = e^x","u = x² y v = e^x."],
 ["2. Sustituye","fn:f'(x) = *a:2xe^x + *b:x^2e^x","Cambias u, v, u' y v'."],
 ["3. Factor común","fn:f'(x) = *a:e^x(x^2+2x)","Sacas e^x de los dos términos."]]);
EX("e-g5","fn:f(x) = a:5^x",[
 ["1. Fórmula (a^x)'","fn:f'(x) = *a:a^x · *b:ln(a) con a = 5","Si la base no es e, aparece ln de la base."],
 ["2. Sustituye la base","fn:f'(x) = a:5^x · b:ln(5)","a = 5."]]);
EX("i-g1","a:x^2 + b:4y^2 = c:20",[
 ["1. Deriva ambos lados","*a:(x^2)' + *b:(4y^2)' = *c:(20)'","Se aplica la derivada a cada término."],
 ["2. Deriva cada término","*a:2x + *b:8y·dy/dx = *c:0","y depende de x: se pega dy/dx."],
 ["3. Pasa 2x al otro lado","b:8y·dy/dx = *a:−2x","Al cruzar el igual, cambia de signo."],
 ["4. Divide entre 8y","*b:dy/dx = a:−2x/(8y)","Lo que multiplica a dy/dx pasa dividiendo."],
 ["5. Simplifica","b:dy/dx = *a:−x/(4y)","Se cancela el 2."]]);
EX("i-g2","a:x^2 + b:2xy = c:7",[
 ["1. Deriva cada término","*a:2x + *b:2(y+x·dy/dx) = *c:0","(xy)' = y + x·dy/dx (producto)."],
 ["2. Reparte el 2","a:2x + *b:2y+2x·dy/dx = c:0","2 multiplica los dos sumandos."],
 ["3. Pasa a la derecha lo que no lleva dy/dx","*b:2x·dy/dx = *a:−2x−2y","Al cruzar el igual, cambian de signo."],
 ["4. Divide entre 2x","*b:dy/dx = *a:−(x+y)/x","Se simplifica el 2."]]);
EX("i-g3","a:y^2 = b:x^3 + c:5",[
 ["1. Deriva cada término","*a:2y·dy/dx = *b:3x^2 + *c:0","y depende de x: se pega dy/dx."],
 ["2. Tacha el 0","a:2y·dy/dx = b:3x^2 !+ !c:0","Sumar 0 no cambia nada."],
 ["3. Divide entre 2y","*a:dy/dx = *b:3x^2/(2y)","Lo que multiplica a dy/dx pasa dividiendo."]]);
EX("i-g4","fn:f(x) = a:x^3 − b:2x^2 + c:5x",[
 ["1. Primera derivada","fn:f'(x) = *a:3x^2 − *b:4x + *c:5","Término a término."],
 ["2. Segunda derivada","fn:f''(x) = *a:6x − *b:4 + *c:0","Se deriva f' otra vez."],
 ["3. Tercera derivada","fn:f'''(x) = *a:6 − *b:0","6x → 6 y −4 → 0."],
 ["4. Tacha el 0","fn:f'''(x) = a:6 !− !b:0","Restar 0 no cambia nada."],
 ["5. Resultado","fn:f'''(x) = a:6","Esa es f'''."]]);
EX("i-g5","fn:f(x) = a:e^(3x)",[
 ["1. Primera","fn:f'(x) = *a:3e^(3x)","Sale un 3."],
 ["2. Segunda","fn:f''(x) = *a:9e^(3x)","Otro 3: 3·3 = 9."],
 ["3. Tercera","fn:f'''(x) = *a:27e^(3x)","Otro 3: 9·3 = 27."],
 ["4. Patrón","fn:f(n)(x) = *a:3^n·e^(3x) con n = número de derivadas","Cada derivada multiplica por 3 otra vez."]]);

const Anim = {
  // Respaldo: si un problema no tiene ejemplo extra, se anima con sus propios pasos
  fromGuided(ex){
    const f = [A("Punto de partida", ex.func, "Esto es lo que vamos a resolver, paso por paso.")];
    ex.steps.forEach(s => f.push(A(String(s.label||"Paso").replace(/:$/,""), s.res, s.why)));
    return f;
  },
  exampleFor(ex){ return ANIM_EXTRA[ex.id] || Anim.fromGuided(ex); },

  // "*a:12x^2" → { id, text, hl, cancel }
  parseTok(str){
    const seen = {}, pre = r => { let h = false, c = false, i = 0; while(r[i]==="*"||r[i]==="!"){ if(r[i]==="*") h = true; else c = true; i++; } return [r.slice(i), h, c]; };
    return String(str).trim().split(/\s+/).map(raw=>{
      let [t, hl, cancel] = pre(raw), id = null;
      const mm = /^([a-z]{1,3}\d?):(.+)$/.exec(t);
      if(mm){ id = mm[1]; let h2, c2; [t, h2, c2] = pre(mm[2]); hl = hl || h2; cancel = cancel || c2; }
      if(!id){ seen[t] = (seen[t]||0) + 1; id = t + "#" + seen[t]; }
      return { id, text: t, hl, cancel };
    });
  },
  plain(e){ return Anim.parseTok(e).map(t => t.text).join(" "); },

  mount(host, frames){
    if(host._anim) clearTimeout(host._anim);
    host.innerHTML = `<div class="anim" role="group" aria-label="Animación del desarrollo">
      <div class="anim-orig"></div>
      <div class="a-t"></div>
      <div class="a-stage" aria-live="polite"><div class="a-row"></div></div>
      <div class="a-hint" hidden>↔ Desliza para ver la expresión completa</div>
      <div class="anim-data"></div>
      <div class="anim-cap"></div>
      <div class="anim-bar"><div></div></div>
      <div class="anim-ctl">
        <button type="button" class="btn btn-ghost" data-a="first" aria-label="Volver al inicio">↺</button>
        <button type="button" class="btn btn-ghost" data-a="prev">◀ Regresar</button>
        <button type="button" class="btn btn-primary" data-a="play">▶ Reproducir</button>
        <button type="button" class="btn btn-ghost" data-a="next">Siguiente ▶</button>
        <label class="anim-speed">Velocidad <select><option value="5000">Lenta</option><option value="3200" selected>Normal</option></select></label>
        <span class="anim-count"></span>
      </div></div>`;
    const q = x => host.querySelector(x), n = frames.length;
    const stage = q(".a-stage"), row = q(".a-row"), playBtn = q('[data-a="play"]');
    const still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    let k = 0, timer = null;
    const setBtn = ()=>{ playBtn.textContent = timer ? "⏸ Pausa" : (k === n-1 ? "↺ Repetir" : "▶ Reproducir"); };

    const rects = ()=>{
      const s = stage.getBoundingClientRect(), o = {};
      row.querySelectorAll(".a-tok").forEach(el=>{
        const r = el.getBoundingClientRect();
        o[el.dataset.id] = { x: r.left - s.left, y: r.top - s.top, html: el.innerHTML, text: el.dataset.text, el };
      });
      return o;
    };

    // Los términos se desplazan de su lugar anterior al nuevo (FLIP)
    const draw = ()=>{
      stage.querySelectorAll(".a-ghost").forEach(g => g.remove());
      row.querySelectorAll(".a-tok").forEach(el => el.getAnimations && el.getAnimations().forEach(a => a.cancel()));
      const f = frames[k], toks = Anim.parseTok(f.e), old = rects();
      row.innerHTML = toks.map(t => `<span class="a-tok${t.hl ? " a-hl" : ""}${t.cancel ? " a-cancel" : ""}" data-id="${t.id}" data-text="${mathEsc(t.text)}">${m(t.text)}</span>`).join("");
      fit();
      const fresh = rects(), D = 700, ease = "ease-in-out";
      if(!still){
        const used = {};
        Object.keys(fresh).forEach(id=>{
          const nw = fresh[id], ol = old[id];
          if(ol){
            used[id] = true;
            const dx = ol.x - nw.x, dy = ol.y - nw.y;
            nw.el.animate([{ transform:`translate(${dx}px,${dy}px)` }, { transform:"none" }], { duration:D, easing:ease });
            if(ol.text !== nw.text){
              nw.el.animate([{ opacity:0 }, { opacity:0, offset:.5 }, { opacity:1 }], { duration:D, easing:ease });
              ghost(ol, nw.x - ol.x, nw.y - ol.y, true);
            }
          } else nw.el.animate([{ opacity:0 }, { opacity:0, offset:.45 }, { opacity:1 }], { duration:D, easing:ease });
        });
        Object.keys(old).forEach(id=>{ if(!used[id]) ghost(old[id], 0, 0, false); });
      }
      q(".anim-orig").innerHTML = k > 0 ? `<span>Partimos de</span> ${m(Anim.plain(frames[0].e))}` : "";
      q(".a-t").innerHTML = rich(f.t);
      q(".anim-data").innerHTML = f.d ? `<b>Datos</b>` + String(f.d).split(/\s*;\s*/).filter(Boolean).map(x => `<div class="d-item"><span class="math">${colorMath(x)}</span></div>`).join("") : "";
      q(".anim-cap").innerHTML = rich(f.n || "");
      q(".anim-bar div").style.width = ((k+1)/n*100) + "%";
      q(".anim-count").textContent = `Paso ${k+1} de ${n}`;
      q('[data-a="prev"]').disabled = k === 0;
      q('[data-a="next"]').disabled = k === n-1;
      setBtn();
    };
    // Si la expresión no cabe en una línea, se achica la letra (hasta 15 px) en vez de partirla en pedazos
    function fit(){
      row.style.fontSize = ""; row.style.flexWrap = ""; row.style.columnGap = "";
      let fs = parseFloat(getComputedStyle(row).fontSize) || 28;
      const avail = stage.clientWidth - 32;
      row.style.flexWrap = "nowrap";
      row.style.columnGap = Math.round(fs * .45) + "px";
      while(row.scrollWidth > avail + 1 && fs > 15){
        fs -= 1; row.style.fontSize = fs + "px"; row.style.columnGap = Math.round(fs * .45) + "px";
      }
      if(row.scrollWidth > avail + 1) row.style.flexWrap = "wrap";
      // si una sola pieza sigue siendo más ancha que la pantalla, se puede deslizar y se avisa
      const hint = q(".a-hint");
      if(hint) hint.hidden = !(stage.scrollWidth > stage.clientWidth + 1);
    }
    // Copia fantasma de lo que se va: se mueve y se desvanece
    function ghost(ol, dx, dy, moves){
      const g = document.createElement("span");
      g.className = "a-ghost"; g.innerHTML = ol.html; g.style.fontSize = row.style.fontSize;
      g.style.left = ol.x + "px"; g.style.top = ol.y + "px";
      stage.appendChild(g);
      const a = g.animate([{ opacity:1, transform:"none" }, { opacity:0, transform: moves ? `translate(${dx}px,${dy}px)` : "translateY(-10px)" }], { duration:700, easing:"ease-in-out", fill:"forwards" });
      a.onfinish = ()=> g.remove();
    }
    const go = to => { k = to; draw(); };
    const stop = ()=>{ clearTimeout(timer); timer = null; host._anim = null; };
    const tick = ()=>{
      timer = setTimeout(()=>{ if(k < n-1){ go(k+1); tick(); } else { stop(); setBtn(); } }, +q("select").value);
      host._anim = timer;
    };
    q(".anim-ctl").addEventListener("click", e=>{
      const b = e.target.closest("[data-a]"); if(!b) return;
      const a = b.dataset.a;
      if(a === "play"){
        if(timer){ stop(); setBtn(); return; }
        if(k === n-1) go(0);
        tick(); setBtn();
        return;
      }
      stop();
      if(a === "first") go(0);
      else if(a === "prev" && k > 0) go(k-1);
      else if(a === "next" && k < n-1) go(k+1);
      setBtn();
    });
    draw();
  }
};
