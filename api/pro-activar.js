/* POST /api/pro-activar   body: { payment_id?, ref? }
   Entrega un pase Pro firmado (30 días).
   - PRO_FREE_TEST=1  -> lo da gratis (solo para pruebas/demo).
   - si no            -> exige un pago aprobado de Mercado Pago (verificado aquí, en el servidor). */
const { send, jsonBody } = require("../lib/ai");
const { issue, rateLimit } = require("../lib/pro");
const { PRICE, CURRENCY, REF_PREFIX, mp, assertTestSeller } = require("../lib/mp");

module.exports = async (req, res) => {
  if(req.method !== "POST") return send(res, 405, { ok: false, error: "Método no permitido" });
  try{
    rateLimit(req);
    if(process.env.PRO_FREE_TEST !== "1"){
      const { payment_id: id = "", ref = "" } = jsonBody(req);
      if(!/^\d{3,20}$/.test(String(id)) || !String(ref).startsWith(REF_PREFIX))
        return send(res, 403, { ok: false, error: "Se necesita un pago aprobado para activar Pro." });
      const seller = await assertTestSeller();
      const p = await mp(`/v1/payments/${id}`);
      const ok = p.status === "approved" && p.external_reference === ref &&
        String(p.collector_id) === String(seller.id) && Number(p.transaction_amount) === PRICE && p.currency_id === CURRENCY;
      if(!ok) return send(res, 403, { ok: false, error: "El pago no es válido." });
    }
    send(res, 200, { ok: true, ...issue() });
  }catch(e){
    send(res, e.status || 500, { ok: false, error: e.message });
  }
};
