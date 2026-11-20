/* Dibujo de la burbuja de Física: masa central y una manzana que recorre una órbita elíptica punteada.
   Con "reducir movimiento" la manzana queda quieta en la órbita (sin <animateMotion>). */
const FIS_ART = (function(){
  let still = false;
  try{ still = matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){}
  const motion = still ? "" : '<animateMotion dur="9s" repeatCount="indefinite" path="M245 104A112 48 0 1 1 21 104A112 48 0 1 1 245 104"/>';
  const at = still ? ' transform="translate(245 104)"' : "";
  const svg = "<svg class=\"m-art m-fis-art\" aria-hidden=\"true\" viewBox=\"0 0 266 266\"><defs><radialGradient id=\"fisg\"><stop offset=\"0\" stop-color=\"#8AA4FF\" stop-opacity=\".9\"/><stop offset=\"1\" stop-color=\"#8AA4FF\" stop-opacity=\"0\"/></radialGradient></defs><circle cx=\"133\" cy=\"104\" r=\"24\" fill=\"url(#fisg)\"/><circle cx=\"133\" cy=\"104\" r=\"8\" fill=\"#8AA4FF\"/><g transform=\"rotate(-22 133 104)\"><ellipse cx=\"133\" cy=\"104\" rx=\"112\" ry=\"48\" fill=\"none\" stroke=\"#8AA4FF\" stroke-opacity=\".55\" stroke-width=\"1.5\" stroke-dasharray=\"1 4.5\" stroke-linecap=\"round\"/><g%AT%>%MOTION%<g transform=\"rotate(22) scale(.8)\"><path d=\"M0 -6C-9 -12 -18 -4 -15 6C-12 16 -5 18 0 15C5 18 12 16 15 6C18 -4 9 -12 0 -6Z\" fill=\"#FF6B6B\"/><ellipse cx=\"-7\" cy=\"-1\" rx=\"3\" ry=\"5\" fill=\"#fff\" fill-opacity=\".35\" transform=\"rotate(20 -7 -1)\"/><path d=\"M0 -6Q1 -12 4 -15\" stroke=\"#C99A5B\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><ellipse cx=\"9\" cy=\"-11\" rx=\"6\" ry=\"3\" fill=\"#7CF0C9\" transform=\"rotate(-30 9 -11)\"/></g></g></g></svg>";
  return { art: svg.replace("%AT%", at).replace("%MOTION%", motion) };
})();
