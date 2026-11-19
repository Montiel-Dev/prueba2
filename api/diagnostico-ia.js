/* GET /api/diagnostico-ia
   Prueba rápida (tarda como máximo ~25 s) para saber DÓNDE está la lentitud:
   manda un mensaje diminuto (solo texto y con una imagen de 1 píxel) al modelo
   principal y al de respaldo, y devuelve cuánto tardó cada uno.
   Ábrelo en el navegador: https://TU-SITIO.vercel.app/api/diagnostico-ia
   Es seguro de dejar (gasta casi nada), pero puedes borrar este archivo
   cuando el escáner ya funcione bien. */

const { send, MODEL, FALLBACK_MODEL, ping } = require("../lib/ai");

module.exports = async (req, res) => {
  try{
    const models = [MODEL];
    if(FALLBACK_MODEL && FALLBACK_MODEL !== MODEL) models.push(FALLBACK_MODEL);
    const jobs = [];
    for(const m of models){ jobs.push(ping(m, false), ping(m, true)); }
    const results = await Promise.all(jobs);
    send(res, 200, {
      nota: "ms = milisegundos. Normal: menos de 5000 (5 s) con texto y menos de 8000 con imagen.",
      resultados: results
    });
  }catch(e){
    send(res, e.status || 500, { ok:false, error: e.message });
  }
};
