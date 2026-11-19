/* Pruebas del candado Pro de v5 (sin red; Mercado Pago simulado). Correr: node --test tests/pro.test.js */
const assert = require("assert"); const test = require("node:test"); const crypto = require("crypto");
const ENV = ["PRO_SECRET","PRO_FREE_TEST","PRO_REQUIRED","RATE_MAX","RATE_WINDOW_S","MP_ACCESS_TOKEN","GROQ_API_KEY"];
function setup(env = {}){
  ENV.forEach(k => delete process.env[k]); Object.assign(process.env, env);
  Object.keys(require.cache).forEach(k => { if(/[\\/](lib|api)[\\/]/.test(k)) delete require.cache[k]; });
}
const SECRET = "un-secreto-largo-y-aleatorio-123456";
const req = (headers = {}, body = {}, method = "POST") => ({ method, headers, body });
const call = async (h, r) => new Promise(async resolve => {
  const res = { setHeader(){}, end(t){ resolve({ status: this.statusCode, body: JSON.parse(t) }); } }; await h(r, res); });
const J = (s, b) => ({ ok: s < 300, status: s, json: async () => b });
const b64 = o => Buffer.from(JSON.stringify(o)).toString("base64url");

test("guard: sin PRO_REQUIRED el Escáner sigue libre", () => {
  setup({ PRO_SECRET: SECRET }); const { guard } = require("../lib/pro");
  assert.doesNotThrow(() => guard(req()));
});
test("guard: aunque PRO_REQUIRED=1, el Escáner sigue libre (sin pase)", () => {
  setup({ PRO_SECRET: SECRET, PRO_REQUIRED: "1" }); const { guard } = require("../lib/pro");
  assert.doesNotThrow(() => guard(req()));
});
test("pase válido pasa; alterado / vencido / de otro secreto se rechazan", () => {
  setup({ PRO_SECRET: SECRET, PRO_REQUIRED: "1" }); const { guard, issue, verify } = require("../lib/pro");
  const { token } = issue();
  assert.doesNotThrow(() => guard(req({ "x-pro-token": token })));
  const [body, sig] = token.split(".");
  const forged = b64({ exp: Date.now() + 999 * 864e5 }) + "." + sig;          // alargar la fecha conservando la firma
  assert.strictEqual(verify(forged), null);
  assert.strictEqual(verify(body + "." + sig.slice(0, -2) + "xx"), null);       // firma alterada
  assert.strictEqual(verify(body), null); assert.strictEqual(verify(""), null); assert.strictEqual(verify("a.b.c"), null);
  const old = issue(-1).token; assert.strictEqual(verify(old), null);           // vencido
  const other = body + "." + crypto.createHmac("sha256", "otro-secreto-distinto-99").update(body).digest("base64url");
  assert.strictEqual(verify(other), null);
  // pase con "alg:none"-style (sin firma) tampoco
  assert.strictEqual(verify(b64({ exp: Date.now() + 1e9 }) + "."), null);
});
test("sin PRO_SECRET: ningún pase es válido y no se puede emitir", () => {
  setup({ PRO_REQUIRED: "1" }); const { verify, issue } = require("../lib/pro");
  assert.throws(() => issue(), e => e.status === 500);
  assert.strictEqual(verify("a.b"), null);
});
test("límite por IP: 429 tras RATE_MAX; otra IP no se afecta", () => {
  setup({ PRO_SECRET: SECRET, RATE_MAX: "3" }); const { guard } = require("../lib/pro");
  const a = () => req({ "x-forwarded-for": "1.1.1.1" });
  guard(a()); guard(a()); guard(a());
  assert.throws(() => guard(a()), e => e.status === 429);
  assert.doesNotThrow(() => guard(req({ "x-forwarded-for": "2.2.2.2" })));
});
test("pro-activar: FREE_TEST da pase; sin FREE_TEST y sin pago -> 403", async () => {
  setup({ PRO_SECRET: SECRET, PRO_FREE_TEST: "1" }); let h = require("../api/pro-activar");
  const r = await call(h, req({}, {})); assert.strictEqual(r.status, 200); assert(r.body.token);
  setup({ PRO_SECRET: SECRET }); h = require("../api/pro-activar");
  assert.strictEqual((await call(h, req({}, {}))).status, 403);
  assert.strictEqual((await call(h, req({}, { payment_id: "SIM-123", ref: "x" }))).status, 403);
  assert.strictEqual((await call(h, req({}, {}, "GET"))).status, 405);
});
test("pro-activar con Mercado Pago: valida pago, monto, vendedor y estado", async () => {
  setup({ PRO_SECRET: SECRET, MP_ACCESS_TOKEN: "TEST-x" }); const h = require("../api/pro-activar");
  let pay = { status: "approved", external_reference: "dojo-pro-abc", collector_id: 7, transaction_amount: 49, currency_id: "MXN" };
  global.fetch = async url => url.endsWith("/users/me") ? J(200, { id: 7, tags: ["test_user"] }) : J(200, pay);
  const body = { payment_id: "123456", ref: "dojo-pro-abc" };
  assert.strictEqual((await call(h, req({}, body))).status, 200);
  for(const bad of [{ status: "pending" }, { transaction_amount: 1 }, { collector_id: 9 }, { currency_id: "USD" }, { external_reference: "dojo-pro-otro" }]){
    pay = { status: "approved", external_reference: "dojo-pro-abc", collector_id: 7, transaction_amount: 49, currency_id: "MXN", ...bad };
    assert.strictEqual((await call(h, req({}, body))).status, 403, JSON.stringify(bad));
  }
});
test("HALLAZGO: un mismo pago aprobado puede canjearse muchas veces (sin registro de usados)", async () => {
  setup({ PRO_SECRET: SECRET, MP_ACCESS_TOKEN: "TEST-x" }); const h = require("../api/pro-activar");
  global.fetch = async url => url.endsWith("/users/me") ? J(200, { id: 7, tags: ["test_user"] }) : J(200, { status: "approved", external_reference: "dojo-pro-abc", collector_id: 7, transaction_amount: 49, currency_id: "MXN" });
  const body = { payment_id: "123456", ref: "dojo-pro-abc" };
  const rs = await Promise.all([1, 2, 3, 4, 5].map(() => call(h, req({}, body))));
  assert(rs.every(r => r.status === 200 && r.body.token), "se emitieron 5 pases con 1 pago");
});
test("v6: /api/pro-activar ahora tiene límite por IP", async () => {
  setup({ PRO_SECRET: SECRET, PRO_FREE_TEST: "1", RATE_MAX: "3" }); const h = require("../api/pro-activar");
  const r = () => req({ "x-forwarded-for": "9.9.9.9" }, {});
  for(let i = 0; i < 3; i++) assert.strictEqual((await call(h, r())).status, 200);
  assert.strictEqual((await call(h, r())).status, 429);
});
test("v6: /api/diagnostico-ia exige DIAG_KEY, clave correcta y respeta el límite", async () => {
  setup({ PRO_SECRET: SECRET, RATE_MAX: "2", GROQ_API_KEY: "k" }); let h = require("../api/diagnostico-ia");
  let llamadas = 0; global.fetch = async () => { llamadas++; return J(200, { choices: [{ message: { content: "{}" } }] }); };
  const g = (q) => ({ method: "GET", url: "/api/diagnostico-ia" + q, headers: { "x-forwarded-for": "8.8.8.8" }, body: {} });
  assert.strictEqual((await call(h, g(""))).status, 403);                       // sin DIAG_KEY definida: desactivado
  setup({ PRO_SECRET: SECRET, RATE_MAX: "2", GROQ_API_KEY: "k", DIAG_KEY: "clave-diag-123" }); h = require("../api/diagnostico-ia");
  assert.strictEqual((await call(h, g(""))).status, 403);
  assert.strictEqual((await call(h, g("?clave=mala"))).status, 403);
  assert.strictEqual(llamadas, 0, "sin clave no se gasta ninguna llamada a la IA");
  assert.strictEqual((await call(h, g("?clave=clave-diag-123"))).status, 200);
  assert(llamadas > 0);
  await call(h, g("?clave=clave-diag-123"));
  assert.strictEqual((await call(h, g("?clave=clave-diag-123"))).status, 429);
});
test("/api/leer y /api/variantes: libres sin pase y respetan el límite", async () => {
  setup({ PRO_SECRET: SECRET, PRO_REQUIRED: "1", RATE_MAX: "5", GROQ_API_KEY: "k" });
  const leer = require("../api/leer"), variantes = require("../api/variantes"), { issue } = require("../lib/pro");
  global.fetch = async () => J(200, { choices: [{ message: { content: JSON.stringify({ ok: true, texto: "Deriva: f(x)=x^2" }) } }] });
  const img = { image: "data:image/jpeg;base64,/9j/4AAQ", mime: "image/jpeg" };
  const sin = await call(leer, req({ "x-forwarded-for": "3.3.3.3" }, img)); assert.strictEqual(sin.status, 200);
  const con = await call(leer, req({ "x-forwarded-for": "3.3.3.3", "x-pro-token": issue().token }, img)); assert.strictEqual(con.status, 200);
  const v = await call(variantes, req({ "x-forwarded-for": "3.3.3.3" }, { texto: "Deriva: f(x)=x^2" })); assert.notStrictEqual(v.status, 402);
  for(let i = 0; i < 3; i++) await call(leer, req({ "x-forwarded-for": "3.3.3.3" }, img));
  assert.strictEqual((await call(leer, req({ "x-forwarded-for": "3.3.3.3" }, img))).status, 429);
});
