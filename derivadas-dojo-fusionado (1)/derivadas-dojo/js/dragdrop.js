/* =========================================================
   Derivadas Dojo — constructor de fichas (drag & drop)
   Funciona arrastrando (escritorio) o tocando (móvil): un
   clic/tap en una ficha de la bolsa la coloca en el destino;
   un clic/tap en una ficha colocada la regresa a la bolsa.
   ========================================================= */

const DragDrop = {

  /**
   * Renderiza un ejercicio tipo "build" dentro de container.
   * tokensCorrect: array de strings en el orden correcto.
   * tokensDistractors: array de strings extra que no se usan.
   * Devuelve un handle: { getAnswer(), lock(), reset(), isFull() }
   */
  renderBuilder(container, tokensCorrect, tokensDistractors){
    container.innerHTML = "";

    const pool = document.createElement("div");
    pool.className = "builder-pool";

    const target = document.createElement("div");
    target.className = "builder-target";
    const placeholder = document.createElement("span");
    placeholder.className = "placeholder";
    placeholder.textContent = "Toca o arrastra las fichas aquí, en orden →";
    target.appendChild(placeholder);

    const allTokens = tokensCorrect.map((t,i)=>({uid:"c"+i, text:t}))
      .concat(tokensDistractors.filter(t=>!tokensCorrect.includes(t)).map((t,i)=>({uid:"d"+i, text:t})));
    shuffle(allTokens);

    let locked = false;

    function makeTokenEl(tokenData, placed){
      const el = document.createElement("div");
      el.className = "token" + (placed ? " placed" : "");
      el.innerHTML = tokenData.text === "/" ? '<span class="tok-op">÷</span>' : colorMath(tokenData.text);
      el.dataset.uid = tokenData.uid;
      el.draggable = true;

      el.addEventListener("click", ()=>{
        if(locked) return;
        if(placed) moveToPool(tokenData); else moveToTarget(tokenData);
      });
      el.addEventListener("dragstart", (e)=>{
        if(locked){ e.preventDefault(); return; }
        e.dataTransfer.setData("text/plain", tokenData.uid);
      });
      return el;
    }

    const preview = document.createElement("div");
    preview.className = "builder-preview";

    function refresh(){
      preview.innerHTML = targetData.length
        ? '<span class="builder-preview-label">Así se ve tu respuesta</span><span class="math">' + colorMath(targetData.map(t=>t.text).join(" ")) + '</span>'
        : "";
      pool.innerHTML = "";
      poolData.forEach(td => pool.appendChild(makeTokenEl(td, false)));

      target.innerHTML = "";
      if(targetData.length === 0){
        target.appendChild(placeholder);
      } else {
        targetData.forEach(td => target.appendChild(makeTokenEl(td, true)));
      }
    }

    let poolData = allTokens.slice();
    let targetData = [];

    function moveToTarget(tokenData){
      poolData = poolData.filter(t=>t.uid!==tokenData.uid);
      targetData.push(tokenData);
      refresh();
    }
    function moveToPool(tokenData){
      targetData = targetData.filter(t=>t.uid!==tokenData.uid);
      poolData.push(tokenData);
      refresh();
    }

    target.addEventListener("dragover", (e)=>{
      if(locked) return;
      e.preventDefault();
      target.classList.add("drag-over");
    });
    target.addEventListener("dragleave", ()=> target.classList.remove("drag-over"));
    target.addEventListener("drop", (e)=>{
      e.preventDefault();
      target.classList.remove("drag-over");
      if(locked) return;
      const uid = e.dataTransfer.getData("text/plain");
      const tokenData = poolData.find(t=>t.uid===uid);
      if(tokenData) moveToTarget(tokenData);
    });
    pool.addEventListener("dragover", (e)=>{ if(!locked) e.preventDefault(); });
    pool.addEventListener("drop", (e)=>{
      e.preventDefault();
      if(locked) return;
      const uid = e.dataTransfer.getData("text/plain");
      const tokenData = targetData.find(t=>t.uid===uid);
      if(tokenData) moveToPool(tokenData);
    });

    refresh();
    container.appendChild(pool);
    container.appendChild(target);
    container.appendChild(preview);

    return {
      getAnswer(){ return targetData.map(t=>t.text); },
      isFull(){ return targetData.length === tokensCorrect.length; },
      lock(){
        locked = true;
        container.querySelectorAll(".token").forEach(el=>el.classList.add("locked"));
      },
      markResult(isCorrect){
        target.querySelectorAll(".token").forEach(el=>{
          el.classList.add(isCorrect ? "placed" : "placed");
        });
        target.style.borderColor = isCorrect ? "var(--success)" : "var(--error)";
      }
    };
  }
};

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}
