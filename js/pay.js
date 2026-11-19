/* =========================================================
   Derivadas Dojo — Dojo Pro (pago SIMULADO con Mercado Pago)
   Flujo: botón → /api/create-preference → checkout de Mercado
   Pro (modo prueba) → vuelve a la app → /api/verify-payment →
   se guarda el comprobante en localStorage.
   Nunca se cobra dinero real: el servidor solo acepta el token
   de una cuenta de prueba (ver lib/mp.js).
   ========================================================= */

const Pay = {
  KEY: "derivadas-dojo-pro-v1",
  PENDING: "derivadas-dojo-pending-ref",
  PRICE_LABEL: "$49 MXN",

  receipt(){
    try{ return JSON.parse(localStorage.getItem(this.KEY)); }catch(e){ return null; }
  },

  // Usa esto donde quieras bloquear/desbloquear algo: if(Pay.isPro()) { ... }
  isPro(){
    const r = this.receipt();
    return !!(r && r.paymentId);
  },

  async start(){
    if(location.protocol === "file:"){
      throw new Error("El pago necesita el sitio publicado en Vercel o `vercel dev` (no funciona abriendo index.html con doble clic).");
    }
    const r = await fetch("/api/create-preference", { method: "POST" });
    const d = await r.json().catch(()=> ({}));
    if(!r.ok || !d.url) throw new Error(d.error || "No se pudo iniciar el pago.");
    localStorage.setItem(this.PENDING, d.ref);
    location.href = d.url;
  },

  // Se llama al cargar la app. Devuelve null si no venimos de un pago.
  async handleReturn(){
    const q = new URLSearchParams(location.search);
    if(!q.has("pago")) return null;

    const flag = q.get("pago");
    const ref = q.get("external_reference") || localStorage.getItem(this.PENDING) || "";
    const paymentId = q.get("payment_id") || q.get("collection_id") || "";
    history.replaceState(null, "", location.pathname); // limpia la URL

    if(flag === "error") return { ok:false, status:"rejected" };
    if(!paymentId || !ref) return { ok:false, status:"missing" };

    try{
      const r = await fetch(`/api/verify-payment?payment_id=${encodeURIComponent(paymentId)}&ref=${encodeURIComponent(ref)}`);
      const d = await r.json();
      if(d.ok){
        localStorage.setItem(this.KEY, JSON.stringify({ paymentId: d.paymentId, amount: d.amount, currency: d.currency, date: new Date().toISOString() }));
        localStorage.removeItem(this.PENDING);
        return { ok:true, paymentId: d.paymentId };
      }
      return { ok:false, status: d.status || "error", message: d.error };
    }catch(e){
      return { ok:false, status:"error", message:"No se pudo verificar el pago." };
    }
  },

  cardHTML(){
    if(this.isPro()){
      const r = this.receipt();
      return `
      <div class="lesson-card pay-card pay-active">
        <div class="pay-head"><h2>✓ Dojo Pro activo</h2><span class="sim-tag">PAGO SIMULADO</span></div>
        <p class="lead">Gracias por apoyar el Dojo. Comprobante de prueba #${r.paymentId}.</p>
      </div>`;
    }
    return `
      <div class="lesson-card pay-card">
        <div class="pay-head"><h2>Dojo Pro</h2><span class="sim-tag">PAGO SIMULADO</span></div>
        <p class="lead">Apoya el proyecto y activa tu insignia Pro. Es una compra de demostración:
        pasas por el checkout real de Mercado Pago, pero con cuentas y tarjetas de prueba.
        <strong>No se cobra dinero real.</strong></p>
        <div class="action-row">
          <button class="btn btn-primary" id="btn-pay">Pagar ${this.PRICE_LABEL} con Mercado Pago</button>
        </div>
        <p class="pay-fine" id="pay-msg"></p>
      </div>`;
  },

  bind(){
    const btn = document.getElementById("btn-pay");
    if(!btn) return;
    btn.addEventListener("click", async ()=>{
      const msg = document.getElementById("pay-msg");
      btn.disabled = true; msg.textContent = "Conectando con Mercado Pago…";
      try{ await this.start(); }
      catch(e){ btn.disabled = false; msg.textContent = e.message; msg.classList.add("pay-err"); }
    });
  }
};
