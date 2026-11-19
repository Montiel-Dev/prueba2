document.addEventListener("DOMContentLoaded", ()=>{
  Engine.load();
  Plans.load();
  UI.init();
  MapScreen.init();

  document.getElementById("btn-map").addEventListener("click", ()=> MapScreen.show());

  document.querySelector(".brand").addEventListener("click", (e)=>{
    if(e.target.closest("#btn-theme")) return;
    UI.showHome();
  });

  document.getElementById("btn-theme").addEventListener("click", ()=>{
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try{ localStorage.setItem("dojo-theme", next); }catch(e){}
  });

  // La app abre en el mapa de materias
  MapScreen.show();

  // Primera vez: pregunta la institución (plan de estudios) encima del mapa
  if(!Plans.sel) Plans.openWizard(()=>{ UI.renderSidebar(); UI.showHome(); });

  // Al volver del checkout de Mercado Pago (modo "mercadopago"): sale del mapa y muestra el resultado
  Pay.handleReturn().then(r=>{
    if(!r) return;
    MapScreen.hide();
    UI.showPayResult(r);
    // Si el pago se inició desde el Arcade, volver allí al aprobarse
    try{
      const to = localStorage.getItem("dojo-after-pay");
      localStorage.removeItem("dojo-after-pay");
      if(r.ok && to) setTimeout(()=>{ location.href = to; }, 2000);
    }catch(e){}
  });

  // Enter = Verificar / Siguiente (si no hay un botón enfocado)
  document.addEventListener("keydown", (e)=>{
    if(e.key !== "Enter" || e.target.closest("button")) return;
    const b = document.querySelector("#action-row #btn-check, #action-row .btn-next");
    if(b){ e.preventDefault(); b.click(); }
  });
});
