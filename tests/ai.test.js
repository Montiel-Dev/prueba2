/* Pruebas del backend del Escáner (sin red: se simula fetch).
   Correr:  node tests/ai.test.js        */
const assert = require("assert");
const test = require("node:test");

const KEYS = ["GROQ_API_KEY","GEMINI_API_KEY","MISTRAL_API_KEY","OPENROUTER_API_KEY","ANTHROPIC_API_KEY"];
function setup(keys, env = {}){
  KEYS.forEach(k => delete process.env[k]); delete process.env.AI_HEDGE_MS; delete process.env.AI_DEBUG; Object.assign(process.env, env);
  keys.forEach(k => process.env[k] = "test-key");
  Object.keys(require.cache).forEach(k => { if(/[\\/](lib|api)[\\/]/.test(k)) delete require.cache[k]; });
  return require("../lib/ai");
}
const J = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const openaiOk = text => J(200, { choices: [{ message: { content: text } }] });
const geminiOk = text => J(200, { candidates: [{ content: { parts: [{ text }] } }] });
const hang = (opts) => new Promise((_, rej) => opts.signal.addEventListener("abort", () => { const e = new Error("abort"); e.name = "AbortError"; rej(e); }));
const host = u => new URL(u).host;
const OK_VAR = JSON.stringify({ tema: "regla de la cadena", nivel: 2, variantes: [
  { enunciado: "Deriva: f(x) = (2x+1)^3", pasos: ["a", "b", "c"], resultado: "f'(x) = 6(2x+1)^2" },
  { enunciado: "Deriva: f(x) = (x^2+3)^4", pasos: ["a", "b", "c"], resultado: "f'(x) = 8x(x^2+3)^3" }] });

test("Groq con modelo retirado -> cae a Gemini rápido", async () => {
  const ai = setup(["GROQ_API_KEY", "GEMINI_API_KEY"]);
  global.fetch = async (url, o) => host(url).includes("groq") ? J(404, { error: { message: "The model `x` has been decommissioned" } }) : geminiOk('{"ok":true,"texto":"Deriva: f(x)=x^2"}');
  const t0 = Date.now();
  const { json, meta } = await ai.run({ vision: true, system: "s", user: "u", image: { mime: "image/jpeg", base64: "AA" }, maxTokens: 50, totalMs: 5000, hedgeMs: 3000, validate: j => { if(!j.texto) throw new Error("x"); } });
  assert.strictEqual(meta.provider, "gemini");
  assert(Date.now() - t0 < 500, "debe saltar al siguiente de inmediato, no esperar el hedge");
});

test("Solo Groq y modelo retirado -> mensaje claro (no 'tardó')", async () => {
  const ai = setup(["GROQ_API_KEY"]);
  global.fetch = async () => J(404, { error: { message: "model_not_found" } });
  await assert.rejects(ai.run({ vision: false, system: "s", user: "u", maxTokens: 50, totalMs: 3000 }), e => {
    assert.strictEqual(e.status, 502); assert(/retirado/.test(e.message), e.message); assert(/groq/.test(e.extra.detalle)); return true; });
});

test("API key inválida -> mensaje de key", async () => {
  const ai = setup(["GROQ_API_KEY"]);
  global.fetch = async () => J(401, { error: { message: "Invalid API Key" } });
  await assert.rejects(ai.run({ vision: false, system: "s", user: "u", maxTokens: 50, totalMs: 3000 }), e => { assert(/key/i.test(e.message)); return true; });
});

test("Todos 429 -> 429 con mensaje de límite", async () => {
  const ai = setup(["GROQ_API_KEY", "GEMINI_API_KEY"]);
  global.fetch = async () => J(429, { error: { message: "rate limit" } });
  await assert.rejects(ai.run({ vision: false, system: "s", user: "u", maxTokens: 50, totalMs: 3000 }), e => { assert.strictEqual(e.status, 429); return true; });
});

test("Proveedor colgado -> a los hedgeMs entra el siguiente y gana", async () => {
  const ai = setup(["GROQ_API_KEY", "GEMINI_API_KEY"], { AI_HEDGE_MS: "300" });
  global.fetch = async (url, o) => host(url).includes("groq") ? hang(o) : geminiOk('{"ok":true,"texto":"t"}');
  const t0 = Date.now();
  const { meta } = await ai.run({ vision: true, system: "s", user: "u", image: { mime: "image/jpeg", base64: "AA" }, maxTokens: 50, totalMs: 5000, hedgeMs: 300 });
  assert.strictEqual(meta.provider, "gemini");
  assert(Date.now() - t0 >= 280 && Date.now() - t0 < 1500);
});

test("Todos colgados -> 504 por tiempo total y detalle con quién no respondió", async () => {
  const ai = setup(["GROQ_API_KEY", "GEMINI_API_KEY"], { AI_HEDGE_MS: "200" });
  global.fetch = async (url, o) => hang(o);
  await assert.rejects(ai.run({ vision: false, system: "s", user: "u", maxTokens: 50, totalMs: 700, hedgeMs: 200 }), e => {
    assert.strictEqual(e.status, 504); assert(/groq: 504 sin respuesta/.test(e.extra.detalle), e.extra.detalle); return true; });
});

test("Groq recibe reasoning_effort none + modelo vigente; si lo rechaza, reintenta sin él", async () => {
  const ai = setup(["GROQ_API_KEY"]);
  const bodies = [];
  global.fetch = async (url, o) => { const b = JSON.parse(o.body); bodies.push(b);
    return b.reasoning_effort ? J(400, { error: { message: "reasoning_effort is not supported with this model" } }) : openaiOk('{"ok":true,"texto":"t"}'); };
  const { json } = await ai.run({ vision: true, system: "s", user: "u", image: { mime: "image/jpeg", base64: "AA" }, maxTokens: 50, totalMs: 3000 });
  assert.strictEqual(json.texto, "t");
  assert.strictEqual(bodies[0].model, "qwen/qwen3.6-27b");
  assert.strictEqual(bodies[0].reasoning_effort, "none");
  assert(!("reasoning_effort" in bodies[1]));
});

test("JSON tolerante: <think>, ```json y texto alrededor", () => {
  const ai = setup([]);
  assert.deepStrictEqual(ai.parseJsonLoose('<think>pienso {a}</think>```json\n{"ok":true}\n```'), { ok: true });
  assert.deepStrictEqual(ai.parseJsonLoose('Claro: {"x":1} listo'), { x: 1 });
  assert.throws(() => ai.parseJsonLoose("nada"));
});

/* ---- handlers completos ---- */
function call(handler, body, method = "POST"){
  return new Promise(async resolve => {
    const res = { headers: {}, setHeader(k, v){ this.headers[k] = v; }, end(t){ resolve({ status: this.statusCode, body: JSON.parse(t) }); } };
    await handler({ method, body, headers: {} }, res);
  });
}
const TINY = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ";

test("/api/leer: validaciones y éxito", async () => {
  setup(["GROQ_API_KEY"]);
  global.fetch = async () => openaiOk('{"ok":true,"texto":"Deriva: f(x) = (3x^2+1)^4"}');
  const leer = require("../api/leer");
  assert.strictEqual((await call(leer, {}, "GET")).status, 405);
  assert.strictEqual((await call(leer, {})).status, 400);
  assert.strictEqual((await call(leer, { image: TINY, mime: "image/gif" })).status, 400);
  assert.strictEqual((await call(leer, { image: "A".repeat(6 * 1024 * 1024), mime: "image/jpeg" })).status, 413);
  const r = await call(leer, { image: TINY, mime: "image/jpeg" });
  assert.strictEqual(r.status, 200); assert.strictEqual(r.body.ok, true); assert(/3x\^2/.test(r.body.texto));
  global.fetch = async () => openaiOk('{"ok":false,"motivo":"Foto borrosa"}');
  const b = await call(leer, { image: TINY, mime: "image/jpeg" });
  assert.strictEqual(b.status, 200); assert.strictEqual(b.body.ok, false); assert.strictEqual(b.body.motivo, "Foto borrosa");
});

test("/api/variantes: validaciones, éxito, y entrega incompleta cuenta como fallo", async () => {
  setup(["GROQ_API_KEY", "GEMINI_API_KEY"], { AI_DEBUG: "1" });
  const variantes = require("../api/variantes");
  global.fetch = async () => openaiOk(OK_VAR);
  assert.strictEqual((await call(variantes, { texto: "x" })).status, 400);
  const r = await call(variantes, { texto: "Deriva: f(x) = (2x+1)^3", count: 2 });
  assert.strictEqual(r.status, 200); assert.strictEqual(r.body.variantes.length, 2);
  assert.deepStrictEqual(Object.keys(require("../api/variantes") && r.body.debug).includes("tried"), true);
  // Groq devuelve basura, Gemini bien -> debe usar Gemini
  global.fetch = async url => host(url).includes("groq") ? openaiOk('{"variantes":[]}') : geminiOk(OK_VAR);
  const r2 = await call(variantes, { texto: "Deriva: f(x) = (2x+1)^3", count: 4 });
  assert.strictEqual(r2.status, 200); assert.strictEqual(r2.body.debug.provider, "gemini");
});

test("Sin ninguna key -> error 500 explicativo", async () => {
  setup([]);
  const leer = require("../api/leer");
  const r = await call(leer, { image: TINY, mime: "image/jpeg" });
  assert.strictEqual(r.status, 500); assert(/proveedor/.test(r.body.error));
});
