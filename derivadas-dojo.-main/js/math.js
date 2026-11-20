/* =========================================================
   Derivadas Dojo — render de matemáticas
   Convierte texto plano ("2x/(x^2+1)", "√(4x−1)", "dy/dx")
   en fórmulas bonitas:
   - fracciones APILADAS (numerador arriba, barra, denominador abajo)
   - raíces con su vinculo, exponentes arriba, primas f′(x)
   - colores por tipo: número, variable, exponente, función
   Para escribir contenido sigues usando texto normal.
   ========================================================= */

const MATH_FUNCS = new Set(["sec","sen","cos","tan","ln","lím","log","csc","cot"]);
const LETTER = "A-Za-zÁ-úñÑ";

function mathEsc(s){
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function mathMatchClose(s, i){
  let d = 0;
  for(let j=i; j<s.length; j++){
    const c = s[j];
    if(c==="(" || c==="[") d++;
    else if(c===")" || c==="]"){ d--; if(d===0) return j; }
  }
  return -1;
}

function mathFracHtml(n, d){
  return `<span class="frac"><span class="num">${n}</span><span class="den">${d}</span></span>`;
}

function mathHtml(items){
  return items.map(x => x.html).join("");
}

/* exponentes y primas pegados a un factor */
function mathPost(s, i, item){
  for(;;){
    if(s[i] === "'"){
      item.html += '<span class="tok-prime">′</span>';
      i++; continue;
    }
    if(s[i] === "^"){
      let content = null, next = i;
      if(s[i+1]==="(" || s[i+1]==="["){
        const j = mathMatchClose(s, i+1);
        if(j > 0){ content = mathHtml(mathResolve(mathParse(s.slice(i+2, j)))); next = j+1; }
      } else {
        const m = new RegExp("^[−-]?(?:\\d+(?:\\.\\d+)?|[A-Za-z])").exec(s.slice(i+1));
        if(m){ content = mathHtml(mathResolve(mathParse(m[0]))); next = i+1+m[0].length; }
      }
      if(content === null) break;
      item.html = (item.paren || item.html) + `<sup class="tok-exp">${content}</sup>`;
      item.paren = null; item.hasExp = true;
      i = next; continue;
    }
    break;
  }
  return { item, next: i };
}

/* lee UN factor (pieza multiplicable) desde la posición i */
function mathReadFactor(s, i){
  const c = s[i];

  if(c==="(" || c==="["){
    const j = mathMatchClose(s, i);
    if(j > 0){
      const inner = mathResolve(mathParse(s.slice(i+1, j)));
      const real = inner.filter(x => x.t !== "ws");
      const single = real.length === 1 && real[0].kind === "frac";
      const innerHtml = mathHtml(inner);
      const o = c==="(" ? "(" : "[", cl = c==="(" ? ")" : "]";
      const paren = `<span class="tok-op">${o}</span>${innerHtml}<span class="tok-op">${cl}</span>`;
      return mathPost(s, j+1, {
        t:"f", kind:"group", innerHtml,
        paren: single ? paren : null,
        html: single ? innerHtml : paren
      });
    }
  }

  if(c === "√"){
    const r = mathReadFactor(s, i+1);
    if(r){
      const f = r.item;
      const body = f.kind === "group" ? f.innerHtml : f.html;
      return mathPost(s, r.next, { t:"f", kind:"sqrt",
        html:`<span class="sqrt"><span class="sqrt-sign">√</span><span class="sqrt-body">${body}</span></span>` });
    }
  }

  const rest = s.slice(i);
  let m;

  // dy/dx y d/dx → fracción de Leibniz
  if((m = new RegExp("^d[xy]?/d[xy](?![" + LETTER + "])").exec(rest)) && (i===0 || !new RegExp("[" + LETTER + "]").test(s[i-1]))){
    const [a, b] = m[0].split("/");
    const v = t => `<span class="tok-var">${t}</span>`;
    return { item:{ t:"f", kind:"frac", html: mathFracHtml(v(a), v(b)) }, next: i + m[0].length };
  }

  if((m = /^\d+(?:\.\d+)?/.exec(rest))){
    return mathPost(s, i+m[0].length, { t:"f", kind:"num", html:`<span class="tok-num">${m[0]}</span>` });
  }

  if((m = new RegExp("^[" + LETTER + "]+").exec(rest))){
    let w = m[0];
    if(MATH_FUNCS.has(w)){
      return mathPost(s, i+w.length, { t:"f", kind:"func", html:`<span class="tok-func">${w}</span>` });
    }
    if(/^[uvxy]{2,}$/.test(w)) w = w[0];            // "uv" = u·v
    if(w.length === 1){
      let cls = "tok-var";
      if(w === "e" && s[i+1] === "^") cls = "tok-func";
      else if("aeouy".includes(w) && new RegExp("^\\s+[" + LETTER + "]{2,}").test(s.slice(i+1))){
        return { item:{ t:"txt", html: mathEsc(w) }, next: i+1 };   // "y", "a", "o" en español
      }
      return mathPost(s, i+1, { t:"f", kind:"var", html:`<span class="${cls}">${w}</span>` });
    }
    return { item:{ t:"txt", html: mathEsc(w) }, next: i + w.length };
  }

  return null;
}

function mathParse(s){
  const items = [];
  let i = 0;
  while(i < s.length){
    const r = mathReadFactor(s, i);
    if(r){ items.push(r.item); i = r.next; continue; }
    const c = s[i];
    let m;
    if((m = /^\s+/.exec(s.slice(i)))){ items.push({ t:"ws", html:m[0] }); i += m[0].length; }
    else if(c === "/"){ items.push({ t:"slash", html:"/" }); i++; }
    else if("+−-=·×".includes(c)){
      items.push({ t:"op", html:`<span class="tok-op${c==="=" ? " tok-eq" : ""}">${c}</span>` }); i++;
    }
    else { items.push({ t:"txt", html: mathEsc(c) }); i++; }
  }
  return items;
}

/* junta "numerador / denominador" en una fracción apilada */
function mathResolve(items){
  const out = [];
  const strip = list => (list.length === 1 && list[0].kind === "group" && !list[0].hasExp)
    ? list[0].innerHtml : mathHtml(list);

  for(let k=0; k<items.length; k++){
    const it = items[k];
    if(it.t !== "slash"){ out.push(it); continue; }

    const ws = [];
    while(out.length && out[out.length-1].t === "ws") ws.unshift(out.pop());
    const num = [];
    while(out.length && out[out.length-1].t === "f") num.unshift(out.pop());

    let j = k+1;
    while(items[j] && items[j].t === "ws") j++;
    const den = [];
    while(items[j] && items[j].t === "f"){ den.push(items[j]); j++; }

    if(!num.length || !den.length){
      out.push(...num, ...ws, { t:"txt", html:'<span class="tok-op">/</span>' });
      continue;
    }
    out.push({ t:"f", kind:"frac", html: mathFracHtml(strip(num), strip(den)) });
    k = j - 1;
  }
  return out;
}

/* texto plano → HTML con fórmulas bonitas */
function colorMath(str){
  if(str == null) return "";
  return mathHtml(mathResolve(mathParse(String(str))));
}

function m(text){ return `<span class="math">${colorMath(text)}</span>`; }

/* para explicaciones, pistas y enunciados (texto con fórmulas mezcladas) */
function rich(text){ return colorMath(text); }

/* lecciones: convierte dy/dx escrito en texto a fracción apilada */
function fixLesson(h){
  const d = document.createElement("div");
  d.innerHTML = h;
  const w = document.createTreeWalker(d, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while(w.nextNode()) nodes.push(w.currentNode);
  nodes.forEach(n => {
    if(!/\bd[xy]?\/d[xy]\b/.test(n.nodeValue)) return;
    const sp = document.createElement("span");
    sp.innerHTML = mathEsc(n.nodeValue).replace(/\bd([xy]?)\/d([xy])\b/g,
      (a, p, q) => `<span class="math">${mathFracHtml("d"+p, "d"+q)}</span>`);
    n.replaceWith(sp);
  });
  return d.innerHTML;
}
