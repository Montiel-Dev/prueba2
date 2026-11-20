/* POST /api/create-preference
   Crea una "preferencia" de Checkout Pro y devuelve la URL a la que
   hay que mandar al usuario para pagar. */
const crypto = require("crypto");
const { PRICE, CURRENCY, REF_PREFIX, send, mp, assertTestSeller, baseUrl } = require("../lib/mp");

module.exports = async (req, res) => {
  if(req.method !== "POST") return send(res, 405, { error: "Método no permitido" });
  try{
    await assertTestSeller();

    const ref = REF_PREFIX + crypto.randomUUID();
    const base = baseUrl(req);

    const body = {
      items: [{
        id: "dojo-pro",
        title: "Derivadas Dojo Pro (pago simulado)",
        quantity: 1,
        unit_price: PRICE,
        currency_id: CURRENCY
      }],
      external_reference: ref,
      back_urls: {
        success: `${base}/?pago=ok`,
        pending: `${base}/?pago=ok`,
        failure: `${base}/?pago=error`
      },
      statement_descriptor: "DOJO PRO"
    };
    // Mercado Pago solo acepta auto_return con URLs https públicas
    if(base.startsWith("https://")) body.auto_return = "approved";

    const pref = await mp("/checkout/preferences", { method: "POST", body: JSON.stringify(body) });
    // Con credenciales de un vendedor de prueba, init_point es el link correcto
    send(res, 200, { url: pref.init_point, ref });
  }catch(e){
    send(res, e.status || 500, { error: e.message });
  }
};
