/* Pase "Pro" firmado + límite de uso. Solo servidor.
   Variables de entorno (Vercel):
     PRO_SECRET     texto largo y aleatorio (el "sello"). Obligatoria para emitir/validar pases.
     PRO_FREE_TEST  "1" = /api/pro-activar da el pase GRATIS (para probar/demo). Quítala para exigir pago verificado.
     PRO_REQUIRED   (ya no se usa) el Escáner es gratis para todos, esté o no esta variable.
     RATE_MAX / RATE_WINDOW_S  límite por IP (por defecto 30 peticiones cada 600 s). */
const crypto = require("crypto");
const { httpError } = require("./ai");

const DAYS = 30;
const b64 = b => Buffer.from(b).toString("base64url");
const secret = () => {
  const s = process.env.PRO_SECRET;
  if(!s || s.length < 16) throw httpError(500, "Falta PRO_SECRET en Vercel (mínimo 16 caracteres).");
  return s;
};
const mac = data => crypto.createHmac("sha256", secret()).update(data).digest("base64url");

function issue(days = DAYS){
  const body = b64(JSON.stringify({ exp: Date.now() + days * 86400000 }));
  return { token: body + "." + mac(body), exp: Date.now() + days * 86400000 };
}

function verify(token){
  try{
    const [body, sig] = String(token || "").split(".");
    if(!body || !sig) return null;
    const ok = mac(body), a = Buffer.from(sig), b = Buffer.from(ok);
    if(a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const p = JSON.parse(Buffer.from(body, "base64url").toString());
    return p.exp > Date.now() ? p : null;
  }catch(e){ return null; }
}

/* Límite por IP en memoria (mejor esfuerzo: cada instancia serverless lleva su propia cuenta). */
const hits = new Map();
function limited(req){
  const max = parseInt(process.env.RATE_MAX, 10) || 30;
  const win = (parseInt(process.env.RATE_WINDOW_S, 10) || 600) * 1000;
  const ip = String((req.headers || {})["x-forwarded-for"] || "").split(",")[0].trim() || "?";
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < win);
  arr.push(now); hits.set(ip, arr);
  if(hits.size > 5000) for(const [k, v] of hits) if(!v.length || now - v[v.length - 1] > win) hits.delete(k);
  return arr.length > max;
}

/* Solo límite por IP (sin exigir Pro). Úsalo en endpoints públicos como pro-activar o el diagnóstico. */
function rateLimit(req){
  if(limited(req)) throw httpError(429, "Demasiadas peticiones seguidas. Espera unos minutos.");
}

/* Úsalo al inicio de cada endpoint de IA. Lanza error 429 si se pasa del límite.
   El Escáner es GRATIS para todos: ya no exige pase Pro (PRO_REQUIRED se ignora). */
function guard(req){
  if(limited(req)) throw httpError(429, "Demasiadas peticiones seguidas. Espera unos minutos.");
}

module.exports = { issue, verify, guard, rateLimit, DAYS };
