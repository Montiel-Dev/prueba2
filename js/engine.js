/* =========================================================
   ASTRO-matiks — motor de estado
   Maneja puntos, racha, progreso por bloque y la cola de
   repaso (ejercicios fallados). Todo se guarda en
   localStorage para que el progreso persista entre sesiones.
   ========================================================= */

const STORAGE_KEY = "astro-matiks-state-v1";

function defaultState(){
  return {
    points: 0,
    streak: { count: 0, lastDate: null },
    blocks: {}, // blockId -> { practice:{exId:true/false correct}, examBest:{score,total} }
    reviewQueue: [] // [{blockId, exId}]
  };
}

const Engine = {
  state: null,

  load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      this.state = raw ? JSON.parse(raw) : defaultState();
    }catch(e){
      this.state = defaultState();
    }
    // asegurar estructura para cada bloque
    BLOCKS.forEach(b=>{
      if(!this.state.blocks[b.id]){
        this.state.blocks[b.id] = { practice:{}, examBest:null, lessonsSeen:{} };
      }
    });
    this._touchStreak();
    this.save();
  },

  save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  },

  _todayStr(){
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  },

  _touchStreak(){
    const today = this._todayStr();
    const s = this.state.streak;
    if(s.lastDate === today) return; // ya contó hoy
    if(!s.lastDate){
      s.count = 1; s.lastDate = today; return;
    }
    const toDate = (str)=>{ const [y,mo,d] = str.split("-").map(Number); return new Date(y, mo-1, d); };
    const prev = toDate(s.lastDate);
    const now = toDate(today);
    const diffDays = Math.round((now - prev) / 86400000);
    if(diffDays === 1){ s.count += 1; }
    else if(diffDays > 1){ s.count = 1; }
    s.lastDate = today;
  },

  addPoints(n){
    this.state.points += n;
    this.save();
  },

  findExercise(blockId, exId){
    const block = BLOCKS.find(b=>b.id===blockId);
    if(!block) return null;
    return block.practice.find(e=>e.id===exId) || block.exam.find(e=>e.id===exId) || null;
  },

  recordPractice(blockId, exId, correct){
    const b = this.state.blocks[blockId];
    b.practice[exId] = correct;
    const inQueue = this.state.reviewQueue.some(r=>r.blockId===blockId && r.exId===exId);
    if(!correct && !inQueue){
      this.state.reviewQueue.push({blockId, exId});
    } else if(correct && inQueue){
      this.state.reviewQueue = this.state.reviewQueue.filter(r=>!(r.blockId===blockId && r.exId===exId));
    }
    this.addPoints(correct ? 10 : 2); // intentar también da algo de puntos, acertar da más
  },

  // Guarda el mejor resultado (por porcentaje) y lo devuelve
  recordExam(blockId, score, total){
    const pct = total>0 ? Math.round(score/total*100) : 0;
    const b = this.state.blocks[blockId];
    const prev = b.examBest && b.examBest.total ? b.examBest.score/b.examBest.total*100 : -1;
    if(pct > prev) b.examBest = { score, total };
    this.addPoints(score * 15);
    this.save();
    return pct;
  },

  markLessonSeen(blockId, idx){
    this.state.blocks[blockId].lessonsSeen[idx] = true;
    this.save();
  },

  blockLessonStats(blockId){
    const block = BLOCKS.find(b=>b.id===blockId);
    const seen = this.state.blocks[blockId].lessonsSeen;
    const total = block.lessons.length;
    const done = Object.keys(seen).length;
    return { total, done };
  },

  blockPracticeStats(blockId){
    const block = BLOCKS.find(b=>b.id===blockId);
    const b = this.state.blocks[blockId];
    const total = block.practice.length;
    const done = Object.keys(b.practice).length;
    const correct = Object.values(b.practice).filter(Boolean).length;
    return { total, done, correct, percent: total ? Math.round((correct/total)*100) : 0 };
  },

  // Peso de cada sección en el % de un bloque
  WEIGHTS: { lessons:0.2, practice:0.4, exam:0.4 },

  // % por sección: lecciones vistas, ejercicios dominados, mejor mini-examen
  sectionPercents(blockId){
    const l = this.blockLessonStats(blockId), p = this.blockPracticeStats(blockId);
    const e = this.state.blocks[blockId].examBest;
    return {
      lessons: l.total ? Math.round(l.done/l.total*100) : 0,
      practice: p.percent,
      exam: e && e.total ? Math.round(e.score/e.total*100) : 0
    };
  },

  blockPercent(blockId){
    const s = this.sectionPercents(blockId), w = this.WEIGHTS;
    return Math.round(s.lessons*w.lessons + s.practice*w.practice + s.exam*w.exam);
  },

  // % total de la materia = promedio de los % de todos los bloques
  overallPercent(){
    return BLOCKS.length ? Math.round(BLOCKS.reduce((n,b)=> n + this.blockPercent(b.id), 0) / BLOCKS.length) : 0;
  },

  reviewItems(){
    return this.state.reviewQueue
      .map(r => ({ ...r, exercise: this.findExercise(r.blockId, r.exId) }))
      .filter(r => r.exercise);
  }
};
