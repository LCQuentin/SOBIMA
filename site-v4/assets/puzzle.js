/* Accueil : les quatre pièces du puzzle s'assemblent une fois, quand le puzzle entre à l'écran.
   Sans ce script, ou si le visiteur a demandé à réduire les mouvements, le puzzle reste affiché assemblé. */
(function () {
  var puzzle = document.querySelector(".puzzle");
  if (!puzzle || !("IntersectionObserver" in window)) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  puzzle.classList.add("puzzle--pret");
  var observateur = new IntersectionObserver(function (entrees) {
    if (entrees[0].isIntersecting) {
      puzzle.classList.add("puzzle--assemble");
      observateur.disconnect();
    }
  }, { threshold: 0.3 });
  observateur.observe(puzzle);
})();
