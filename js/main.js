document.addEventListener("DOMContentLoaded", ()=>{
  Engine.load();
  UI.init();
  Pay.handleReturn().then(r=>{
    if(!r) return;
    UI.showPayResult(r);
    // Si el pago se inició desde el Arcade, volver allí al aprobarse
    try{
      const to = localStorage.getItem("dojo-after-pay");
      localStorage.removeItem("dojo-after-pay");
      if(r.ok && to) setTimeout(()=>{ location.href = to; }, 2000);
    }catch(e){}
  });

  document.querySelector(".brand").addEventListener("click", (e)=>{
    if(e.target.closest("#btn-theme")) return;
    UI.showHome();
  });

  document.getElementById("btn-theme").addEventListener("click", ()=>{
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try{ localStorage.setItem("dojo-theme", next); }catch(e){}
  });

  // Enter = Verificar / Siguiente (si no hay un botón enfocado)
  document.addEventListener("keydown", (e)=>{
    if(e.key !== "Enter" || e.target.closest("button")) return;
    const b = document.querySelector("#action-row #btn-check, #action-row .btn-next");
    if(b){ e.preventDefault(); b.click(); }
  });
});
