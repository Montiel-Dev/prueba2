/* GET /api/diagnostico-ia
   Prueba rápida: manda un mensaje diminuto (texto y con una imagen de 1 px) a CADA
   proveedor configurado, en paralelo, y dice cuánto tardó y si funcionó.
   Ábrelo en el navegador: https://TU-SITIO.vercel.app/api/diagnostico-ia
   Si "proveedores" sale vacío, no hay ninguna API key configurada. */

const crypto = require("crypto");
const { send, available, ping, ORDER, PROVIDERS } = require("../lib/ai");
const { rateLimit } = require("../lib/pro");

module.exports = async (req, res) => {
  try{
    // Protegido: cada visita gasta llamadas reales a la IA. Solo funciona con la clave DIAG_KEY:
    //   https://TU-SITIO.vercel.app/api/diagnostico-ia?clave=TU_DIAG_KEY
    const key = process.env.DIAG_KEY || "";
    if(key.length < 8) return send(res, 403, { ok: false, error: "Diagnóstico desactivado. Define DIAG_KEY (mín. 8 caracteres) en Vercel para usarlo." });
    const given = String(new URL(req.url || "/", "http://x").searchParams.get("clave") || "");
    const a = Buffer.from(given), b = Buffer.from(key);
    if(a.length !== b.length || !crypto.timingSafeEqual(a, b)) return send(res, 403, { ok: false, error: "Clave incorrecta." });
    rateLimit(req);
    const list = available({ vision: true });
    const jobs = [];
    for(const p of list){ jobs.push(ping(p, false), ping(p, true)); }
    const resultados = await Promise.all(jobs);
    send(res, 200, {
      nota: "ms = milisegundos. Normal: < 3000 con texto y < 6000 con imagen. Un proveedor con ok:false o muy lento se salta solo en el Escáner.",
      orden: ORDER,
      proveedores: list.map(p => p.name),
      sin_api_key: ORDER.filter(n => PROVIDERS[n] && !process.env[PROVIDERS[n].keyEnv]),
      modelos: list.map(p => ({ proveedor: p.name, vision: p.visionModel, texto: p.textModel })),
      resultados
    });
  }catch(e){
    send(res, e.status || 500, { ok: false, error: e.message });
  }
};
