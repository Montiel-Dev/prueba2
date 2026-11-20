/* GET /api/verify-payment?payment_id=...&ref=...
   Le pregunta a Mercado Pago (no al navegador) si ese pago existe y
   está aprobado. Es lo que evita que alguien active Pro escribiendo
   una URL a mano. */
const { PRICE, CURRENCY, REF_PREFIX, send, mp, assertTestSeller } = require("../lib/mp");

module.exports = async (req, res) => {
  if(req.method !== "GET") return send(res, 405, { error: "Método no permitido" });
  try{
    const url = new URL(req.url, "http://x");
    const id = url.searchParams.get("payment_id") || "";
    const ref = url.searchParams.get("ref") || "";

    if(!/^\d{3,20}$/.test(id) || !ref.startsWith(REF_PREFIX)){
      return send(res, 400, { ok: false, error: "Datos de pago inválidos" });
    }

    const seller = await assertTestSeller();
    const p = await mp(`/v1/payments/${id}`);

    const matches =
      p.external_reference === ref &&
      String(p.collector_id) === String(seller.id) &&
      Number(p.transaction_amount) === PRICE &&
      p.currency_id === CURRENCY;

    if(!matches) return send(res, 200, { ok: false, status: "mismatch" });
    if(p.status !== "approved") return send(res, 200, { ok: false, status: p.status });

    send(res, 200, { ok: true, status: p.status, paymentId: p.id, amount: p.transaction_amount, currency: p.currency_id });
  }catch(e){
    send(res, e.status || 500, { ok: false, error: e.message });
  }
};
