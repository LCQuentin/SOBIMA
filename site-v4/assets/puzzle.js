/* Accueil :
   1. Logo en traits : les quatre pièces s'assemblent quand la section entre à l'écran.
   2. Frise des six étapes : chaque pièce s'emboîte quand elle est bien visible à l'écran.
   Les deux animations se rejouent à chaque retour à l'écran, en descendant comme en remontant (retour de Redoine du 2026-10-28) :
   la classe est retirée quand l'élément sort complètement de l'écran.
   Sans ce script, ou si le visiteur a demandé à réduire les mouvements, le logo et la frise restent assemblés. */
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  function rejouer(elements, classePrete, classeJouee, options) {
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.intersectionRatio >= 0.6) entree.target.classList.add(classeJouee);
        else if (!entree.isIntersecting) entree.target.classList.remove(classeJouee);
      });
    }, options);
    elements.forEach(function (element) {
      element.classList.add(classePrete);
      observateur.observe(element);
    });
  }

  var puzzle = document.querySelector(".puzzle");
  if (puzzle) rejouer([puzzle], "puzzle--pret", "puzzle--assemble", { threshold: [0, 0.6] });

  var etapes = document.querySelectorAll(".frise li");
  if (etapes.length) rejouer(Array.prototype.slice.call(etapes), "frise__etape--prete", "frise__etape--posee", { threshold: [0, 0.6], rootMargin: "0px 0px -15% 0px" });
})();
