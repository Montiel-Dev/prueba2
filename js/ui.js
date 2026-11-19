/* =========================================================
   Derivadas Dojo — interfaz
   Renderiza la barra lateral y las pantallas dentro de #main.
   No usa ningún framework: funciones que arman HTML y lo
   inyectan, más listeners.
   ========================================================= */

const $main = document.getElementById("main");

const UI = {

  init(){
    this.renderSidebar();
    this.showHome();
  },

  // ---------------- sidebar ----------------
  renderSidebar(){
    document.getElementById("stat-points").textContent = Engine.state.points;
    document.getElementById("stat-streak").textContent = Engine.state.streak.count;
    const reviewCount = Engine.state.reviewQueue.length;
    document.getElementById("stat-review").textContent = reviewCount;

    const nav = document.getElementById("block-nav");
    nav.innerHTML = "";
    BLOCKS.forEach(block=>{
      const stats = Engine.blockPracticeStats(block.id);
      const stars = Engine.blockStars(block.id);
      const btn = document.createElement("button");
      btn.className = "block-item" + (this._activeBlockId===block.id ? " active" : "");
      btn.innerHTML = `
        <div class="block-item-top">
          <span class="block-item-title">${block.title}</span>
          <span class="block-item-stars">${"★".repeat(stars)}${"☆".repeat(3-stars)}</span>
        </div>
        <div class="block-item-bar"><div class="block-item-bar-fill" style="width:${stats.percent}%"></div></div>
        <div class="block-item-sub">${stats.correct}/${stats.total} ejercicios dominados</div>
      `;
      btn.addEventListener("click", ()=> this.showBlockOverview(block.id));
      nav.appendChild(btn);
    });

    document.getElementById("pro-badge").hidden = !Pay.isPro();

    const reviewBtn = document.getElementById("btn-review");
    document.getElementById("review-count").textContent = reviewCount;
    reviewBtn.disabled = reviewCount === 0;
    reviewBtn.onclick = ()=> this.startSession("review", null);
  },

  // ---------------- home ----------------
  showHome(){
    document.body.classList.remove("in-session");
    this._activeBlockId = null;
    this.renderSidebar();
    const overall = Engine.overallPercent();
    let nextBlock = BLOCKS.find(b=>{
      const s = Engine.blockPracticeStats(b.id);
      return s.correct < s.total;
    }) || BLOCKS[0];

    $main.innerHTML = `
      <div class="home-hero">
        <div class="eyebrow">Tu progreso</div>
        <h1>Bienvenido de vuelta a Derivadas Dojo</h1>
        <p class="lead">Aprende haciendo: cada bloque tiene lecciones cortas, ejercicios guiados
        con pistas y explicación, y un mini-examen al final. Avanza en el orden que
        necesites para tu curso — tú eliges el bloque.</p>
        <div class="action-row">
          <button class="btn btn-primary" id="btn-continue">Continuar: ${nextBlock.title}</button>
        </div>
      </div>
      <div class="lesson-card">
        <div class="pay-head"><h2>Arcade</h2></div>
        <p class="lead">Práctica infinita con ejercicios nuevos al azar y vidas, y un examen
        cronometrado de 10 preguntas. Con Pro: vidas ilimitadas y exámenes sin límite diario.</p>
        <div class="action-row">
          <a class="btn btn-primary" href="arcade.html" style="text-decoration:none;display:inline-block">Entrar al Arcade</a>
        </div>
      </div>
      ${Pay.cardHTML()}
      <div class="lesson-card">
        <h2 style="font-size:15px;color:var(--text-dim);">Cómo leer los colores de las fórmulas</h2>
        <div class="color-legend">
          <span><span class="swatch" style="background:var(--amber)"></span> número</span>
          <span><span class="swatch" style="background:var(--accent)"></span> variable (x, y...)</span>
          <span><span class="swatch" style="background:var(--exp-color)"></span> exponente (lo que está arriba)</span>
          <span><span class="swatch" style="background:var(--func-color)"></span> función (sen, cos, ln...)</span>
        </div>
      </div>
      <div class="home-grid">
        <div class="home-card"><h3>Progreso general</h3><div class="big">${overall}%</div></div>
        <div class="home-card"><h3>Puntos</h3><div class="big">${Engine.state.points}</div></div>
        <div class="home-card"><h3>Racha de días</h3><div class="big">${Engine.state.streak.count}</div></div>
        <div class="home-card"><h3>Pendientes de repaso</h3><div class="big">${Engine.state.reviewQueue.length}</div></div>
      </div>
    `;
    document.getElementById("btn-continue").addEventListener("click", ()=> this.showBlockOverview(nextBlock.id));
    Pay.bind();
  },

  // Aviso al volver del checkout de Mercado Pago
  showPayResult(r){
    this.showHome();
    const texts = {
      ok: "¡Pago de prueba aprobado! Dojo Pro activado.",
      pending: "Tu pago quedó pendiente. Cuando se apruebe, vuelve a intentarlo.",
      rejected: "El pago fue rechazado o cancelado. No se cobró nada.",
      default: "No pudimos confirmar el pago. No se activó Pro."
    };
    const key = r.ok ? "ok" : (texts[r.status] ? r.status : "default");
    const div = document.createElement("div");
    div.className = "pay-notice " + (r.ok ? "pay-ok" : "pay-bad");
    div.textContent = texts[key] + (r.message ? " (" + r.message + ")" : "");
    $main.prepend(div);
  },

  // ---------------- block overview ----------------
  showBlockOverview(blockId){
    document.body.classList.remove("in-session");
    this._activeBlockId = blockId;
    this.renderSidebar();
    const block = BLOCKS.find(b=>b.id===blockId);
    const pStats = Engine.blockPracticeStats(blockId);
    const lStats = Engine.blockLessonStats(blockId);
    const stars = Engine.blockStars(blockId);
    const examBest = Engine.state.blocks[blockId].examBest;

    $main.innerHTML = `
      <div class="eyebrow">Bloque</div>
      <h1>${block.title}</h1>
      <p class="lead">${block.summary}</p>

      <div class="home-grid" style="margin:20px 0 28px;">
        <div class="home-card"><h3>Lecciones vistas</h3><div class="big">${lStats.done}/${lStats.total}</div></div>
        <div class="home-card"><h3>Ejercicios dominados</h3><div class="big">${pStats.correct}/${pStats.total}</div></div>
        <div class="home-card"><h3>Mini-examen</h3><div class="big">${"★".repeat(stars)}${"☆".repeat(3-stars)}</div></div>
      </div>

      <div class="lesson-card">
        <h2>1. Lecciones</h2>
        <p class="lead" style="margin-bottom:14px;">Repasa la teoría antes de practicar, o sáltatela si ya la dominas.</p>
        <div class="action-row" id="lesson-links"></div>
      </div>

      <div class="lesson-card">
        <h2>2. Práctica guiada</h2>
        <p class="lead" style="margin-bottom:14px;">Ejercicios con pistas y explicación completa cuando te equivocas. Así se aprende.</p>
        <div class="action-row">
          <button class="btn btn-primary" id="btn-practice">Practicar (${pStats.total} ejercicios)</button>
        </div>
      </div>

      <div class="lesson-card">
        <h2>3. Mini-examen</h2>
        <p class="lead" style="margin-bottom:14px;">Sin pistas, para medir si ya lo dominas tú solo. ${examBest ? `Mejor resultado: ${examBest.score}/${examBest.total}.` : "Aún no lo presentas."}</p>
        <div class="action-row">
          <button class="btn btn-amber" id="btn-exam">Presentar mini-examen (${block.exam.length} preguntas)</button>
        </div>
      </div>
    `;

    const lessonLinks = document.getElementById("lesson-links");
    block.lessons.forEach((lesson, idx)=>{
      const seen = Engine.state.blocks[blockId].lessonsSeen[idx];
      const b = document.createElement("button");
      b.className = "btn btn-ghost";
      b.textContent = (seen ? "✓ " : "") + lesson.title;
      b.addEventListener("click", ()=> this.showLesson(blockId, idx));
      lessonLinks.appendChild(b);
    });

    document.getElementById("btn-practice").addEventListener("click", ()=> this.startSession("practice", blockId));
    document.getElementById("btn-exam").addEventListener("click", ()=> this.startSession("exam", blockId));
  },

  // ---------------- lesson ----------------
  showLesson(blockId, idx){
    document.body.classList.remove("in-session");
    const block = BLOCKS.find(b=>b.id===blockId);
    const lesson = block.lessons[idx];
    Engine.markLessonSeen(blockId, idx);
    this.renderSidebar();

    const isLast = idx === block.lessons.length - 1;

    $main.innerHTML = `
      <div class="eyebrow">${block.title} · Lección ${idx+1} de ${block.lessons.length}</div>
      <div class="lesson-card">
        <h2>${lesson.title}</h2>
        <div class="lesson-body">${fixLesson(lesson.html)}</div>
        <div class="lesson-nav">
          <div class="lesson-dots">
            ${block.lessons.map((_,i)=>`<span class="lesson-dot${i===idx?' active':''}"></span>`).join("")}
          </div>
          <div class="action-row">
            ${idx>0 ? `<button class="btn btn-ghost" id="btn-prev">Anterior</button>` : ""}
            <button class="btn btn-primary" id="btn-next">${isLast ? "Ir a practicar" : "Siguiente"}</button>
          </div>
        </div>
      </div>
    `;

    if(idx>0) document.getElementById("btn-prev").addEventListener("click", ()=> this.showLesson(blockId, idx-1));
    document.getElementById("btn-next").addEventListener("click", ()=>{
      if(isLast) this.startSession("practice", blockId);
      else this.showLesson(blockId, idx+1);
    });
  },

  // ---------------- sesión de ejercicios (práctica / examen / repaso) ----------------
  startSession(mode, blockId){
    let list;
    if(mode === "review"){
      list = Engine.reviewItems().map(r => ({ blockId:r.blockId, exercise:r.exercise }));
      shuffle(list);
    } else {
      const block = BLOCKS.find(b=>b.id===blockId);
      const items = mode === "exam" ? block.exam : block.practice;
      list = items.map(ex => ({ blockId, exercise: ex }));
    }
    this.session = { mode, blockId, list, index:0, score:0, hintsUsed:0 };
    this.renderCurrentExercise();
  },

  renderCurrentExercise(){
    const s = this.session;
    s._checked = false;   // FIX: antes nunca se reiniciaba y congelaba el ejercicio siguiente
    window.scrollTo(0,0);
    document.body.classList.add("in-session");
    if(s.index >= s.list.length){
      return this.finishSession();
    }
    const item = s.list[s.index];
    const ex = item.exercise;
    if(ex.type === "guided") return this.renderGuided(item);
    const total = s.list.length;
    const pct = Math.round((s.index/total)*100);

    const kickerText = {
      practice: "Práctica guiada",
      exam: "Mini-examen",
      review: "Repaso de errores"
    }[s.mode];

    $main.innerHTML = `
      <div class="eyebrow">${kickerText} · ${s.index+1} de ${total}</div>
      <div class="progress-track"><div class="progress-track-fill" style="width:${pct}%"></div></div>
      <div class="exercise-card">
        <div class="exercise-kicker">${ex.kicker || ""}</div>
        ${this.formulaPanel(item.blockId)}
        ${ex.func ? `<div class="exercise-prompt"><span class="func">${m(ex.func)}</span></div>` : ""}
        ${ex.context ? `<div class="worked-steps">${ex.context.map(c=>`<div>${m(c)}</div>`).join("")}</div>` : ""}
        <div class="exercise-prompt">${rich(ex.prompt)}</div>
        <div id="answer-area"></div>
        <div id="hint-area"></div>
        <div id="feedback-area"></div>
        <div class="action-row" id="action-row">
          ${s.mode !== "exam" ? `<button class="btn btn-ghost" id="btn-hint" ${!ex.hints ? "disabled" : ""}>Pista</button>` : ""}
          <button class="btn btn-ghost" id="btn-explain-first" style="display:none;">¿Por qué?</button>
          <button class="btn btn-primary" id="btn-check">Verificar</button>
        </div>
      </div>
    `;

    const answerArea = document.getElementById("answer-area");
    let builderHandle = null;
    let selectedOption = null;

    if(ex.type === "mcq"){
      const opts = document.createElement("div");
      opts.className = "options";
      ex.options.forEach((opt, i)=>{
        const b = document.createElement("button");
        b.className = "option";
        b.innerHTML = m(opt.text);
        b.addEventListener("click", ()=>{
          if(s._checked) return;
          opts.querySelectorAll(".option").forEach(o=>o.classList.remove("selected"));
          b.classList.add("selected");
          selectedOption = i;
        });
        opts.appendChild(b);
      });
      answerArea.appendChild(opts);
    } else if(ex.type === "build"){
      const box = document.createElement("div");
      answerArea.appendChild(box);
      builderHandle = DragDrop.renderBuilder(box, ex.tokensCorrect, ex.tokensDistractors);
    }

    const nudge = (msg)=>{
      document.getElementById("feedback-area").innerHTML = `<div class="nudge" role="status">${msg}</div>`;
      const card = document.querySelector(".exercise-card");
      card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
    };

    let hintIndex = 0;
    const hintBtn = document.getElementById("btn-hint");
    if(hintBtn){
      hintBtn.addEventListener("click", ()=>{
        if(!ex.hints || hintIndex >= ex.hints.length) return;
        const hintArea = document.getElementById("hint-area");
        const box = document.createElement("div");
        box.className = "hint-box";
        box.innerHTML = `<strong>Pista ${hintIndex+1}:</strong> ${rich(ex.hints[hintIndex])}`;
        hintArea.appendChild(box);
        hintIndex++;
        s.hintsUsed++;
        if(hintIndex >= ex.hints.length) hintBtn.disabled = true;
      });
    }

    document.getElementById("btn-check").addEventListener("click", ()=>{
      if(s._checked) return;

      let correct = false;
      if(ex.type === "mcq"){
        if(selectedOption === null){ nudge("Elige una opción y luego toca Verificar."); return; }
        correct = !!ex.options[selectedOption].correct;
        const opts = answerArea.querySelectorAll(".option");
        opts.forEach((o,i)=>{
          o.disabled = true;
          if(ex.options[i].correct) o.classList.add("correct");
          else if(i===selectedOption) o.classList.add("incorrect");
        });
      } else if(ex.type === "build"){
        if(!builderHandle.isFull()){ nudge("Aún faltan fichas: completa tu respuesta y toca Verificar."); return; }
        const answer = builderHandle.getAnswer();
        correct = JSON.stringify(answer) === JSON.stringify(ex.tokensCorrect);
        builderHandle.lock();
        builderHandle.markResult(correct);
      }

      s._checked = true;
      if(correct) s.score++;

      if(s.mode !== "exam"){
        Engine.recordPractice(item.blockId, ex.id, correct);
      }
      this.renderSidebar();

      const fb = document.getElementById("feedback-area");
      fb.innerHTML = `
        <div class="feedback ${correct ? "ok" : "bad"}">
          <strong>${correct ? "¡Eso es!" : "Casi: mira este detalle"}</strong>
          ${rich(ex.explanation)}
          ${correct || s.mode === "exam" ? "" : '<div class="saved-note">↻ Quedó guardado en tu repaso. Equivocarse aquí es normal, y justo así se aprende.</div>'}
        </div>
      `;

      const actionRow = document.getElementById("action-row");
      actionRow.innerHTML = "";
      const nextBtn = document.createElement("button");
      nextBtn.className = "btn btn-primary btn-next " + (correct ? "right" : "wrong");
      nextBtn.textContent = s.index === s.list.length-1 ? "Ver resultados" : "Siguiente ejercicio";
      nextBtn.addEventListener("click", ()=>{
        s.index++;
        this.renderCurrentExercise();
      });
      actionRow.appendChild(nextBtn);
      nextBtn.focus({ preventScroll:true });
      fb.scrollIntoView({ behavior:"smooth", block:"nearest" });
      if(!correct){
        const st = document.getElementById("stat-review").parentElement;
        st.classList.remove("pulse"); void st.offsetWidth; st.classList.add("pulse");
      }
    });
  },

  // ---------------- hoja de fórmulas (visible en práctica Y examen) ----------------
  formulaPanel(blockId){
    const b = BLOCKS.find(x=>x.id===blockId);
    if(!b || !b.formulas) return "";
    return `<details class="formula-sheet" open><summary>📐 Hoja de fórmulas</summary>${
      b.formulas.map(f=>`<div class="formula-row"><span class="fname">${f.n}</span>${m(f.f)}</div>`).join("")}</details>`;
  },

  // ---------------- problema guiado: desarrollo paso a paso, como en papel ----------------
  renderGuided(item){
    const s = this.session, ex = item.exercise, exam = s.mode === "exam";
    const total = s.list.length, pct = Math.round((s.index/total)*100);
    const st = { i:0, err:0, done:[] };
    const $ = id => document.getElementById(id);
    const kick = { practice:"Práctica guiada", exam:"Mini-examen", review:"Repaso de errores" }[s.mode];
    $main.innerHTML = `
      <div class="eyebrow">${kick} · ${s.index+1} de ${total}</div>
      <div class="progress-track"><div class="progress-track-fill" style="width:${pct}%"></div></div>
      <div class="exercise-card">
        <div class="exercise-kicker">${ex.kicker || "Resuelve paso a paso"}</div>
        ${this.formulaPanel(item.blockId)}
        <div class="exercise-prompt"><span class="func">${m(ex.func)}</span></div>
        ${ex.prompt ? `<div class="exercise-prompt">${rich(ex.prompt)}</div>` : ""}
        <div class="worked-steps" id="g-done"></div>
        <div id="g-step"></div>
        <div id="feedback-area"></div>
        <div class="action-row" id="action-row"></div>
      </div>`;

    const drawDone = ()=>{
      $("g-done").innerHTML = st.done.length
        ? '<div class="g-title">Tu desarrollo</div>' + st.done.map(d=>`<div><span class="g-lbl">${rich(d.label)}</span> ${m(d.res)}</div>`).join("")
        : "";
    };
    const nudge = msg => {
      $("feedback-area").innerHTML = `<div class="nudge" role="status">${msg}</div>`;
      const c = document.querySelector(".exercise-card");
      c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake");
    };

    const showStep = ()=>{
      const sp = ex.steps[st.i], n = ex.steps.length;
      let sel = null, bh = null, opts = null;
      drawDone();
      $("feedback-area").innerHTML = "";
      $("g-step").innerHTML = `<div class="g-prompt"><span class="g-num">Paso ${st.i+1} de ${n}</span> ${rich(sp.prompt)}</div><div id="g-ans"></div><div id="g-hint"></div>`;
      const ans = $("g-ans");
      if(sp.options){
        opts = document.createElement("div"); opts.className = "options";
        shuffle(sp.options.slice()).forEach(o=>{
          const b = document.createElement("button"); b.className = "option"; b.innerHTML = m(o.text);
          b._o = o;
          b.addEventListener("click", ()=>{
            if(b.disabled) return;
            opts.querySelectorAll(".option").forEach(x=>x.classList.remove("selected"));
            b.classList.add("selected"); sel = b;
          });
          opts.appendChild(b);
        });
        ans.appendChild(opts);
      } else bh = DragDrop.renderBuilder(ans, sp.tokens, sp.distract || []);

      const row = $("action-row"); row.innerHTML = "";
      if(!exam && sp.hint){
        const hb = document.createElement("button"); hb.className = "btn btn-ghost"; hb.id = "btn-hint"; hb.textContent = "Pista";
        hb.addEventListener("click", ()=>{
          $("g-hint").innerHTML = `<div class="hint-box"><strong>Pista:</strong> ${rich(sp.hint)}</div>`;
          s.hintsUsed++; hb.disabled = true;
        });
        row.appendChild(hb);
      }
      const ck = document.createElement("button"); ck.className = "btn btn-primary"; ck.id = "btn-check"; ck.textContent = "Verificar paso";
      row.appendChild(ck);

      ck.addEventListener("click", ()=>{
        let ok;
        if(sp.options){
          if(!sel){ nudge("Elige una opción y toca Verificar."); return; }
          ok = !!sel._o.correct;
        } else {
          if(!bh.isFull()){ nudge("Completa tu respuesta con las fichas y toca Verificar."); return; }
          ok = JSON.stringify(bh.getAnswer()) === JSON.stringify(sp.tokens);
        }
        const fb = $("feedback-area");
        if(!ok){
          st.err++;
          fb.innerHTML = `<div class="feedback bad"><strong>Todavía no.</strong> ${exam ? "Revisa la hoja de fórmulas e inténtalo de nuevo." : rich(sp.why)}</div>`;
          if(sp.options){ sel.classList.remove("selected"); sel.classList.add("incorrect"); sel.disabled = true; sel = null; }
          else { bh.lock(); ans.innerHTML = ""; bh = DragDrop.renderBuilder(ans, sp.tokens, sp.distract || []); }
          return;
        }
        if(sp.options){
          opts.querySelectorAll(".option").forEach(x=>{ x.disabled = true; if(x._o.correct) x.classList.add("correct"); });
        } else { bh.lock(); bh.markResult(true); }
        st.done.push({ label: sp.label, res: sp.res });
        fb.innerHTML = `<div class="feedback ok"><strong>¡Correcto!</strong> ${rich(sp.why)}</div>`;
        row.innerHTML = "";
        const nx = document.createElement("button"); nx.className = "btn btn-primary btn-next right";
        nx.textContent = st.i === n-1 ? "Terminar problema" : "Siguiente paso";
        nx.addEventListener("click", ()=>{ st.i++; st.i < n ? showStep() : finish(); });
        row.appendChild(nx); nx.focus({ preventScroll:true });
        fb.scrollIntoView({ behavior:"smooth", block:"nearest" });
      });
    };

    const finish = ()=>{
      const good = st.err === 0;
      if(good) s.score++;
      if(!exam) Engine.recordPractice(item.blockId, ex.id, good);
      this.renderSidebar();
      drawDone();
      $("g-step").innerHTML = "";
      $("feedback-area").innerHTML = `<div class="feedback ${good ? "ok" : "bad"}">
        <strong>${good ? "¡Problema resuelto sin errores!" : `Resuelto, con ${st.err} intento${st.err>1?"s":""} fallido${st.err>1?"s":""}`}</strong>
        ${rich(ex.explanation)}
        ${good || exam ? "" : '<div class="saved-note">↻ Quedó en tu repaso para que lo repitas hasta que salga limpio.</div>'}</div>`;
      const row = $("action-row"); row.innerHTML = "";
      const nx = document.createElement("button"); nx.className = "btn btn-primary btn-next " + (good ? "right" : "wrong");
      nx.textContent = s.index === s.list.length-1 ? "Ver resultados" : "Siguiente problema";
      nx.addEventListener("click", ()=>{ s.index++; this.renderCurrentExercise(); });
      row.appendChild(nx); nx.focus({ preventScroll:true });
    };
    showStep();
  },

  finishSession(){
    document.body.classList.remove("in-session");
    const s = this.session;
    $main.innerHTML = `<div class="result-hero"><p>Calculando resultados…</p></div>`;

    if(s.mode === "exam"){
      const stars = Engine.recordExam(s.blockId, s.score, s.list.length);
      const block = BLOCKS.find(b=>b.id===s.blockId);
      this.renderSidebar();
      $main.innerHTML = `
        <div class="result-hero">
          <div class="eyebrow">Mini-examen · ${block.title}</div>
          <div class="result-score">${s.score}/${s.list.length}</div>
          <div class="result-stars">${"★".repeat(stars)}${"☆".repeat(3-stars)}</div>
          <p class="lead" style="margin:0 auto 18px;">
            ${stars===3 ? "Dominas este bloque. ¡Listo para el examen real!" :
              stars===2 ? "Vas muy bien. Repasa lo que fallaste y vuelve a intentarlo." :
              stars===1 ? "Vas en camino. Vuelve a la práctica guiada antes de reintentar." :
              "No te desanimes: vuelve a las lecciones y a la práctica guiada, y vuelve a intentarlo."}
          </p>
          <div class="action-row" style="justify-content:center;">
            <button class="btn btn-ghost" id="btn-back">Volver al bloque</button>
            <button class="btn btn-primary" id="btn-retry">Reintentar examen</button>
          </div>
        </div>
      `;
      document.getElementById("btn-back").addEventListener("click", ()=> this.showBlockOverview(s.blockId));
      document.getElementById("btn-retry").addEventListener("click", ()=> this.startSession("exam", s.blockId));
    } else {
      this.renderSidebar();
      const label = s.mode === "review" ? "Repaso de errores" : "Práctica guiada";
      $main.innerHTML = `
        <div class="result-hero">
          <div class="eyebrow">${label}</div>
          <div class="result-score">${s.score}/${s.list.length}</div>
          <p class="lead" style="margin:0 auto 18px;">Sesión completada. Tu progreso ya quedó guardado.</p>
          <div class="action-row" style="justify-content:center;">
            ${s.blockId ? `<button class="btn btn-ghost" id="btn-back">Volver al bloque</button>` : `<button class="btn btn-ghost" id="btn-home">Ir al inicio</button>`}
            <button class="btn btn-primary" id="btn-retry">Repetir</button>
          </div>
        </div>
      `;
      const backBtn = document.getElementById("btn-back") || document.getElementById("btn-home");
      backBtn.addEventListener("click", ()=> s.blockId ? this.showBlockOverview(s.blockId) : this.showHome());
      document.getElementById("btn-retry").addEventListener("click", ()=> this.startSession(s.mode, s.blockId));
    }
  }
};
