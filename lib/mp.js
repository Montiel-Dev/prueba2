/* =========================================================
   Utilidades compartidas para hablar con Mercado Pago.
   Solo se usa en el servidor (carpeta api/). El token NUNCA
   debe llegar al navegador.
   ========================================================= */

const API = "https://api.mercadopago.com";

const PRICE = 49;            // precio fijo de "Dojo Pro" (se valida en el servidor)
const CURRENCY = "MXN";
const REF_PREFIX = "dojo-pro-";

function httpError(status, message, extra){
  const e = new Error(message);
  e.status = status;
  e.extra = extra;
  return e;
}

function send(res, status, body){
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function token(){
  const t = process.env.MP_ACCESS_TOKEN;
  if(!t) throw httpError(500, "Falta la variable de entorno MP_ACCESS_TOKEN (ver README).");
  return t;
}

async function mp(path, opts = {}){
  const r = await fetch(API + path, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...(opts.headers || {})
    }
  });
  const data = await r.json().catch(()=> ({}));
  if(!r.ok) throw httpError(r.status, data.message || "Error de Mercado Pago", data);
  return data;
}

/* ---------------------------------------------------------
   Candado de simulación: antes de crear o verificar cualquier
   cosa, preguntamos a Mercado Pago de quién es el token. Si la
   cuenta NO es un usuario de prueba, se aborta. Así, aunque
   alguien pegue por error el token de tu cuenta real, no se
   puede cobrar dinero de verdad desde esta app.
   --------------------------------------------------------- */
let _seller = null;
async function assertTestSeller(){
  if(_seller) return _seller;
  const me = await mp("/users/me");
  const tags = Array.isArray(me.tags) ? me.tags : [];
  const looksTest =
    tags.includes("test_user") ||
    /^TEST/i.test(me.nickname || "") ||
    /@testuser\.com$/i.test(me.email || "");
  if(!looksTest){
    throw httpError(403,
      "Bloqueado: el MP_ACCESS_TOKEN no es de una cuenta de prueba. " +
      "Usa el token de tu usuario VENDEDOR de prueba (ver README).");
  }
  _seller = me;
  return me;
}

function baseUrl(req){
  if(process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "");
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${req.headers.host}`;
}

module.exports = { PRICE, CURRENCY, REF_PREFIX, httpError, send, mp, assertTestSeller, baseUrl };
