/* GET /api/diagnostico-ia
   Prueba rápida: manda un mensaje diminuto (texto y con una imagen de 1 px) a CADA
   proveedor configurado, en paralelo, y dice cuánto tardó y si funcionó.
   Ábrelo en el navegador: https://TU-SITIO.vercel.app/api/diagnostico-ia
   Si "proveedores" sale vacío, no hay ninguna API key configurada. */

const { send, available, ping, ORDER } = require("../lib/ai");

module.exports = async (req, res) => {
  try{
    const list = available({ vision: true });
    const jobs = [];
    for(const p of list){ jobs.push(ping(p, false), ping(p, true)); }
    const resultados = await Promise.all(jobs);
    send(res, 200, {
      nota: "ms = milisegundos. Normal: < 3000 con texto y < 6000 con imagen. Un proveedor con ok:false o muy lento se salta solo en el Escáner.",
      orden: ORDER,
      proveedores: list.map(p => p.name),
      resultados
    });
  }catch(e){
    send(res, e.status || 500, { ok: false, error: e.message });
  }
};
